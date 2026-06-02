import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = { title: "Sign up" };

export default function SignUpPage() {
  return (
    <div className="container py-12 max-w-md mx-auto w-full">
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Free forever. Takes 30 seconds.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignUpForm />
          </Suspense>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
