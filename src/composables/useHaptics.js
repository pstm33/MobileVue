import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

function isSupported() {
  return (
    Capacitor.getPlatform?.() !== "web" ||
    (typeof navigator !== "undefined" && "vibrate" in navigator)
  );
}

const HAPTIC_STYLE = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

const HAPTIC_TOAST = {
  success: NotificationType.Success,
  warning: NotificationType.Warning,
  error: NotificationType.Error,
};

async function vibrate(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(ms);
  }
}

async function tap(style = ImpactStyle.Light, fallback = 10) {
  try {
    if (!isSupported()) {
      await vibrate(fallback);
      return;
    }

    await Haptics.impact({ style });
  } catch (error) {
    await vibrate(fallback);
  }
}

export function useHaptics() {
  const impact = async (style = "light") =>
    tap(HAPTIC_STYLE[style] || HAPTIC_STYLE.light);

  const success = async () => {
    try {
      await Haptics.notification({ type: HAPTIC_TOAST.success });
    } catch (error) {
      await vibrate(15);
    }
  };

  const warning = async () => {
    try {
      await Haptics.notification({ type: HAPTIC_TOAST.warning });
    } catch (error) {
      await vibrate(15);
    }
  };

  const warningSoft = () => tap(HAPTIC_STYLE.light, 14);
  const warningHard = () => tap(HAPTIC_STYLE.medium, 30);

  const successTriple = async () => {
    await impact("medium");
    await new Promise((resolve) => setTimeout(resolve, 65));
    await impact("light");
    await new Promise((resolve) => setTimeout(resolve, 65));
    await success();
  };

  return {
    impact,
    success,
    warning,
    warningSoft,
    warningHard,
    successTriple,
  };
}

