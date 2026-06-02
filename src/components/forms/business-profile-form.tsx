"use client";
import { useState, useTransition } from "react";
import { saveBusinessProfileAction } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS_TYPES } from "@/lib/utils";
import { LocationPicker } from "@/components/forms/location-picker";

type Defaults = Partial<{
  businessName: string;
  type: string;
  description: string;
  website: string;
  phone: string;
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  longitude: number;
  latitude: number;
}>;

export function BusinessProfileForm({ defaults = {} }: { defaults?: Defaults }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await saveBusinessProfileAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">About your business</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Business name *">
            <Input name="businessName" required defaultValue={defaults.businessName} />
          </Field>
          <Field label="Type">
            <select
              name="type"
              defaultValue={defaults.type ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {BUSINESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Description">
          <Textarea name="description" rows={4} defaultValue={defaults.description} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Website">
            <Input name="website" type="url" placeholder="https://" defaultValue={defaults.website} />
          </Field>
          <Field label="Phone">
            <Input name="phone" type="tel" defaultValue={defaults.phone} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Location</h2>
        <LocationPicker
          defaults={{
            addressLine1: defaults.addressLine1,
            city: defaults.city,
            state: defaults.state,
            postalCode: defaults.postalCode,
            longitude: defaults.longitude,
            latitude: defaults.latitude,
          }}
        />
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
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
