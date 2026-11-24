import * as path from "node:path";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  Tags,
  type StackProps,
} from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";
import * as headers from "./security-headers";

export interface SiteStackProps extends StackProps {
  /** "owner/repo" allowed to deploy via GitHub OIDC */
  readonly githubRepo: string;
  /** The repo as written in GitHub's OIDC `sub` claim, e.g. "owner@123/repo@456" */
  readonly githubOidcRepo: string;
  /** Branch allowed to deploy, e.g. "main" */
  readonly deployBranch: string;
  /** Tags added to every taggable resource */
  readonly resourceTags: Record<string, string>;
}

/**
 * Static hosting for the Casa Calderon site:
 *
 *   Visitor --HTTPS--> CloudFront (+ URL function, security headers)
 *                         --OAC--> private S3 bucket  <--sync-- GitHub Actions (OIDC role)
 */
export class SiteStack extends Stack {
  constructor(scope: Construct, id: string, props: SiteStackProps) {
    super(scope, id, props);

    for (const [key, value] of Object.entries(props.resourceTags)) {
      Tags.of(this).add(key, value);
    }

    // ── 1. Private S3 bucket: holds the files from `next build` (out/) ──────
    // Nobody can read it directly; only CloudFront (via OAC) can.
    const bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED, // free; no KMS key costs
      enforceSSL: true, // bucket policy denies any non-HTTPS request
      versioned: false, // the site is rebuildable from Git; avoids paying for old versions
      // Keep the bucket if the stack is ever deleted (safer default).
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ── 2. CloudFront Function: clean URLs for the static export ────────────
    const urlRewrite = new cloudfront.Function(this, "UrlRewriteFunction", {
      code: cloudfront.FunctionCode.fromFile({
        filePath: path.join(__dirname, "functions", "url-rewrite.js"),
      }),
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      comment: "Map /path/ to /path/index.html; redirect /path to /path/",
    });

    // ── 3. Security headers added to every response ─────────────────────────
    const securityHeaders = new cloudfront.ResponseHeadersPolicy(
      this,
      "SecurityHeaders",
      {
        comment: "Casa Calderon security headers",
        securityHeadersBehavior: {
          // Values live in security-headers.ts, shared with the local test
          // server so end-to-end tests run under the production CSP.
          contentSecurityPolicy: {
            contentSecurityPolicy: headers.contentSecurityPolicy,
            override: true,
          },
          strictTransportSecurity: {
            accessControlMaxAge: Duration.seconds(headers.hstsMaxAgeSeconds),
            includeSubdomains: true,
            override: true,
          },
          contentTypeOptions: { override: true },
          frameOptions: {
            frameOption: cloudfront.HeadersFrameOption.DENY,
            override: true,
          },
          referrerPolicy: {
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
            override: true,
          },
        },
        customHeadersBehavior: {
          customHeaders: [
            {
              header: "Permissions-Policy",
              value: headers.permissionsPolicy,
              override: true,
            },
          ],
        },
      },
    );

    // ── 4. CloudFront distribution: HTTPS + global cache ────────────────────
    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      comment: "Casa Calderon static site",
      defaultRootObject: "index.html",
      defaultBehavior: {
        // Origin Access Control: CloudFront signs requests to S3, and the
        // bucket policy only allows this distribution.
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        compress: true,
        functionAssociations: [
          {
            function: urlRewrite,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // S3 (without list permission) answers 403 for missing files: show our 404 page.
      errorResponses: [403, 404].map((httpStatus) => ({
        httpStatus,
        responseHttpStatus: 404,
        responsePagePath: "/404.html",
        ttl: Duration.minutes(5),
      })),
      // Cheapest tier: edge locations in Europe + North America.
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableLogging: false, // avoids log storage costs; revisit post-launch
    });

    // ── 5. GitHub Actions → AWS without stored keys (OIDC) ──────────────────
    // Account-wide: only ONE provider per URL can exist. Other projects in this
    // account that deploy from GitHub should reference this one, not create another.
    const githubOidc = new iam.OidcProviderNative(this, "GitHubOidcProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    });

    const deployRole = new iam.Role(this, "GitHubDeployRole", {
      roleName: "casa-calderon-github-deploy",
      description: `Deploys the Casa Calderon site from ${props.githubRepo}@${props.deployBranch}`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(
        githubOidc.openIdConnectProviderArn,
        {
          StringEquals: {
            "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
            // Only workflows running on this exact repo + branch can assume the role.
            "token.actions.githubusercontent.com:sub": `repo:${props.githubOidcRepo}:ref:refs/heads/${props.deployBranch}`,
          },
        },
      ),
    });

    // Least privilege: exactly what `aws s3 sync --delete` needs on THIS bucket,
    // plus invalidating THIS distribution's cache. Nothing else.
    // (bucket.grantReadWrite() would also grant object-lock and GetBucket* actions.)
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "ListSiteBucket",
        actions: ["s3:ListBucket"],
        resources: [bucket.bucketArn],
      }),
    );
    deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "SyncSiteObjects",
        actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
        resources: [bucket.arnForObjects("*")],
      }),
    );
    distribution.grantCreateInvalidation(deployRole);

    // ── Outputs: values the deploy workflow (B6) needs ─────────────────────
    new CfnOutput(this, "SiteUrl", {
      value: `https://${distribution.distributionDomainName}`,
    });
    new CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new CfnOutput(this, "DistributionId", {
      value: distribution.distributionId,
    });
    new CfnOutput(this, "DeployRoleArn", { value: deployRole.roleArn });
  }
}
