import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="container py-12 max-w-md mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignInForm />
          </Suspense>
          <p className="text-sm text-center text-muted-foreground mt-6">
            New here?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
