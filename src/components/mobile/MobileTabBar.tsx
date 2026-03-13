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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-subtle bg-surface-elevated/95 backdrop-blur-md"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1">
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
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] transition-colors",
                active ? "text-brand" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2 : 1.65} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
