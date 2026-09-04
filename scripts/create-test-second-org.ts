// Creates a throwaway local account that owns its own second organization
// ("Test Org 2", plan "A"), for verifying org isolation — that its owner
// can't see Codestash's members/categories/content and vice versa. Uses
// better-auth's own sign-up + createOrganization APIs (same pattern as the
// other scripts/create-test-*.ts / add-*-membership.ts scripts), which
// creates the org and its owner membership atomically. The plan field is
// then set directly via a scalar update — createOrganization's body doesn't
// accept `plan` (it's `input: false` in lib/auth.ts), and there's no
// checkout flow yet to set it through.
// Run with: npx tsx --env-file=.env.local scripts/create-test-second-org.ts
//
// Safe to re-run: skips sign-up/org-creation if they already exist.

import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { organization, user } from "../lib/db/schema/auth-schema";

const ORG_NAME = "Test Org 2";
const ORG_SLUG = "test-org-2";
const PLAN = "A";

async function main() {
  const email = process.env.TEST_OWNER_2_EMAIL;
  const password = process.env.TEST_OWNER_2_PASSWORD;
  if (!email || !password) {
    throw new Error("Missing TEST_OWNER_2_EMAIL/PASSWORD — check .env.local against .env.example.");
  }

  let account = await db.query.user.findFirst({ where: eq(user.email, email) });

  if (!account) {
    const result = await auth.api.signUpEmail({
      body: { name: "Test Owner 2", email, password },
    });
    account = await db.query.user.findFirst({ where: eq(user.id, result.user.id) });
    console.log(`Signed up ${email}.`);
  } else {
    console.log(`${email} already exists — skipping sign-up.`);
  }
  if (!account) {
    throw new Error(`Sign-up for ${email} did not produce a user row.`);
  }

  let org = await db.query.organization.findFirst({ where: eq(organization.slug, ORG_SLUG) });

  if (!org) {
    await auth.api.createOrganization({
      body: { name: ORG_NAME, slug: ORG_SLUG, userId: account.id },
    });
    org = await db.query.organization.findFirst({ where: eq(organization.slug, ORG_SLUG) });
    console.log(`Created "${ORG_NAME}" owned by ${email}.`);
  } else {
    console.log(`"${ORG_NAME}" already exists — skipping creation.`);
  }
  if (!org) {
    throw new Error(`Creation of "${ORG_NAME}" did not produce an organization row.`);
  }

  if (org.plan !== PLAN) {
    await db.update(organization).set({ plan: PLAN }).where(eq(organization.id, org.id));
    console.log(`Set "${ORG_NAME}"'s plan to "${PLAN}".`);
  } else {
    console.log(`"${ORG_NAME}" is already on plan "${PLAN}".`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
