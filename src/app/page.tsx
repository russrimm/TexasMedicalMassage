import Link from "next/link";
import { MapPin, Search, ShieldCheck, Star, MessageCircle, BriefcaseBusiness } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <MapPin className="h-4 w-4" /> Wherever you practice
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Where massage <span className="text-primary">therapists</span> meet
              <span className="text-primary"> opportunity</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-prose">
              Search nearby jobs, find vetted therapists, leave verified reviews, and message directly —
              all in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <Link href="/signup?role=therapist">I&apos;m a Therapist</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/signup?role=business">I&apos;m a Business</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Free to join. No credit card required.
            </p>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border p-6 flex flex-col justify-end">
              <div className="bg-card border rounded-xl p-4 shadow-lg mb-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Search className="h-3 w-3" /> Austin · 25 mi · Full-time
                </div>
                <div className="font-semibold mt-1">Deep-tissue LMT needed</div>
                <div className="text-sm text-muted-foreground">South Congress Wellness · $75–95/hr</div>
              </div>
              <div className="bg-card border rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-500 stroke-yellow-500" /> 4.9 (32 reviews)
                </div>
                <div className="font-semibold mt-1">Maria G., LMT</div>
                <div className="text-sm text-muted-foreground">Medical · Sports · Prenatal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
          A two-sided marketplace built on trust
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            icon={<MapPin />}
            title="Location-aware search"
            desc="Use your current location or pick an area. Radius search powered by precise GPS coordinates."
          />
          <Feature
            icon={<ShieldCheck />}
            title="Verified credentials"
            desc="Therapists list their TX license number. Businesses see verification badges at a glance."
          />
          <Feature
            icon={<Star />}
            title="Honest reviews"
            desc="Reviews from people who actually worked together carry a Verified Engagement badge."
          />
          <Feature
            icon={<BriefcaseBusiness />}
            title="Real jobs, real applicants"
            desc="Post a role in minutes. Therapists apply with a cover note and verified profile."
          />
          <Feature
            icon={<MessageCircle />}
            title="Direct messaging"
            desc="Connect privately to discuss schedule, modalities, and rates without leaving the app."
          />
          <Feature
            icon={<Search />}
            title="Smart filters"
            desc="Filter by modality, availability, experience, and minimum rating."
          />
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-prose mx-auto">
            Create a free profile in under two minutes. Search the marketplace immediately.
          </p>
          <Button asChild size="lg">
            <Link href="/signup">Create your free account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center [&_svg]:size-5">
          {icon}
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
