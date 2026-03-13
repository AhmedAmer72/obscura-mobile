import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ObscuraMark } from "@/components/brand/ObscuraLogo";
import { checkEnvHealth } from "@/lib/envHealth";
import { hideNativeSplash, initNativeShell } from "@/lib/platform";
import EnvSetupScreen from "@/components/mobile/EnvSetupScreen";

const MIN_BOOT_MS = 800;

type BootPhase = "loading" | "ready" | "env-error";

export default function AppBootstrap({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<BootPhase>("loading");
  const [missingEnv, setMissingEnv] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const start = Date.now();
      await initNativeShell();

      const env = checkEnvHealth();
      const elapsed = Date.now() - start;
      if (elapsed < MIN_BOOT_MS) {
        await new Promise((r) => setTimeout(r, MIN_BOOT_MS - elapsed));
      }

      if (cancelled) return;

      if (!env.ok) {
        setMissingEnv(env.missing);
        setPhase("env-error");
      } else {
        setPhase("ready");
      }

      await hideNativeSplash();
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const continueInDev = () => {
    if (import.meta.env.DEV) setPhase("ready");
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "loading" ? (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-sage-1"
            style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ObscuraMark tone="light" className="h-16 w-16" />
            </motion.div>
            <p className="mt-6 font-display text-lg tracking-tight text-forest">Obscura</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-forest/45">
              Private money, computed in the open
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {phase === "env-error" ? (
        <EnvSetupScreen missing={missingEnv} onDevContinue={continueInDev} />
      ) : null}

      {phase === "ready" ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      ) : null}
    </>
  );
}
