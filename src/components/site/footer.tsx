import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t mt-auto">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Texas Medical Massage</p>
        <nav className="flex gap-6">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
