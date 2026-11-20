import { App } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { beforeAll, describe, expect, it } from "vitest";
import { config } from "../lib/config";
import { SiteStack } from "../lib/site-stack";

let template: Template;

beforeAll(() => {
  const app = new App();
  const stack = new SiteStack(app, "TestSite", {
    env: { account: config.account, region: config.region },
    githubRepo: config.githubRepo,
    githubOidcRepo: config.githubOidcRepo,
    deployBranch: config.deployBranch,
    resourceTags: config.tags,
  });
  template = Template.fromStack(stack);
});

describe("S3 bucket", () => {
  it("blocks all public access and encrypts at rest", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
        ],
      },
    });
  });

  it("denies non-HTTPS requests", () => {
    template.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Deny",
            Condition: { Bool: { "aws:SecureTransport": "false" } },
          }),
        ]),
      },
    });
  });

  it("is retained if the stack is deleted", () => {
    template.hasResource("AWS::S3::Bucket", { DeletionPolicy: "Retain" });
  });

  it("is tagged for cost tracking", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      Tags: Match.arrayWith([{ Key: "project", Value: "casa-calderon" }]),
    });
  });
});

describe("CloudFront distribution", () => {
  it("redirects to HTTPS, serves index.html and uses the cheapest price class", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: "index.html",
        PriceClass: "PriceClass_100",
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: "redirect-to-https",
          FunctionAssociations: [
            Match.objectLike({ EventType: "viewer-request" }),
          ],
        }),
      }),
    });
  });

  it("reads from S3 through Origin Access Control", () => {
    template.resourceCountIs("AWS::CloudFront::OriginAccessControl", 1);
  });

  it("adds security headers including a CSP", () => {
    template.hasResourceProperties("AWS::CloudFront::ResponseHeadersPolicy", {
      ResponseHeadersPolicyConfig: Match.objectLike({
        SecurityHeadersConfig: Match.objectLike({
          ContentSecurityPolicy: Match.objectLike({
            ContentSecurityPolicy: Match.stringLikeRegexp(
              "frame-ancestors 'none'",
            ),
          }),
          StrictTransportSecurity: Match.objectLike({
            AccessControlMaxAgeSec: 31536000,
          }),
        }),
      }),
    });
  });
});

describe("GitHub deploy role", () => {
  it("can only be assumed from the main branch of our repo", () => {
    template.hasResourceProperties("AWS::IAM::Role", {
      RoleName: "casa-calderon-github-deploy",
      AssumeRolePolicyDocument: {
        Statement: [
          Match.objectLike({
            Action: "sts:AssumeRoleWithWebIdentity",
            Condition: {
              StringEquals: {
                "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                // GitHub immutable subject: owner@ownerId/repo@repoId
                "token.actions.githubusercontent.com:sub":
                  "repo:TheKingSnoop@138521589/casa-calderon@1456781007:ref:refs/heads/main",
              },
            },
          }),
        ],
      },
    });
  });

  it("grants only the S3 and CloudFront actions a deploy needs", () => {
    const policies = template.findResources("AWS::IAM::Policy");
    const actions = Object.values(policies)
      .flatMap(
        (p) =>
          p.Properties.PolicyDocument.Statement as {
            Action: string | string[];
          }[],
      )
      .flatMap((s) => [s.Action].flat())
      .sort();
    expect(actions).toEqual([
      "cloudfront:CreateInvalidation",
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:ListBucket",
      "s3:PutObject",
    ]);
  });

  it("has no wildcard actions or wildcard resources", () => {
    const policies = template.findResources("AWS::IAM::Policy");
    const statements = Object.values(policies).flatMap(
      (p) => p.Properties.PolicyDocument.Statement as Record<string, unknown>[],
    );
    expect(statements.length).toBeGreaterThan(0);
    for (const s of statements) {
      expect([s.Action].flat()).not.toContain("*");
      expect([s.Resource].flat()).not.toContain("*");
    }
  });
});
