import { createAuthClient } from "better-auth/react";
import {
  adminClient,
  emailOTPClient,
  organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), organizationClient(), emailOTPClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
