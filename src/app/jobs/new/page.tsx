import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { JobForm } from "@/components/forms/job-form";

export const metadata = { title: "Post a Job" };

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");
  if (session.user.role !== "business") redirect("/jobs");
  return (
    <div className="container py-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">Post a Job</h1>
      <p className="text-muted-foreground mb-8">Reach licensed Texas therapists actively searching.</p>
      <JobForm />
    </div>
  );
}
