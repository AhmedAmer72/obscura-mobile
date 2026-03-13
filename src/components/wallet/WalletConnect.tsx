import { useMemo, useState } from "react";
import { useConnect, useDisconnect, useAccount, useBalance, useChainId, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { IS_MOBILE_APP, isNativePlatform } from "@/lib/platform";
import MobileWalletSheet from "@/components/mobile/MobileWalletSheet";

type WalletConnectProps = {
  tone?: "dark" | "light";
};

function sortConnectors<T extends { name: string; id?: string }>(connectors: T[]) {
  return [...connectors].sort((a, b) => {
    const aWc = a.name.toLowerCase().includes("walletconnect") ? 0 : 1;
    const bWc = b.name.toLowerCase().includes("walletconnect") ? 0 : 1;
    return aWc - bWc;
  });
}

export default function WalletConnect({ tone = "dark" }: WalletConnectProps) {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address, chainId: arbitrumSepolia.id });
  const { switchChain } = useSwitchChain();

  const light = tone === "light";
  const useMobileSheet = IS_MOBILE_APP;

  const visibleConnectors = useMemo(() => {
    const list = isNativePlatform()
      ? connectors.filter((c) => c.name.toLowerCase().includes("walletconnect"))
      : connectors;
    return sortConnectors(list);
  }, [connectors]);

  const connectBtn = light
    ? "border-forest/45 text-forest bg-white hover:bg-sage-1 min-h-[44px]"
    : "border-primary/40 text-primary hover:bg-primary/10 min-h-[44px]";

  const networkLabel = light ? "text-forest/75" : "text-muted-foreground";
  const balanceText = light ? "text-forest font-semibold" : "text-primary/80";
  const walletBtn = light
    ? "border-forest/45 bg-white text-forest hover:border-forest/70 hover:bg-sage-1/80 min-h-[44px]"
    : "border-primary/30 text-foreground hover:border-primary/60 min-h-[44px]";
  const addressText = light ? "text-forest font-semibold" : "text-primary";
  const statusDot = light ? "bg-emerald-600" : "bg-primary";

  if (!isConnected) {
    return (
      <div className={cn(!useMobileSheet && "relative")}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-300 border",
            connectBtn,
          )}
        >
          Connect
        </button>

        {useMobileSheet ? (
          <MobileWalletSheet
            open={open}
            onOpenChange={setOpen}
            connectors={visibleConnectors.map((connector) => ({
              uid: connector.uid,
              name: connector.name,
              onConnect: () => {
                connect({ connector });
                setOpen(false);
              },
            }))}
            isPending={isPending}
            tone={tone}
          />
        ) : open ? (
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-sm border shadow-xl backdrop-blur",
              light ? "border-forest/20 bg-white" : "border-primary/20 bg-background/95",
            )}
          >
            {visibleConnectors.map((connector) => (
              <button
                key={connector.uid}
                type="button"
                disabled={isPending}
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full min-h-[44px] items-center gap-2 px-4 py-3 text-left font-mono text-xs transition-colors disabled:opacity-50",
                  light ? "text-forest hover:bg-sage-1" : "hover:bg-primary/10",
                )}
              >
                <span className={light ? "text-forest/50" : "text-primary/60"}>◆</span>
                {connector.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (isConnected && address && chainId !== arbitrumSepolia.id) {
    return (
      <button
        type="button"
        onClick={() => switchChain({ chainId: arbitrumSepolia.id })}
        className="min-h-[44px] rounded-full border border-amber-500/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-600 transition-colors duration-300 hover:bg-amber-500/10"
      >
        Switch network
      </button>
    );
  }

  const displayName = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const ethBalance = balance
    ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ETH`
    : "";

  return (
    <div className="flex items-center gap-2">
      {!useMobileSheet ? (
        <div className="hidden flex-col items-end leading-tight sm:flex">
          <span className={cn("font-mono text-[10px] uppercase tracking-widest", networkLabel)}>
            Arb Sepolia
          </span>
          {ethBalance ? <span className={cn("font-mono text-[10px]", balanceText)}>{ethBalance}</span> : null}
        </div>
      ) : null}
      <button
        type="button"
        className={cn(
          "group flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-xs transition-colors duration-300",
          walletBtn,
        )}
      >
        <span className={cn("size-2 shrink-0 rounded-full animate-pulse", statusDot)} />
        <span className={addressText}>{displayName}</span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            disconnect();
          }}
          title="Disconnect"
          className={cn(
            "ml-0.5 cursor-pointer text-[10px] transition-colors",
            light ? "text-forest/45 group-hover:text-red-600" : "text-muted-foreground group-hover:text-red-400",
          )}
        >
          ✕
        </span>
      </button>
    </div>
  );
}
