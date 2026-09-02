import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailOtpForm } from "@/components/auth/email-otp-form";

export default function SignInOtpPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in with a code</CardTitle>
      </CardHeader>
      <CardContent>
        <EmailOtpForm />
      </CardContent>
      <CardContent className="flex items-center justify-center pt-0">
        <Link
          href="/sign-in"
          className="text-sm text-primary underline underline-offset-4"
        >
          Use your password instead
        </Link>
      </CardContent>
    </Card>
  );
}
