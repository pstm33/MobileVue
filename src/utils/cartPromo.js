import { cleanPromoText, formatPromoDate, promoKind } from "src/utils/promoDisplay";

export function discountType(value) {
  return cleanPromoText(value?.discount_type || value?.promo_type || "")
    .toLowerCase()
    .trim();
}

export function activeMerchantDiscount(discounts) {
  const list = Array.isArray(discounts) ? discounts : [];
  return list.find((item) => {
    const type = discountType(item);
    return type && type !== "points" && type !== "points_discount";
  });
}

function toNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = String(value || "")
    .replace(/\s/g, "")
    .replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return null;
  }

  const comma = cleaned.lastIndexOf(",");
  const dot = cleaned.lastIndexOf(".");
  const decimalIndex = Math.max(comma, dot);
  const normalized =
    decimalIndex >= 0
      ? cleaned.slice(0, decimalIndex).replace(/[,.]/g, "") +
        "." +
        cleaned.slice(decimalIndex + 1).replace(/[,.]/g, "")
      : cleaned;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formattedSavings(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return value
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function summaryDiscount(cartData, fallbackPromo = null) {
  const summary = Array.isArray(cartData?.data?.summary)
    ? cartData.data.summary
    : [];
  const row = summary.find((item) => {
    const label = cleanPromoText(
      [item?.name, item?.label, item?.type].join(" ")
    ).toLowerCase();
    return /discount|voucher|promo|скид|купон|акци/.test(label);
  });

  if (!row) {
    return null;
  }

  const value = cleanPromoText(row?.value || row?.amount || "");
  return {
    ...(fallbackPromo || {}),
    label: promoDisplayTitle(fallbackPromo) || cleanPromoText(row.name),
    discount_type:
      fallbackPromo?.promo_type || fallbackPromo?.discount_type || "offers",
    savings_value: value.replace(/^-/, ""),
  };
}

export function cartSavingsDiscount(cartData, fallbackPromo = null) {
  const direct = activeMerchantDiscount(cartData?.discount_applied);
  if (direct) {
    return direct;
  }

  const fromSummary = summaryDiscount(cartData, fallbackPromo);
  if (fromSummary) {
    return fromSummary;
  }

  const subtotal = toNumber(
    cartData?.data?.subtotal?.raw ||
      cartData?.data?.subtotal?.value ||
      cartData?.subtotal
  );
  const total = toNumber(
    cartData?.data?.total?.raw || cartData?.data?.total?.value || cartData?.total
  );
  const savings =
    subtotal !== null && total !== null ? Number((subtotal - total).toFixed(2)) : 0;

  if (!fallbackPromo || savings <= 0 || savings >= subtotal) {
    return null;
  }

  return {
    ...fallbackPromo,
    label: promoDisplayTitle(fallbackPromo),
    discount_type:
      fallbackPromo?.promo_type || fallbackPromo?.discount_type || "offers",
    savings_value: formattedSavings(savings),
  };
}

export function promoServiceTypes(value) {
  const text = cleanPromoText(
    [
      value?.title,
      value?.sub_title,
      value?.discount_name,
      value?.max_cap,
      value?.max_spend,
    ].join(" ")
  ).toLowerCase();
  const types = [];
  if (/доставк|delivery/.test(text)) types.push("delivery");
  if (/самовывоз|pickup/.test(text)) types.push("pickup");
  if (/навынос|с собой|takeout/.test(text)) types.push("takeout");
  if (/в зале|dine.?in/.test(text)) types.push("dinein");
  return [...new Set(types)];
}

export function promoAppliesToTransaction(value, transactionType) {
  const types = promoServiceTypes(value);
  if (!transactionType || !types.length) {
    return true;
  }
  return types.includes(transactionType);
}

export function autoMerchantOffer(promos, transactionType = null) {
  const list = Array.isArray(promos) ? promos : [];
  return (
    list.find(
      (item) =>
        promoKind(item) === "offers" &&
        promoAppliesToTransaction(item, transactionType)
    ) || null
  );
}

export function promoContextKey(cartData) {
  const info = cartData?.transaction_info || {};
  const subtotal =
    cartData?.data?.subtotal?.raw ||
    cartData?.data?.subtotal?.value ||
    cartData?.subtotal ||
    "";

  return [
    cartData?.cart_uuid || "",
    cartData?.merchant_id || "",
    info.transaction_type || "",
    cartData?.items_count || "",
    subtotal,
  ].join("|");
}

export function promoDisplayTitle(value) {
  return cleanPromoText(
    value?.label ||
      value?.title ||
      value?.discount_name ||
      value?.discount ||
      value?.sub_title ||
      ""
  );
}

export function promoDisplayMeta(value) {
  const parts = [
    value?.sub_title,
    value?.max_cap,
    value?.max_spend,
    value?.valid_to ? formatPromoDate(value.valid_to) : "",
  ]
    .map((item) => cleanPromoText(item))
    .filter(Boolean);

  return [...new Set(parts)].join(" • ");
}
