const cp1251Extra =
  "\u0402\u0403\u201a\u0453\u201e\u2026\u2020\u2021\u20ac\u2030\u0409\u2039\u040a\u040c\u040b\u040f" +
  "\u0452\u2018\u2019\u201c\u201d\u2022\u2013\u2014\u0000\u2122\u0459\u203a\u045a\u045c\u045b\u045f" +
  "\u00a0\u040e\u045e\u0408\u00a4\u0490\u00a6\u00a7\u0401\u00a9\u0404\u00ab\u00ac\u00ad\u00ae\u0407" +
  "\u00b0\u00b1\u0406\u0456\u0491\u00b5\u00b6\u00b7\u0451\u2116\u0454\u00bb\u0458\u0405\u0455\u0457";

const cp1251EncodeMap = new Map();

for (let index = 0; index < cp1251Extra.length; index++) {
  const char = cp1251Extra[index];
  if (char !== "\u0000") {
    cp1251EncodeMap.set(char, 0x80 + index);
  }
}

for (let code = 0x0410; code <= 0x044f; code++) {
  cp1251EncodeMap.set(String.fromCharCode(code), 0xc0 + code - 0x0410);
}

const mojibakeByteChar =
  "\u0080-\u00ff\u0400-\u04ff\u2018-\u201e\u2020-\u2026\u2030\u2039\u203a\u20ac\u2122";
const mojibakePairPattern = new RegExp(
  `[\u0420\u0421][${mojibakeByteChar}]`,
  "g"
);
const mojibakeSegmentPattern = new RegExp(
  `[\u0420\u0421][${mojibakeByteChar}](?:[${mojibakeByteChar}\\s,.:;!?()[\\]_-])*`,
  "g"
);
const mojibakeSubtotalPattern =
  /^\u0420\u0457\u0420\u0455\u0420\u0491\u0421\u2039\u0421\u201A\u0420\u0455\u0420\u0456/i;
const mojibakeAfterNoonPattern =
  /\u0420\u0457\u0420\u0455\u0421\u0403\u0420\u00BB\u0420\u00B5 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F/i;
const mojibakeBeforeNoonPattern =
  /\u0420\u0491\u0420\u0455 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F/i;
const afterNoonPattern =
  /\u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0434\u043d\u044f/i;
const beforeNoonPattern =
  /\u0434\u043e \u043f\u043e\u043b\u0443\u0434\u043d\u044f/i;
const noonMarkerPattern =
  /(\u0420\u0457\u0420\u0455\u0421\u0403\u0420\u00BB\u0420\u00B5 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F|\u0420\u0491\u0420\u0455 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F|\u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0434\u043d\u044f|\u0434\u043e \u043f\u043e\u043b\u0443\u0434\u043d\u044f)/gi;
const commonMojibakeMap = [
  ["\u0420\u0457\u0421\u201A", "\u043f\u0442"],
  ["\u0421\u0081\u0420\u00B1", "\u0441\u0431"],
  ["\u0420\u0406\u0421\u0081", "\u0432\u0441"],
  ["\u0420\u0457\u0420\u0405", "\u043f\u043d"],
  ["\u0420\u0406\u0421\u201A", "\u0432\u0442"],
  ["\u0421\u0081\u0421\u20AC", "\u0441\u0440"],
  ["\u0421\u2021\u0421\u201A", "\u0447\u0442"],
  ["\u0420\u00B8\u0421\u040A\u0420\u00BB\u0421\u040F", "\u0438\u044e\u043b\u044f"],
  ["\u0420\u00B8\u0421\u040A\u0420\u0405\u0421\u040F", "\u0438\u044e\u043d\u044f"],
  ["\u0420\u0458\u0420\u00B0\u0421\u040F", "\u043c\u0430\u044f"],
  ["\u0420\u00B0\u0420\u0457\u0421\u20AC\u0420\u00B5\u0420\u00BB\u0421\u040F", "\u0430\u043f\u0440\u0435\u043b\u044f"],
  ["\u0420\u0458\u0420\u00B0\u0421\u20AC\u0421\u201A\u0420\u00B0", "\u043c\u0430\u0440\u0442\u0430"],
  ["\u0421\u201E\u0420\u00B5\u0420\u0406\u0421\u20AC\u0420\u00B0\u0420\u00BB\u0421\u040F", "\u0444\u0435\u0432\u0440\u0430\u043b\u044f"],
  ["\u0421\u040F\u0420\u0405\u0420\u0406\u0420\u00B0\u0421\u20AC\u0421\u040F", "\u044f\u043d\u0432\u0430\u0440\u044f"],
  ["\u0420\u00B0\u0420\u0406\u0420\u0456\u0421\u0453\u0421\u0081\u0421\u201A\u0420\u00B0", "\u0430\u0432\u0433\u0443\u0441\u0442\u0430"],
  ["\u0421\u0081\u0420\u00B5\u0420\u0405\u0421\u201A\u0421\u040F\u0420\u00B1\u0421\u20AC\u0421\u040F", "\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f"],
  ["\u0420\u0455\u0420\u0454\u0421\u201A\u0421\u040F\u0420\u00B1\u0421\u20AC\u0421\u040F", "\u043e\u043a\u0442\u044f\u0431\u0440\u044f"],
  ["\u0420\u0405\u0420\u0455\u0421\u040F\u0420\u00B1\u0421\u20AC\u0421\u040F", "\u043d\u043e\u044f\u0431\u0440\u044f"],
  ["\u0420\u0491\u0420\u00B5\u0420\u0454\u0420\u00B0\u0420\u00B1\u0421\u20AC\u0421\u040F", "\u0434\u0435\u043a\u0430\u0431\u0440\u044f"],
  [
    "\u0420\u0457\u0420\u0455\u0421\u0081\u0420\u00BB\u0420\u00B5 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F",
    "\u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
  ],
  [
    "\u0420\u0491\u0420\u0455 \u0420\u0457\u0420\u0455\u0420\u00BB\u0421\u0453\u0420\u0491\u0420\u0405\u0421\u040F",
    "\u0434\u043e \u043f\u043e\u043b\u0443\u0434\u043d\u044f",
  ],
];

function mojibakeScore(value) {
  return (String(value).match(mojibakePairPattern) || []).length;
}

function decodeMojibakeChunk(value) {
  const bytes = [];
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code <= 0x7f) {
      bytes.push(code);
    } else if (cp1251EncodeMap.has(char)) {
      bytes.push(cp1251EncodeMap.get(char));
    } else {
      return value;
    }
  }

  try {
    const repaired = new TextDecoder("utf-8", { fatal: true }).decode(
      new Uint8Array(bytes)
    );
    return mojibakeScore(repaired) < mojibakeScore(value) ? repaired : value;
  } catch (error) {
    return value;
  }
}

export function repairMojibake(value) {
  if (typeof value !== "string" || mojibakeScore(value) === 0) {
    return value;
  }

  const repaired = decodeMojibakeChunk(value);
  if (repaired !== value) {
    return applyCommonMojibakeMap(repaired);
  }

  return applyCommonMojibakeMap(
    value.replace(mojibakeSegmentPattern, (chunk) => decodeMojibakeChunk(chunk))
  );
}

function applyCommonMojibakeMap(value) {
  return commonMojibakeMap.reduce(
    (result, [broken, fixed]) => result.split(broken).join(fixed),
    value
  );
}

export function normalizeBackendLabel(value) {
  const repaired = repairMojibake(value);
  if (typeof repaired !== "string") {
    return repaired;
  }

  const normalized = repaired.trim().replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();

  const labelMap = {
    "cash on delivery": "Cash On delivery",
    "cash on delivery ": "Cash On delivery",
    "cash on delivery.": "Cash On delivery",
    "наличными при получении": "Cash On delivery",
    "наличными при доставке": "Cash On delivery",
    "оплата наличными при доставке": "Cash On delivery",
    "record not found": "Record not found",
    "record not found.": "Record not found",
    subtotal: "Order subtotal",
    "order subtotal": "Order subtotal",
    "\u0420\u0457\u0420\u0455\u0420\u0491\u0421\u2039\u0421\u201A\u0420\u0455\u0420\u0456":
      "Order subtotal",
    "payment details": "Payment details",
    cutlery: "Cutlery",
    "if sold out": "If sold out",
    "add items": "Add items",
    "payment method": "Payment Method",
  };

  if (mojibakeSubtotalPattern.test(lower)) {
    return normalized.replace(mojibakeSubtotalPattern, "Order subtotal");
  }

  return labelMap[lower] || normalized;
}

export function formatReadableDateTime(value) {
  const repaired = repairMojibake(value);
  if (typeof repaired !== "string") {
    return repaired;
  }

  const hasRussianPm =
    mojibakeAfterNoonPattern.test(repaired) || afterNoonPattern.test(repaired);
  const hasRussianAm =
    mojibakeBeforeNoonPattern.test(repaired) ||
    beforeNoonPattern.test(repaired);

  let result = repaired
    .replace(/\b(\d{1,2}):(\d{2}):\d{2}\b/g, "$1:$2")
    .replace(/\s+/g, " ")
    .trim();

  if (hasRussianPm || hasRussianAm) {
    result = result.replace(/\b(\d{1,2}):(\d{2})\b/g, (_, hour, minute) => {
      let numericHour = Number(hour);
      if (hasRussianPm && numericHour < 12) numericHour += 12;
      if (hasRussianAm && numericHour === 12) numericHour = 0;
      return `${String(numericHour).padStart(2, "0")}:${minute}`;
    });
  }

  result = result.replace(
    /\b(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)\b/g,
    (_, hour, minute, period) => {
      let numericHour = Number(hour);
      const isPm = period.toLowerCase() === "pm";
      if (isPm && numericHour < 12) numericHour += 12;
      if (!isPm && numericHour === 12) numericHour = 0;
      return `${String(numericHour).padStart(2, "0")}:${minute}`;
    }
  );

  return result.replace(noonMarkerPattern, "").replace(/\s+/g, " ").trim();
}

export function normalizeOrderStatusText(value, translate = (key) => key) {
  const repaired = formatReadableDateTime(normalizeBackendLabel(value));
  const normalized = String(repaired || "").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const lower = normalized.toLowerCase();
  const directMap = {
    canceled: "Canceled",
    cancelled: "Canceled",
    scheduled: "Scheduled",
    "customer cancelled this order": "Customer cancelled this order",
    "order is delayed": "Order is delayed",
    "preparing order delayed": "Preparing order delayed",
    "your order is ready": "Your order is ready",
  };

  if (directMap[lower]) {
    return translate(directMap[lower]);
  }

  if (
    lower ===
    "unfortunately, the restaurant is not able to complete this order due to the following reason: customer cancelled this order"
  ) {
    return translate(
      "Unfortunately, the restaurant is not able to complete this order due to the following reason: Customer cancelled this order"
    );
  }

  const scheduledMatch = normalized.match(/^Your order is scheduled on\s+(.+)$/i);
  if (scheduledMatch) {
    return `${translate("Your order is scheduled on")} ${scheduledMatch[1]}`;
  }

  const arrivingMatch = normalized.match(/^Arriving by\s+(.+)$/i);
  if (arrivingMatch) {
    return `${translate("Arriving by")} ${arrivingMatch[1]}`;
  }

  const preparingMatch = normalized.match(/^(.+)\s+is preparing your order\.?$/i);
  if (preparingMatch) {
    return `${preparingMatch[1]} ${translate("is preparing your order")}`;
  }

  const readyDelayMatch = normalized.match(
    /^(.+?)\s+is running behind schedule\. Your order will be ready soon\.?$/i
  );
  if (readyDelayMatch) {
    return `${translate("Restaurant is running behind schedule")} ${readyDelayMatch[1]}. ${translate("Your order will be ready soon.")}`;
  }

  const deliveryDelayMatch = normalized.match(
    /^We apologize for the delay! Your order is running a little late, but it's on its way and should arrive shortly\.?$/i
  );
  if (deliveryDelayMatch) {
    return translate(
      "We apologize for the delay! Your order is running a little late, but it's on its way and should arrive shortly."
    );
  }

  const translated = translate(normalized);
  return translated === normalized ? normalized : translated;
}
