import ObscuraLogo from "@/components/brand/ObscuraLogo";
import { cn } from "@/lib/utils";

export default function EnvSetupScreen({
  missing,
  onDevContinue,
}: {
  missing: string[];
  onDevContinue?: () => void;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-sage-1 px-6 py-12 text-center pt-[max(3rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]">
      <ObscuraLogo size="md" tone="light" />
      <h1 className="mt-6 font-display text-2xl tracking-tight text-forest">Configuration needed</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-forest/65">
        Add a <code className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-xs">.env</code> file with
        your Obscura contract addresses and API URLs before using Pay, Vote, or Credit on mobile.
      </p>
      <div className="mt-6 w-full max-w-lg rounded-2xl border border-forest/15 bg-white p-4 text-left">
        <p className="font-mono text-[10px] uppercase tracking-wider text-forest/45">Missing or invalid</p>
        <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto font-mono text-[11px] text-forest/75">
          {missing.slice(0, 12).map((key) => (
            <li key={key}>{key}</li>
          ))}
          {missing.length > 12 ? <li>…and {missing.length - 12} more</li> : null}
        </ul>
      </div>
      <p className="mt-4 text-xs text-forest/50">Copy values from the web app `.env` or Vercel project settings.</p>
      {import.meta.env.DEV && onDevContinue ? (
        <button
          type="button"
          onClick={onDevContinue}
          className="mt-6 rounded-full border border-forest/20 px-5 py-2.5 text-sm text-forest hover:bg-white/80"
        >
          Preview UI without config (dev only)
        </button>
      ) : null}
    </div>
  );
}
