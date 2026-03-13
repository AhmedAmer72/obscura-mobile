import { Loader2, Smartphone, Wallet } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

type ConnectorOption = {
  uid: string;
  name: string;
  onConnect: () => void;
};

type MobileWalletSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connectors: ConnectorOption[];
  isPending: boolean;
  tone?: "dark" | "light";
};

export default function MobileWalletSheet({
  open,
  onOpenChange,
  connectors,
  isPending,
  tone = "light",
}: MobileWalletSheetProps) {
  const light = tone === "light";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="mobile-app-drawer-pad pb-[max(env(safe-area-inset-bottom),1rem)]"
        aria-describedby="mobile-wallet-desc"
      >
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-display text-xl">Connect wallet</DrawerTitle>
          <DrawerDescription id="mobile-wallet-desc">
            Choose WalletConnect to open MetaMask, Rainbow, or another wallet app on your phone.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-2 px-4 pb-4">
          {connectors.map((connector) => {
            const isWalletConnect = connector.name.toLowerCase().includes("walletconnect");
            return (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={connector.onConnect}
                className={cn(
                  "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-50",
                  light
                    ? "border-forest/15 bg-white hover:bg-sage-1"
                    : "border-border bg-card hover:bg-muted",
                  isWalletConnect && "border-brand/35 bg-brand/5",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    isWalletConnect ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground",
                  )}
                >
                  {isWalletConnect ? (
                    <Smartphone className="size-5" strokeWidth={1.75} />
                  ) : (
                    <Wallet className="size-5" strokeWidth={1.75} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{connector.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {isWalletConnect ? "Recommended on mobile" : "Browser extension wallets"}
                  </span>
                </span>
                {isPending ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
              </button>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
