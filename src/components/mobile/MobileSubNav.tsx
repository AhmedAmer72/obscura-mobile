import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileSubNavItem = {
  key: string;
  label: string;
  mobileLabel?: string;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
};

export default function MobileSubNav({ items }: { items: MobileSubNavItem[] }) {
  return (
    <nav
      className="mobile-app-subnav border-b border-border bg-background/95 backdrop-blur-md"
      aria-label="Section navigation"
    >
      <div className="flex gap-2 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const label = item.mobileLabel ?? item.label;
          const className = cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
            item.active
              ? "bg-foreground text-background"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
          );

          if (item.href) {
            return (
              <Link key={item.key} to={item.href} className={className}>
                {item.icon ? <item.icon className="size-3.5" strokeWidth={1.75} /> : null}
                {label}
              </Link>
            );
          }

          return (
            <button key={item.key} type="button" onClick={item.onClick} className={className}>
              {item.icon ? <item.icon className="size-3.5" strokeWidth={1.75} /> : null}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
