import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { config } from "@/config/wagmi";
import PayPage from "./pages/PayPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import VotePage from "./pages/VotePage.tsx";
import CreditPage from "./pages/CreditPage.tsx";
import ContactsPage from "./pages/ContactsPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import HowCoFHEModal from "@/components/shared/HowCoFHEModal";
import AppBootstrap from "@/components/mobile/AppBootstrap";
import MobileTabBar from "@/components/mobile/MobileTabBar";
import { IS_MOBILE_APP } from "@/lib/platform";

const ONBOARDING_KEY = "obscura.onboarding.cofhe.v1";

const queryClient = new QueryClient();

const WORKSPACE_PATHS = new Set(["/pay", "/pay/contacts", "/pay/settings", "/vote", "/credit"]);

const normalizePath = (pathname: string) => {
  const base = pathname.split("?")[0].replace(/\/$/, "") || "/";
  return base;
};

const isWorkspacePath = (pathname: string) => {
  const p = normalizePath(pathname);
  return WORKSPACE_PATHS.has(p) || p.startsWith("/pay/");
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isWorkspace = isWorkspacePath(location.pathname);
  const showTabBar = IS_MOBILE_APP && isWorkspace;

  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (location.pathname === "/credit" && !localStorage.getItem(ONBOARDING_KEY)) {
      const t = setTimeout(() => setShowOnboarding(true), 600);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  const handleOnboardingClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setShowOnboarding(false);
  };

  return (
    <>
      <div className="min-h-[100dvh] overflow-x-clip bg-sage-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className={showTabBar ? "mobile-tab-content-offset" : undefined}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate to="/pay" replace />} />
              <Route path="/pay" element={<PayPage />} />
              <Route path="/pay/contacts" element={<ContactsPage />} />
              <Route path="/pay/settings" element={<SettingsPage />} />
              <Route path="/vote" element={<VotePage />} />
              <Route path="/credit" element={<CreditPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {showTabBar ? <MobileTabBar /> : null}
      <HowCoFHEModal open={showOnboarding} onClose={handleOnboardingClose} />
    </>
  );
};

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PreferencesProvider>
          <AppBootstrap>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </AppBootstrap>
        </PreferencesProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
