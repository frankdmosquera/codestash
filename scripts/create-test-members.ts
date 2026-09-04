// Creates 3 throwaway local accounts and adds them as "member" of Codestash,
// for exercising the bottom permission tier (requireOrgRole) end-to-end.
// Uses better-auth's own sign-up + addMember APIs, not raw inserts — same
// pattern as seed-codestash-owner-membership.ts and
// add-frank-admin-membership.ts. Credentials read from env
// (TEST_MEMBER_{1,2,3}_EMAIL/PASSWORD — see .env.example).
// Run with: npx tsx --env-file=.env.local scripts/create-test-members.ts
//
// Safe to re-run: skips sign-up for an email that already exists, and skips
// addMember if the membership already exists.

import { eq, and } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { organization, member, user } from "../lib/db/schema/auth-schema";

const TEST_MEMBERS = [1, 2, 3].map((n) => ({
  name: `Test Member ${n}`,
  email: process.env[`TEST_MEMBER_${n}_EMAIL`],
  password: process.env[`TEST_MEMBER_${n}_PASSWORD`],
}));

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) {
    throw new Error('No organization named "Codestash" found.');
  }

  for (const { name, email, password } of TEST_MEMBERS) {
    if (!email || !password) {
      throw new Error(
        `Missing email/password for "${name}" — check .env.local against .env.example.`,
      );
    }

    let account = await db.query.user.findFirst({ where: eq(user.email, email) });

    if (!account) {
      const result = await auth.api.signUpEmail({ body: { name, email, password } });
      account = await db.query.user.findFirst({ where: eq(user.id, result.user.id) });
      console.log(`Signed up ${email}.`);
    } else {
      console.log(`${email} already exists — skipping sign-up.`);
    }

    if (!account) {
      throw new Error(`Sign-up for ${email} did not produce a user row.`);
    }

    const existingMembership = await db.query.member.findFirst({
      where: and(eq(member.organizationId, org.id), eq(member.userId, account.id)),
    });

    if (existingMembership) {
      console.log(`${email} is already a member of "${org.name}" — skipping.`);
      continue;
    }

    await auth.api.addMember({
      body: { userId: account.id, organizationId: org.id, role: "member" },
    });
    console.log(`Added ${email} as member of "${org.name}".`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
