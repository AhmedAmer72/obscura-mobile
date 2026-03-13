/** This repo is the Obscura store/mobile shell — always app mode, not marketing site. */
export const IS_MOBILE_APP = true;

let nativePlatform = false;

export function isNativePlatform() {
  return nativePlatform;
}

export async function initNativeShell() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    nativePlatform = Capacitor.isNativePlatform();
    if (!nativePlatform) return;

    const { App } = await import("@capacitor/app");
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");

    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: "#EEF3EA" });

    try {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    } catch {
      // iOS may not support all resize modes
    }

    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch {
    nativePlatform = false;
  }
}

export async function hideNativeSplash() {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    // web preview
  }
}
