import { Link, useLocation } from "react-router-dom";
import { Banknote, Landmark, Vote } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/pay", label: "Pay", icon: Banknote },
  { href: "/vote", label: "Vote", icon: Vote },
  { href: "/credit", label: "Credit", icon: Landmark },
] as const;

export default function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface-elevated/98 shadow-[0_-8px_24px_rgba(24,40,14,0.06)] backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-3 pt-0.5">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            pathname.startsWith(`${href}/`) ||
            (href === "/pay" && pathname.startsWith("/pay"));

          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground active:bg-muted/50",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.65} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
