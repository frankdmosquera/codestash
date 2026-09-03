// One-time fix: the "Codestash" organization was created via a raw DB
// insert rather than `authClient.organization.create`, which skipped the
// step that normally makes the creator a member. With zero rows in
// `member`, no session can ever auto-select this org as active (see
// `use-auto-active-organization.ts`), so the DB-backed sortable category
// list never renders — everyone falls back to the static, non-draggable
// list. This adds the missing owner membership via better-auth's own
// `addMember` API rather than a raw insert.
// Run with: npx tsx --env-file=.env.local scripts/seed-codestash-owner-membership.ts
//
// Safe to re-run: does nothing if the membership already exists.

import { eq, and } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db } from "../lib/db";
import { organization, member, user } from "../lib/db/schema/auth-schema";

async function main() {
  const org = await db.query.organization.findFirst({
    where: eq(organization.name, "Codestash"),
  });
  if (!org) {
    throw new Error('No organization named "Codestash" found.');
  }

  const owner = await db.query.user.findFirst({
    where: eq(user.email, "heguer76@gmail.com"),
  });
  if (!owner) {
    throw new Error('No user with email "heguer76@gmail.com" found.');
  }

  const existing = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.userId, owner.id)),
  });
  if (existing) {
    console.log("Membership already exists — nothing to do.");
    return;
  }

  await auth.api.addMember({
    body: {
      userId: owner.id,
      organizationId: org.id,
      role: "owner",
    },
  });

  console.log(`Added ${owner.email} as owner of "${org.name}".`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
