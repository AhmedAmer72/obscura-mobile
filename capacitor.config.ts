import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "finance.obscura.mobile",
  appName: "Obscura",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#EEF3EA",
      showSpinner: false,
    },
  },
};

export default config;
