"use client";
import { useState, useTransition } from "react";
import { createJobAction } from "@/server/actions/jobs";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MODALITIES } from "@/lib/utils";
import { LocationPicker } from "@/components/forms/location-picker";

export function JobForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mods, setMods] = useState<string[]>([]);

  function onSubmit(formData: FormData) {
    setError(null);
    mods.forEach((m) => formData.append("requiredModalities", m));
    startTransition(async () => {
      try {
        await createJobAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create job");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <Field label="Title *">
        <Input name="title" required minLength={4} />
      </Field>
      <Field label="Description *">
        <Textarea name="description" rows={6} required minLength={20} />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Type *">
          <select
            name="employmentType"
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            defaultValue="full_time"
          >
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="per_diem">Per-diem</option>
          </select>
        </Field>
        <Field label="Pay min ($)">
          <Input name="payMin" type="number" min={0} />
        </Field>
        <Field label="Pay max ($)">
          <Input name="payMax" type="number" min={0} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Pay period">
          <select
            name="payPeriod"
            defaultValue="hour"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="hour">Per hour</option>
            <option value="year">Per year</option>
          </select>
        </Field>
        <Field label="Minimum years experience">
          <Input name="minYearsExperience" type="number" min={0} defaultValue={0} />
        </Field>
      </div>

      <div className="space-y-3">
        <Label>Required modalities</Label>
        <div className="flex flex-wrap gap-2">
          {MODALITIES.map((m) => {
            const on = mods.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMods(on ? mods.filter((x) => x !== m) : [...mods, m])}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              >
                <Badge variant={on ? "default" : "outline"} className="cursor-pointer">
                  {m}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="isMobile" className="accent-primary" />
        This is a mobile / in-home role
      </label>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Location</h2>
        <LocationPicker />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Posting..." : "Post job"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
