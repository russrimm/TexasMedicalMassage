import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="container py-12 max-w-md mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Self-serve reset is coming soon. In the meantime, contact support to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/signin" className="text-primary hover:underline text-sm">
            ← Back to sign in
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
