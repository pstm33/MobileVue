import { formatReadableDateTime, repairMojibake } from "src/utils/textEncoding";

const russianMonthPattern =
  "(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)";

function normalizePromoRussianText(value) {
  return value
    .replace(/(^|[\s,.:;!])на доставка(?=$|[\s,.:;!])/gi, "$1для доставки")
    .replace(/(^|[\s,.:;!])на самовывоз(?=$|[\s,.:;!])/gi, "$1для самовывоза")
    .replace(/(^|[\s,.:;!])на с собой(?=$|[\s,.:;!])/gi, "$1для заказа с собой")
    .replace(
      new RegExp(
        `(^|[\\s,:])${russianMonthPattern}\\s+(\\d{1,2}),\\s*(\\d{4})`,
        "gi"
      ),
      "$1$3 $2 $4"
    );
}

export function cleanPromoText(value) {
  return normalizePromoRussianText(repairMojibake(String(value || "")))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function promoTitle(item) {
  return cleanPromoText(item?.title || item?.discount_name || item?.discount || "");
}

export function promoMeta(item) {
  return cleanPromoText(
    item?.min_order ||
      item?.max_cap ||
      item?.valid_to ||
      item?.sub_title ||
      item?.discount ||
      ""
  );
}

function promoKey(item) {
  const title = promoTitle(item).toLowerCase();
  const discount = cleanPromoText(item?.discount || "").toLowerCase();
  return `${title}|${discount}`;
}

export function promoKind(item) {
  const value = cleanPromoText(
    item?.promo_type || item?.offer_type || item?.discount_type || ""
  ).toLowerCase();
  if (value.includes("offers")) return "offers";
  if (value.includes("voucher")) return "voucher";
  if (value.includes("discount")) return "discount";
  return value;
}

function promoScore(item) {
  return [
    promoKind(item) === "offers" ? 4 : 0,
    item?.discount_name ? 3 : 0,
    item?.max_cap ? 2 : 0,
    item?.valid_to ? 2 : 0,
    item?.min_order || item?.sub_title ? 1 : 0,
  ].reduce((sum, value) => sum + value, 0);
}

function mergePromos(current, next) {
  const related = [
    ...(current?._tagam_related_promos || [current]),
    next,
  ].filter(Boolean);
  const preferred = promoScore(next) > promoScore(current) ? next : current;

  return {
    ...current,
    ...preferred,
    min_order: preferred?.min_order || current?.min_order || next?.min_order,
    max_cap: preferred?.max_cap || current?.max_cap || next?.max_cap,
    valid_to: preferred?.valid_to || current?.valid_to || next?.valid_to,
    discount_name:
      preferred?.discount_name || current?.discount_name || next?.discount_name,
    _tagam_related_promos: related,
  };
}

export function normalizedPromoList(data, limit = 0) {
  if (!Array.isArray(data)) {
    return [];
  }

  const map = new Map();
  data.forEach((item) => {
    const key = promoKey(item);
    if (!key || key === "|") return;
    const current = map.get(key);
    map.set(key, current ? mergePromos(current, item) : item);
  });

  const results = Array.from(map.values());
  return limit > 0 ? results.slice(0, limit) : results;
}

export function promoDetailSources(item) {
  if (!item) {
    return [];
  }

  const related = (item._tagam_related_promos || [item]).filter(Boolean);
  const applicable = related.filter((promo) =>
    ["offers", "voucher"].includes(promoKind(promo))
  );
  const source = applicable.length ? applicable : related;
  const seen = new Set();

  return source.filter((promo) => {
    const key = [
      promoKind(promo),
      promoTitle(promo).toLowerCase(),
      cleanPromoText(promo?.discount_name).toLowerCase(),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatPromoDate(value) {
  return formatReadableDateTime(cleanPromoText(value));
}
