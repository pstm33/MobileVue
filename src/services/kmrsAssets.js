import manifest from "src/generated/kmrs-assets.json";

const ORIGINAL_SUFFIX = /@(1x|2x)(?=\.[a-zA-Z0-9]+$)/;

export const originalKmrsUrl = (url) => String(url || "").replace(ORIGINAL_SUFFIX, "");

export const kmrsAsset = (url) => {
  const value = String(url || "");
  if (!value) return "";

  const original = originalKmrsUrl(value);
  return manifest[value] || manifest[original] || original;
};
