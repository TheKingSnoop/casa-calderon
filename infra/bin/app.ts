#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { config } from "../lib/config";
import { SiteStack } from "../lib/site-stack";

const app = new App();

new SiteStack(app, "CasaCalderonSite", {
  // Explicit account + region: the stack can only ever deploy to aws-calderon in
  // London, whichever credentials happen to be active.
  env: { account: config.account, region: config.region },
  description:
    "Casa Calderon static site: S3 + CloudFront + GitHub OIDC deploy role",
  // Blocks `cdk destroy` / stack deletion until protection is turned off on purpose.
  terminationProtection: true,
  githubRepo: config.githubRepo,
  deployBranch: config.deployBranch,
  resourceTags: config.tags,
});
