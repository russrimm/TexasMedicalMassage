"use client";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signupAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export function SignUpForm() {
  const params = useSearchParams();
  const initialRole = (params.get("role") === "business" ? "business" : "therapist") as
    | "therapist"
    | "business";
  const [state, formAction] = useFormState(signupAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label>I am a…</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="border rounded-md p-3 flex items-center gap-2 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="role"
              value="therapist"
              defaultChecked={initialRole === "therapist"}
              className="accent-primary"
            />
            <span className="text-sm font-medium">Therapist</span>
          </label>
          <label className="border rounded-md p-3 flex items-center gap-2 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="role"
              value="business"
              defaultChecked={initialRole === "business"}
              className="accent-primary"
            />
            <span className="text-sm font-medium">Business</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required minLength={2} autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
