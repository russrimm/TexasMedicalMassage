import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { formatDistanceMiles } from "@/lib/utils";
import type { TherapistResult, BusinessResult, JobResult } from "@/server/queries/search";

export function TherapistCard({ t }: { t: TherapistResult }) {
  return (
    <Link href={`/therapists/${t.id}`} className="block group">
      <Card className="h-full transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{t.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{t.headline ?? "Licensed Massage Therapist"}</p>
            </div>
            <Stars rating={t.ratingAvg / 1} count={t.ratingCount} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {t.city}, {t.state}
              {t.distanceMeters != null && (
                <span className="ml-2">· {formatDistanceMiles(t.distanceMeters)}</span>
              )}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {t.modalities.slice(0, 4).map((m) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))}
            {t.modalities.length > 4 && (
              <Badge variant="outline">+{t.modalities.length - 4}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{t.yearsExperience}+ years experience</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BusinessCard({ b }: { b: BusinessResult }) {
  return (
    <Link href={`/businesses/${b.id}`} className="block group">
      <Card className="h-full transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{b.businessName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{b.type ?? "Business"}</p>
            </div>
            <Stars rating={b.ratingAvg / 1} count={b.ratingCount} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {b.city}, {b.state}
              {b.distanceMeters != null && (
                <span className="ml-2">· {formatDistanceMiles(b.distanceMeters)}</span>
              )}
            </span>
          </div>
          {b.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{b.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export function JobCard({ j }: { j: JobResult }) {
  const pay =
    j.payMin && j.payMax
      ? `$${j.payMin}–${j.payMax}/${j.payPeriod ?? "hr"}`
      : j.payMin
      ? `From $${j.payMin}/${j.payPeriod ?? "hr"}`
      : null;
  return (
    <Link href={`/jobs/${j.id}`} className="block group">
      <Card className="h-full transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{j.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{j.businessName}</p>
            </div>
            <Badge variant="outline" className="capitalize">
              {j.employmentType.replace("_", "-")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {j.city}, {j.state}
              {j.distanceMeters != null && (
                <span className="ml-2">· {formatDistanceMiles(j.distanceMeters)}</span>
              )}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{j.description}</p>
          <div className="flex flex-wrap gap-1">
            {j.requiredModalities.slice(0, 4).map((m) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))}
            {pay && <Badge>{pay}</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
