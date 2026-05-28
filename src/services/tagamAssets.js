import manifest from "src/generated/tagam-assets.json";

const ORIGINAL_SUFFIX = /@(1x|2x)(?=\.[a-zA-Z0-9]+$)/;

export const originalTagamUrl = (url) => String(url || "").replace(ORIGINAL_SUFFIX, "");

export const tagamAsset = (url) => {
  const value = String(url || "");
  if (!value) return "";

  if (value.includes("placeholder.png")) return "/tagam/item-placeholder.webp";

  const original = originalTagamUrl(value);
  return manifest[value] || manifest[original] || original;
};
