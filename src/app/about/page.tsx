import type { Metadata } from "next";
import Link from "next/link";
import {
  Award,
  GraduationCap,
  HeartPulse,
  MapPin,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Kimberly Merryman, LMT, CMMP — the licensed massage therapist and Certified Medical Massage Practitioner behind Texas Medical Massage.",
};

export default function AboutPage() {
  return (
    <>
      {/* Intro */}
      <section className="border-b">
        <div className="container py-16 md:py-24 grid md:grid-cols-[1fr_auto] gap-10 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" /> About Texas Medical Massage
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Built by a therapist, for therapists.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-prose">
              Texas Medical Massage exists to connect skilled Licensed Massage
              Therapists with the spas, clinics, and wellness businesses across
              Texas that need them. It was founded by{" "}
              <strong className="text-foreground">Kimberly Merryman, LMT, CMMP</strong>
              {" "}— a practicing therapist who knows firsthand how hard it can be
              for great therapists and great employers to find each other.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="secondary">Licensed Massage Therapist</Badge>
              <Badge variant="secondary">Certified Medical Massage Practitioner</Badge>
              <Badge variant="secondary">Texas-based</Badge>
            </div>
          </div>

          <div className="hidden md:flex h-48 w-48 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border items-center justify-center">
            <UserRound className="h-24 w-24 text-primary/70" />
          </div>
        </div>
      </section>

      {/* Founder bio */}
      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold tracking-tight">
              Meet Kimberly Merryman
            </h2>
            <p className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> Cypress, Texas
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Founder &amp; Owner, Texas Medical Massage, PLLC
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              17828 Mound Rd., Suite G · Cypress, TX 77433
            </p>
            <Button asChild variant="outline" size="sm" className="mt-6">
              <Link
                href="https://www.linkedin.com/in/kimberly-merryman-lmt-cmmp-02584424/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
              </Link>
            </Button>
          </div>

          <div className="md:col-span-2 space-y-4 text-base leading-relaxed">
            <p>
              Kimberly is a Licensed Massage Therapist (LMT) and a Certified
              Medical Massage Practitioner (CMMP) who owns and operates Texas
              Medical Massage, PLLC in Cypress, Texas. Her practice focuses on
              medical massage protocols for specific pathologies — therapeutic
              bodywork that supports injury recovery, chronic pain management,
              and measurable improvements in range of motion and quality of
              life.
            </p>
            <p>
              Kimberly came to massage therapy after a long career in finance
              and operations, including more than six years as CFO at Digital
              Innovations and earlier roles as an accountant supporting Texas
              wellness and medical practices. In 2022 she enrolled in night
              classes at the Houston School of Massage, finished at the top of
              her class — and five months ahead of schedule. She went on to
              study under Dr. Ross Turchaninov at the Science of Massage
              Institute, where she trained in medical massage protocols for
              specific pathologies. She is also a certified yoga instructor.
            </p>
            <p>
              That combination — clinical training, advanced medical massage
              certification, and years of running a business — is what shaped
              Texas Medical Massage into a marketplace built on trust,
              verified credentials, and honest reviews.
            </p>
          </div>
        </div>
      </section>

      {/* Credentials & focus areas */}
      <section className="border-t bg-muted/30">
        <div className="container py-16">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
            Background &amp; specializations
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Highlight
              icon={<Award />}
              title="Licensed Massage Therapist (LMT)"
              desc="Graduated top of her class at the Houston School of Massage in 2023 — completing the program five months ahead of schedule."
            />
            <Highlight
              icon={<Stethoscope />}
              title="Certified Medical Massage Practitioner"
              desc="Trained at the Science of Massage Institute under Dr. Ross Turchaninov in medical massage protocols for specific pathologies."
            />
            <Highlight
              icon={<HeartPulse />}
              title="Myofascial release"
              desc="Targeted soft-tissue work to release restrictions in the fascia and reduce pain rooted in connective-tissue tension."
            />
            <Highlight
              icon={<HeartPulse />}
              title="Manual lymphatic drainage"
              desc="Gentle, rhythmic technique that supports the lymphatic system after surgery, injury, or chronic inflammation."
            />
            <Highlight
              icon={<UserRound />}
              title="Special needs massage"
              desc="Adapted bodywork for clients with complex medical histories or sensory and mobility needs — care that meets people where they are."
            />
            <Highlight
              icon={<GraduationCap />}
              title="Yoga instructor"
              desc="Teaching yoga since 2020, bringing a movement and breathwork perspective into hands-on therapeutic care."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container py-16 text-center">
          <h2 className="text-3xl font-bold mb-3">Join the marketplace</h2>
          <p className="text-muted-foreground mb-8 max-w-prose mx-auto">
            Whether you&apos;re an LMT looking for your next role or a business
            looking to hire, Texas Medical Massage was built with you in mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/signup?role=therapist">I&apos;m a LMT</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup?role=business">I&apos;m a Business</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Highlight({
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
