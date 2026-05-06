import { boot } from "quasar/wrappers";
import { loadAppSettings } from "src/api/SettingsLoader";

export default boot(async () => {
  try {
    await loadAppSettings();
  } catch (error) {
    console.error("Error loading settings:", error);
  }
});
