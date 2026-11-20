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
  /**
   * The repo as it appears in GitHub's OIDC `sub` claim. This repo uses GitHub's
   * *immutable subject* format, `owner@ownerId/repo@repoId`. The numeric IDs are
   * never reused, so a deleted/renamed-and-recreated repo with the same name can't
   * assume our role. Check with:
   *   gh api repos/TheKingSnoop/casa-calderon/actions/oidc/customization/sub
   */
  githubOidcRepo: "TheKingSnoop@138521589/casa-calderon@1456781007",
  deployBranch: "main",
  /** Applied to every taggable resource, for cost tracking in Cost Explorer. */
  tags: { project: "casa-calderon" },
} as const;
