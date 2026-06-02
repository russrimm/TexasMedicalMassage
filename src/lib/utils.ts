import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceMiles(meters: number | null | undefined) {
  if (meters == null) return null;
  const miles = meters / 1609.344;
  if (miles < 0.1) return "<0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

export function formatRelative(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString();
}

export const MODALITIES = [
  "Swedish",
  "Deep Tissue",
  "Sports",
  "Medical",
  "Prenatal",
  "Lymphatic Drainage",
  "Trigger Point",
  "Myofascial Release",
  "Thai",
  "Reflexology",
  "Hot Stone",
  "Craniosacral",
  "Neuromuscular",
  "Oncology",
] as const;

export const AVAILABILITY = [
  "Full-time",
  "Part-time",
  "Contract",
  "Per-diem",
  "Weekends only",
] as const;

export const BUSINESS_TYPES = [
  "Day Spa",
  "Medical Clinic",
  "Chiropractic Office",
  "Wellness Center",
  "Mobile / In-home",
  "Resort / Hotel",
  "Sports Therapy",
  "Other",
] as const;

export const TEXAS_CENTER = { longitude: -99.9018, latitude: 31.9686, zoom: 5.2 };
