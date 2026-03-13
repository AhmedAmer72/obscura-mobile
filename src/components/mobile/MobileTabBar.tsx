import { Link, useLocation } from "react-router-dom";
import { Banknote, Coins, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/pay", label: "Pay", icon: Banknote },
  { href: "/vote", label: "Govern", icon: Landmark },
  { href: "/credit", label: "Credit", icon: Coins },
] as const;

export default function MobileTabBar() {
  const { pathname } = useLocation();

  return (
    <nav
      className="mobile-app-tab-bar fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 shadow-[0_-4px_24px_hsl(var(--dash-forest)/0.1)] backdrop-blur-md supports-[backdrop-filter]:bg-white/90"
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
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors active:scale-[0.97]",
                active
                  ? "text-[hsl(var(--dash-forest))]"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition-colors",
                  active && "bg-[hsl(var(--dash-mint))] shadow-[inset_0_0_0_1px_hsl(var(--dash-mint-border))]",
                )}
              >
                <Icon className="size-[18px]" strokeWidth={active ? 2.1 : 1.65} />
              </span>
              <span className="truncate uppercase tracking-[0.1em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
