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
      className="mobile-app-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface-elevated/98 shadow-[0_-4px_24px_rgba(24,40,14,0.06)] backdrop-blur-md supports-[backdrop-filter]:bg-surface-elevated/90"
      aria-label="Main navigation"
    >
      <div className="mobile-app-tab-bar__inner mx-auto flex max-w-lg items-stretch justify-around px-1">
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
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors active:scale-[0.97]",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={active ? 2.1 : 1.65} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
