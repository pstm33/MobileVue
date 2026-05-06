import { boot } from "quasar/wrappers";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { Platform } from "quasar";
import { useDataStore } from "stores/DataStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { Device } from "@capacitor/device";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do

  let device_language = null;
  let default_language = null;
  const DataStorePersisted = useDataStorePersisted();
  const DataStore = useDataStore();

  default_language = DataStore.attributes_data?.default_language ?? null;

  if (!Platform.is.capacitor) {
    if (default_language && !DataStorePersisted.app_language) {
      DataStorePersisted.choose_language = true;
      DataStorePersisted.app_language = default_language;
    }
    return;
  }

  try {
    const info = await Device.getLanguageCode();
    device_language = info.value;
    if (device_language && !DataStorePersisted.app_language) {
      DataStorePersisted.choose_language = true;
      DataStorePersisted.app_language = device_language;
    }
  } catch (error) {}

  SplashScreen.hide();

  await StatusBar.setOverlaysWebView({ overlay: false });
  await StatusBar.setStyle({ style: Style.Light });
  await StatusBar.setBackgroundColor({ color: "#ff724c" });
});
