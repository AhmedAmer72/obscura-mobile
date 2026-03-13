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
      launchShowDuration: 0,
      backgroundColor: "#EEF3EA",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
