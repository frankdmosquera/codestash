import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, organization } from "better-auth/plugins";
import { adminAc } from "better-auth/plugins/admin/access";
import {
  defaultAc as orgAc,
  adminAc as orgAdminAc,
  memberAc as orgMemberAc,
} from "better-auth/plugins/organization/access";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";

const baseURL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Same permissions as better-auth's built-in ownerAc, minus
// "delete" on `organization` — see md-docs/ROLES-AND-BILLING-PLAN.md #1:
// only the platform superadmin (the `admin` plugin's role above) can
// delete an org, not even its own owner. This is the one deliberate
// override of better-auth's defaults; admin/member keep their defaults
// (admin already can't delete by default, member never could).
const orgOwnerAcNoDelete = orgAc.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
});

export const auth = betterAuth({
  baseURL,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  emailAndPassword: {
    enabled: true,
  },

  plugins: [
    // Platform-level role — this is the "super admin" (you). Everyone
    // else defaults to the plain "user" role and only ever gets access
    // through organization membership below.
    admin({
      defaultRole: "user",
      adminRoles: ["superadmin"],
      roles: { superadmin: adminAc },
    }),

    // Per-workspace roles. Built-in "owner"/"admin"/"member" map to our
    // three tiers: owner = paying admin who created the workspace,
    // admin = sub-admin they invite (can manage members/invitations but
    // can't delete the org or remove the owner — built-in behavior),
    // member = non-paying guest editor. The "can edit up to 5 records,
    // can't invite anyone" limits for member are enforced in app code,
    // not here — better-auth's roles gate *actions*, not per-user counts.
    // `roles` below overrides the built-in owner so it can't delete the
    // org either — see orgOwnerAcNoDelete above.
    // TODO: sendInvitationEmail only logs to the server console right now —
    // same placeholder situation as emailOTP below, until a real email
    // provider is wired up. Better Auth doesn't generate the accept URL
    // itself, so we build it here pointing at our own accept page.
    organization({
      allowUserToCreateOrganization: true,
      roles: {
        owner: orgOwnerAcNoDelete,
        admin: orgAdminAc,
        member: orgMemberAc,
      },
      sendInvitationEmail: async (data) => {
        const acceptUrl = `${baseURL}/invite/accept?id=${data.id}`;
        console.log(
          `[invite] ${data.email} invited to "${data.organization.name}" as ${data.role}: ${acceptUrl}`,
        );
      },
      // Groundwork for a future free-vs-paid category cap (and similar
      // plan-gated limits) — not enforced anywhere yet, no billing wired
      // up. `input: false` means it's never settable through the client
      // API; only our own server code should ever change it.
      schema: {
        organization: {
          additionalFields: {
            plan: {
              type: "string",
              required: false,
              input: false,
              defaultValue: "free",
            },
          },
        },
      },
    }),

    // "Just email" sign-in — a 6-digit code, no password.
    // TODO: sendVerificationOTP only logs to the server console right now —
    // there's no email provider wired up yet. Swap this for a real sender
    // (Resend, etc.) before this ever reaches a real user; until then, get
    // the code from the dev server's terminal output.
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOTP: async ({ email, otp, type }) => {
        console.log(`[email-otp] ${type} code for ${email}: ${otp}`);
      },
    }),

    // Must be listed last — patches cookie handling into the endpoints
    // registered by the plugins above it.
    nextCookies(),
  ],
});
