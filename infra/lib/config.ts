/**
 * Single source of truth for where and how Casa Calderon is deployed.
 * See docs/decisions/0003-hosting-on-aws.md.
 */
export const config = {
  /** The `aws-calderon` account. Account IDs are identifiers, not secrets. */
  account: "804450520614",
  /** London. (CloudFront itself is global.) */
  region: "eu-west-2",
  /** Only this repo + branch may assume the deploy role (GitHub OIDC). */
  githubRepo: "TheKingSnoop/casa-calderon",
  deployBranch: "main",
  /** Applied to every taggable resource, for cost tracking in Cost Explorer. */
  tags: { project: "casa-calderon" },
} as const;
