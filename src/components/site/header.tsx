import Link from "next/link";
import { Sparkles, MessageCircle, LayoutDashboard, LogOut } from "lucide-react";
import { auth, signOut } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="hidden sm:inline">Texas Medical Massage</span>
          <span className="sm:hidden">TMM</span>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          <Link
            href="/therapists"
            className="hidden md:inline-flex px-3 py-2 text-sm font-medium hover:text-primary"
          >
            Therapists
          </Link>
          <Link
            href="/businesses"
            className="hidden md:inline-flex px-3 py-2 text-sm font-medium hover:text-primary"
          >
            Businesses
          </Link>
          <Link
            href="/jobs"
            className="hidden md:inline-flex px-3 py-2 text-sm font-medium hover:text-primary"
          >
            Jobs
          </Link>

          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="icon" aria-label="Messages">
                <Link href="/messages">
                  <MessageCircle />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard />
                </Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                  <LogOut />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/signin">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>

      {/* Mobile sub-nav */}
      <div className="md:hidden border-t">
        <div className="container flex items-center justify-around py-2 text-xs">
          <Link href="/therapists" className="px-2 py-1">
            Therapists
          </Link>
          <Link href="/businesses" className="px-2 py-1">
            Businesses
          </Link>
          <Link href="/jobs" className="px-2 py-1">
            Jobs
          </Link>
        </div>
      </div>
    </header>
  );
}
