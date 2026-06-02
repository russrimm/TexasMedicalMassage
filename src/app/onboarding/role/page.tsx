import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setRoleAction } from "@/server/actions/profile";
import { UserCircle2, Building2 } from "lucide-react";

export default async function OnboardingRolePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role) redirect("/onboarding/profile");

  return (
    <div className="container py-12 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-center mb-2">Welcome!</h1>
      <p className="text-center text-muted-foreground mb-8">
        Are you a therapist looking for work, or a business looking to hire?
      </p>

      <form action={setRoleAction} className="grid sm:grid-cols-2 gap-4">
        <RoleCard role="therapist" icon={<UserCircle2 className="h-8 w-8" />} title="I'm a Therapist" />
        <RoleCard role="business" icon={<Building2 className="h-8 w-8" />} title="I'm a Business" />
      </form>
    </div>
  );
}

function RoleCard({
  role,
  icon,
  title,
}: {
  role: "therapist" | "business";
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="text-primary">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {role === "therapist"
            ? "Build a profile and find jobs near you."
            : "Post jobs and discover qualified therapists."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="submit" name="role" value={role} className="w-full">
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
