"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { signupSchema } from "@/lib/validation";
import { signIn, signOut } from "@/server/auth";

export type ActionState = { error?: string; ok?: boolean } | null;

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password, role } = parsed.data;
  const lower = email.toLowerCase();

  const [existing] = await db.select().from(users).where(eq(users.email, lower)).limit(1);
  if (existing) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    email: lower,
    name,
    passwordHash,
    role,
  });

  await signIn("credentials", {
    email: lower,
    password,
    redirect: false,
  });

  redirect("/onboarding/profile");
}

export async function credentialsSignInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    return { error: "Invalid email or password." };
  }
  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
