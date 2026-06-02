"use client";
import { useState, useTransition } from "react";
import { saveTherapistProfileAction } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MODALITIES, AVAILABILITY } from "@/lib/utils";
import { LocationPicker } from "@/components/forms/location-picker";

type Defaults = Partial<{
  displayName: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  licenseNumber: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  availability: string[];
  modalities: string[];
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  longitude: number;
  latitude: number;
  serviceRadiusMiles: number;
}>;

export function TherapistProfileForm({ defaults = {} }: { defaults?: Defaults }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [modalities, setModalities] = useState<string[]>(defaults.modalities ?? []);
  const [availability, setAvailability] = useState<string[]>(defaults.availability ?? []);

  function onSubmit(formData: FormData) {
    setError(null);
    modalities.forEach((m) => formData.append("modalities", m));
    availability.forEach((a) => formData.append("availability", a));
    startTransition(async () => {
      try {
        await saveTherapistProfileAction(formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">About you</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display name *">
            <Input name="displayName" required defaultValue={defaults.displayName} />
          </Field>
          <Field label="Headline">
            <Input
              name="headline"
              placeholder="Licensed LMT · Deep Tissue & Sports"
              defaultValue={defaults.headline}
            />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea name="bio" rows={4} defaultValue={defaults.bio} />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Years experience">
            <Input
              name="yearsExperience"
              type="number"
              min={0}
              max={60}
              defaultValue={defaults.yearsExperience ?? 0}
            />
          </Field>
          <Field label="TX License #">
            <Input name="licenseNumber" defaultValue={defaults.licenseNumber} />
          </Field>
          <Field label="Service radius (mi)">
            <Input
              name="serviceRadiusMiles"
              type="number"
              min={1}
              max={200}
              defaultValue={defaults.serviceRadiusMiles ?? 25}
            />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Rate min ($/hr)">
            <Input name="hourlyRateMin" type="number" min={0} defaultValue={defaults.hourlyRateMin} />
          </Field>
          <Field label="Rate max ($/hr)">
            <Input name="hourlyRateMax" type="number" min={0} defaultValue={defaults.hourlyRateMax} />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Modalities</h2>
        <ChipPicker options={[...MODALITIES]} selected={modalities} onChange={setModalities} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Availability</h2>
        <ChipPicker options={[...AVAILABILITY]} selected={availability} onChange={setAvailability} />
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

function ChipPicker({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isOn = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
          >
            <Badge variant={isOn ? "default" : "outline"} className="cursor-pointer">
              {opt}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
