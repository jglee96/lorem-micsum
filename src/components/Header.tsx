import { Link } from "@tanstack/react-router";
import { Headphones, Sparkles, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Header() {
  const navItems = [
    { to: "/", label: "Overview", icon: Sparkles },
    { to: "/audio", label: "Audio", icon: Headphones },
    { to: "/video", label: "Video", icon: Video },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/78 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/80 text-primary shadow-[0_10px_30px_rgba(22,33,56,0.08)] transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="section-kicker">Browser-native media lab</p>
            <p className="font-display truncate text-2xl leading-none text-foreground">
              Lorem Micsum
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1.5 shadow-[0_10px_30px_rgba(22,33,56,0.05)] backdrop-blur-xl">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "font-ui flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors duration-200 hover:text-foreground",
                "[&.active]:bg-foreground [&.active]:text-background"
              )}
              activeProps={{ className: "active" }}
            >
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
