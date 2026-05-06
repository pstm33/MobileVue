const CART_TARGET_SELECTOR = '[data-cart-target="true"]';

function resolveElement(target) {
  if (!target) {
    return null;
  }

  if (target instanceof Element) {
    return target;
  }

  if (target.$el instanceof Element) {
    return target.$el;
  }

  return null;
}

export function animateFlyToCart({ sourceEl, imageSrc } = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const source = resolveElement(sourceEl);
  const cartTarget = document.querySelector(CART_TARGET_SELECTOR);

  if (!source || !cartTarget) {
    return;
  }

  const sourceRect = source.getBoundingClientRect();
  const targetRect = cartTarget.getBoundingClientRect();

  if (!sourceRect.width || !sourceRect.height) {
    return;
  }

  const flyer = document.createElement("div");
  flyer.className = "tagam-cart-flyer";

  const flyerSize = Math.max(42, Math.min(72, sourceRect.width * 0.38));
  const startX = sourceRect.left + sourceRect.width / 2 - flyerSize / 2;
  const startY = sourceRect.top + sourceRect.height / 2 - flyerSize / 2;
  const endX = targetRect.left + targetRect.width / 2 - flyerSize / 2;
  const endY = targetRect.top + targetRect.height / 2 - flyerSize / 2;

  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startX}px`,
    top: `${startY}px`,
    width: `${flyerSize}px`,
    height: `${flyerSize}px`,
    borderRadius: "18px",
    background: "#ffffff",
    border: "2px solid rgba(241, 136, 0, 0.22)",
    boxShadow: "0 16px 30px rgba(77, 44, 10, 0.18)",
    overflow: "hidden",
    zIndex: "9999",
    pointerEvents: "none",
    transformOrigin: "center center",
  });

  if (imageSrc) {
    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = "";
    Object.assign(image.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      background: "#f7f7f7",
    });
    flyer.appendChild(image);
  } else {
    Object.assign(flyer.style, {
      background: "#f18800",
      borderColor: "#f18800",
    });
  }

  document.body.appendChild(flyer);

  const translateX = endX - startX;
  const translateY = endY - startY;
  const arcLift = Math.max(90, Math.min(180, Math.abs(translateY) * 0.55 + 40));
  const firstX = translateX * 0.16;
  const secondX = translateX * 0.52;
  const thirdX = translateX * 0.82;
  const firstY = Math.min(translateY * 0.12, -28) - arcLift * 0.72;
  const secondY = translateY * 0.36 - arcLift;
  const thirdY = translateY * 0.78 - arcLift * 0.18;

  const flyerAnimation = flyer.animate(
    [
      {
        transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
        opacity: 1,
      },
      {
        transform: `translate3d(${firstX}px, ${firstY}px, 0) scale(0.98) rotate(-8deg)`,
        opacity: 1,
        offset: 0.22,
      },
      {
        transform: `translate3d(${secondX}px, ${secondY}px, 0) scale(0.78) rotate(-4deg)`,
        opacity: 0.94,
        offset: 0.58,
      },
      {
        transform: `translate3d(${thirdX}px, ${thirdY}px, 0) scale(0.42) rotate(0deg)`,
        opacity: 0.82,
        offset: 0.86,
      },
      {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(0.22) rotate(0deg)`,
        opacity: 0.14,
      },
    ],
    {
      duration: 760,
      easing: "cubic-bezier(0.18, 0.72, 0.2, 1)",
      fill: "forwards",
    }
  );

  cartTarget.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.06)", offset: 0.2 },
      { transform: "scale(1.18)", offset: 0.55 },
      { transform: "scale(0.92)", offset: 0.76 },
      { transform: "scale(1)" },
    ],
    {
      duration: 420,
      delay: 390,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    }
  );

  flyerAnimation.onfinish = () => {
    flyer.remove();
  };
}
