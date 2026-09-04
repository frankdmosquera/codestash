// One-time fix: frankdmosquera@gmail.com had a `user.role = "admin"` value
// left over from testing, but "admin" isn't a recognized platform adminRole
// (only "superadmin" is, see lib/auth.ts) so it did nothing — and the
// account had no `member` row in any org at all, meaning it had zero access
// to Codestash despite looking like an admin account. This adds the missing
// org membership via better-auth's own `addMember` API (see
// seed-codestash-owner-membership.ts for the same pattern) and clears the
// stray platform-level role back to the real default.
// Run with: npx tsx --env-file=.env.local scripts/add-frank-admin-membership.ts
//
// Safe to re-run: does nothing if the membership already exists; the role
// clear is idempotent.

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

  const frank = await db.query.user.findFirst({
    where: eq(user.email, "frankdmosquera@gmail.com"),
  });
  if (!frank) {
    throw new Error('No user with email "frankdmosquera@gmail.com" found.');
  }

  const existing = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.userId, frank.id)),
  });

  if (existing) {
    console.log("Membership already exists — leaving role as-is.");
  } else {
    await auth.api.addMember({
      body: {
        userId: frank.id,
        organizationId: org.id,
        role: "admin",
      },
    });
    console.log(`Added ${frank.email} as admin of "${org.name}".`);
  }

  if (frank.role !== "user") {
    await db.update(user).set({ role: "user" }).where(eq(user.id, frank.id));
    console.log(`Cleared stray platform role ("${frank.role}") back to "user".`);
  } else {
    console.log('Platform role already "user" — nothing to clear.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
