<template>
  <q-page class="theme-preview-page">
    <div class="theme-preview-shell">
      <header class="theme-preview-header">
        <div class="theme-preview-header__bar">
          <img
            src="/tagam-logo.svg"
            alt="Tagam"
            class="theme-preview-header__logo"
          />

          <div class="theme-preview-header__actions">
            <button class="theme-preview-icon-btn" type="button" aria-label="Cart">
              <q-icon name="eva-shopping-bag-outline" size="24px" />
            </button>
            <button class="theme-preview-icon-btn" type="button" aria-label="Menu">
              <q-icon name="eva-menu-outline" size="26px" />
            </button>
          </div>
        </div>

        <div class="theme-preview-header__eyebrow">Dark 2.0 preview</div>
        <h1 class="theme-preview-header__title">Premium night mode for Tagam</h1>
        <p class="theme-preview-header__copy">
          Warm espresso surfaces, quieter contrast, amber accents and food-first
          imagery instead of the current patchwork of dark overrides.
        </p>
      </header>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Home</div>
        <div class="theme-preview-showcase theme-preview-showcase--home">
          <div class="theme-preview-home-top">
            <div class="theme-preview-location">
              <span class="theme-preview-location__pin">
                <q-icon name="eva-navigation-2-outline" size="16px" />
              </span>
              <div class="theme-preview-location__text">
                <div class="theme-preview-location__eyebrow">Delivery address</div>
                <div class="theme-preview-location__value">
                  Awaza, Turkmenistan
                </div>
              </div>
            </div>

            <div class="theme-preview-search-row">
              <div class="theme-preview-search">
                <q-icon name="eva-search-outline" size="20px" />
                <span>Search food and restaurants</span>
              </div>
              <button class="theme-preview-search-filter" type="button" aria-label="Filter">
                <q-icon name="tune" size="20px" />
              </button>
            </div>
          </div>

          <div class="theme-preview-block">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Selections</span>
              <span class="theme-preview-block__meta">Curated for tonight</span>
            </div>

            <div class="theme-preview-tabs">
              <button
                v-for="tab in selectionTabs"
                :key="tab.label"
                type="button"
                class="theme-preview-tab"
                :class="{ 'theme-preview-tab--active': tab.active }"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="theme-preview-card-row">
              <article
                v-for="item in dishes"
                :key="item.title"
                class="theme-preview-card"
              >
                <div class="theme-preview-card__media">
                  <div
                    class="theme-preview-card__art"
                    :style="{ background: item.art }"
                  ></div>
                </div>
                <div class="theme-preview-card__name">{{ item.title }}</div>
                <div class="theme-preview-card__footer">
                  <div class="theme-preview-card__price">{{ item.price }}</div>
                  <span class="theme-preview-card__plus">
                    <q-icon name="add" size="18px" />
                  </span>
                </div>
              </article>
            </div>
          </div>

          <div class="theme-preview-block theme-preview-block--split">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Cuisines</span>
              <span class="theme-preview-block__meta">Browse by craving</span>
            </div>

            <div class="theme-preview-pills">
              <div
                v-for="cuisine in cuisines"
                :key="cuisine.label"
                class="theme-preview-pill"
              >
                <span class="theme-preview-pill__dot"></span>
                <span>{{ cuisine.label }}</span>
              </div>
              <button class="theme-preview-pill theme-preview-pill--action" type="button">
                <q-icon name="eva-arrow-forward-outline" size="18px" />
              </button>
            </div>
          </div>

          <div class="theme-preview-block">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Restaurants</span>
              <span class="theme-preview-block__meta">6 nearby</span>
            </div>

            <article class="theme-preview-restaurant">
              <div class="theme-preview-restaurant__cover"></div>
              <div class="theme-preview-restaurant__body">
                <div>
                  <div class="theme-preview-restaurant__name">FIRE IT UP!</div>
                  <div class="theme-preview-restaurant__meta">
                    Barbecue, grill, steaks
                  </div>
                </div>
                <div class="theme-preview-restaurant__rating">4.8</div>
              </div>
            </article>

            <article class="theme-preview-restaurant theme-preview-restaurant--secondary">
              <div class="theme-preview-restaurant__cover theme-preview-restaurant__cover--pizza"></div>
              <div class="theme-preview-restaurant__body">
                <div>
                  <div class="theme-preview-restaurant__name">Pizza & Wing</div>
                  <div class="theme-preview-restaurant__meta">
                    Italian, pizza, wings
                  </div>
                </div>
                <div class="theme-preview-restaurant__rating">4.7</div>
              </div>
            </article>
          </div>

          <div class="theme-preview-bottom-nav">
            <button type="button" class="theme-preview-bottom-nav__item theme-preview-bottom-nav__item--active">
              <q-icon name="eva-home-outline" size="18px" />
              <span>Home</span>
            </button>
            <button type="button" class="theme-preview-bottom-nav__item">
              <q-icon name="eva-pricetags-outline" size="18px" />
              <span>Offers</span>
            </button>
            <button type="button" class="theme-preview-bottom-nav__item">
              <q-icon name="eva-shopping-bag-outline" size="18px" />
              <span>Cart</span>
            </button>
            <button type="button" class="theme-preview-bottom-nav__item">
              <q-icon name="eva-person-outline" size="18px" />
              <span>Account</span>
            </button>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Restaurant</div>
        <div class="theme-preview-showcase theme-preview-showcase--restaurant">
          <div class="theme-preview-hero">
            <div class="theme-preview-hero__cover"></div>
            <div class="theme-preview-hero__actions">
              <button type="button" class="theme-preview-hero__action">
                <q-icon name="eva-heart-outline" size="18px" />
              </button>
              <button type="button" class="theme-preview-hero__action">
                <q-icon name="eva-share-outline" size="18px" />
              </button>
            </div>
            <div class="theme-preview-hero__content">
              <div class="theme-preview-hero__title">Coffee House Waffles</div>
              <div class="theme-preview-hero__submeta">Turkmenbashi</div>
              <div class="theme-preview-hero__meta">
                Working hours: 10:00 - 23:00
              </div>
            </div>
          </div>
          <div class="theme-preview-hero__logo">CW</div>

          <div class="theme-preview-grid">
            <div class="theme-preview-stat-card theme-preview-stat-card--wide">
              <q-icon name="eva-car-outline" size="18px" />
              <span class="theme-preview-stat-card__label">Service</span>
              <span class="theme-preview-stat-card__value">Delivery</span>
            </div>
            <div class="theme-preview-stat-card">
              <q-icon name="eva-clock-outline" size="18px" />
              <span class="theme-preview-stat-card__value">10-15 min</span>
            </div>
            <div class="theme-preview-stat-card">
              <q-icon name="eva-pin-outline" size="18px" />
              <span class="theme-preview-stat-card__value">2.3 km</span>
            </div>
          </div>

          <div class="theme-preview-chips">
            <span class="theme-preview-chip theme-preview-chip--active">All</span>
            <span class="theme-preview-chip">Grill</span>
            <span class="theme-preview-chip">Poultry</span>
            <span class="theme-preview-chip">Pizza</span>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Checkout</div>
        <div class="theme-preview-showcase theme-preview-showcase--checkout">
          <div class="theme-preview-checkout-banner">
            <div>
              <div class="theme-preview-checkout-banner__eyebrow">Checkout</div>
              <div class="theme-preview-checkout-banner__title">
                Order checkout
              </div>
            </div>
            <div class="theme-preview-checkout-banner__icon">
              <q-icon name="eva-archive-outline" size="34px" />
            </div>
          </div>

          <div class="theme-preview-block">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Delivery details</span>
              <span class="theme-preview-block__meta">Step-by-step and lighter</span>
            </div>

            <div class="theme-preview-line-item">
              <q-icon name="eva-car-outline" size="18px" />
              <span>Delivery</span>
              <span class="theme-preview-line-item__side">Now</span>
            </div>
            <div class="theme-preview-line-item">
              <q-icon name="eva-pin-outline" size="18px" />
              <span>Turkmenbasy, Turkmenistan</span>
              <span class="theme-preview-line-item__side">2.1 km</span>
            </div>
            <div class="theme-preview-line-item">
              <q-icon name="eva-credit-card-outline" size="18px" />
              <span>Cash payment</span>
              <span class="theme-preview-line-item__side">Selected</span>
            </div>
          </div>

          <div class="theme-preview-block theme-preview-block--compact">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Payment & discounts</span>
              <span class="theme-preview-block__meta">One compact zone</span>
            </div>

            <div class="theme-preview-line-item">
              <q-icon name="eva-pricetag-outline" size="18px" />
              <span>Promo code</span>
              <span class="theme-preview-line-item__side">Add</span>
            </div>
            <div class="theme-preview-line-item">
              <q-icon name="eva-gift-outline" size="18px" />
              <span>Tip for courier</span>
              <span class="theme-preview-line-item__side">Optional</span>
            </div>
          </div>

          <div class="theme-preview-order-list">
            <div class="theme-preview-order-item">
              <div class="theme-preview-order-item__thumb"></div>
              <div class="theme-preview-order-item__content">
                <div class="theme-preview-order-item__name">Chicken ramen</div>
                <div class="theme-preview-order-item__meta">1 item</div>
              </div>
              <div class="theme-preview-order-item__price">30.00</div>
            </div>

            <div class="theme-preview-order-item">
              <div class="theme-preview-order-item__thumb theme-preview-order-item__thumb--orange"></div>
              <div class="theme-preview-order-item__content">
                <div class="theme-preview-order-item__name">Thai style beef</div>
                <div class="theme-preview-order-item__meta">2 items</div>
              </div>
              <div class="theme-preview-order-item__price">110.00</div>
            </div>
          </div>

          <button type="button" class="theme-preview-cta">
            <span>Place order</span>
            <span>140.00</span>
          </button>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Account</div>
        <div class="theme-preview-showcase theme-preview-showcase--account">
          <div class="theme-preview-account-card">
            <div class="theme-preview-account-card__avatar">DS</div>
            <div>
              <div class="theme-preview-account-card__name">Dmitry Samoilov</div>
              <div class="theme-preview-account-card__meta">samoylov@gmail.com</div>
            </div>
          </div>

          <div class="theme-preview-account-grid">
            <div class="theme-preview-mini-panel">
              <q-icon name="eva-file-text-outline" size="20px" />
              <span>Orders</span>
            </div>
            <div class="theme-preview-mini-panel">
              <q-icon name="eva-pin-outline" size="20px" />
              <span>Addresses</span>
            </div>
            <div class="theme-preview-mini-panel">
              <q-icon name="eva-credit-card-outline" size="20px" />
              <span>Payment</span>
            </div>
          </div>

          <div class="theme-preview-block theme-preview-block--account">
            <div class="theme-preview-block__header">
              <span class="theme-preview-block__title">Settings</span>
              <span class="theme-preview-block__meta">Language and preferences</span>
            </div>

            <div class="theme-preview-line-item">
              <q-icon name="eva-globe-outline" size="18px" />
              <span>Language</span>
              <span class="theme-preview-line-item__side">English</span>
            </div>
            <div class="theme-preview-line-item">
              <q-icon name="eva-bell-outline" size="18px" />
              <span>Notifications</span>
              <span class="theme-preview-line-item__side">On</span>
            </div>
            <div class="theme-preview-line-item">
              <q-icon name="eva-log-out-outline" size="18px" />
              <span>Log out</span>
              <span class="theme-preview-line-item__side">Action</span>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Orders</div>
        <div class="theme-preview-showcase theme-preview-showcase--orders">
          <div class="theme-preview-orders-header">
            <div>
              <div class="theme-preview-orders-header__eyebrow">Account</div>
              <div class="theme-preview-orders-header__title">Orders</div>
            </div>
            <div class="theme-preview-orders-tabs">
              <button type="button" class="theme-preview-orders-tabs__item theme-preview-orders-tabs__item--active">
                Recent
              </button>
              <button type="button" class="theme-preview-orders-tabs__item">
                Past
              </button>
            </div>
          </div>

          <div class="theme-preview-orders-search">
            <q-icon name="eva-search-outline" size="18px" />
            <span>Order ID</span>
          </div>

          <article class="theme-preview-order-card">
            <div class="theme-preview-order-card__top">
              <div class="theme-preview-order-card__brand">FI</div>
              <div class="theme-preview-order-card__copy">
                <div class="theme-preview-order-card__name">FIRE IT UP!</div>
                <div class="theme-preview-order-card__meta">#10021 • Apr 1, 2026 • 07:45</div>
              </div>
              <div class="theme-preview-order-card__price">355.00</div>
            </div>
            <div class="theme-preview-order-card__bottom">
              <div class="theme-preview-order-card__progress">
                <span class="theme-preview-order-card__step theme-preview-order-card__step--active">
                  <q-icon name="eva-arrow-forward-outline" size="16px" />
                </span>
                <span class="theme-preview-order-card__line"></span>
                <span class="theme-preview-order-card__step">
                  <q-icon name="eva-settings-2-outline" size="16px" />
                </span>
                <span class="theme-preview-order-card__line"></span>
                <span class="theme-preview-order-card__step">
                  <q-icon name="eva-car-outline" size="16px" />
                </span>
                <span class="theme-preview-order-card__line"></span>
                <span class="theme-preview-order-card__step">
                  <q-icon name="eva-home-outline" size="16px" />
                </span>
              </div>
            </div>
          </article>

          <article class="theme-preview-order-card theme-preview-order-card--secondary">
            <div class="theme-preview-order-card__top">
              <div class="theme-preview-order-card__brand">SG</div>
              <div class="theme-preview-order-card__copy">
                <div class="theme-preview-order-card__name">SUSHI.GOOD</div>
                <div class="theme-preview-order-card__meta">#10020 • Apr 1, 2026 • 06:42</div>
              </div>
              <div class="theme-preview-order-card__price">135.00</div>
            </div>
            <div class="theme-preview-order-card__bottom">
              <div class="theme-preview-order-card__action">Details</div>
              <div class="theme-preview-order-card__repeat">Repeat order</div>
            </div>
          </article>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Track order</div>
        <div class="theme-preview-showcase theme-preview-showcase--track">
          <div class="theme-preview-track-shell">
            <div class="theme-preview-track-head">
              <div class="theme-preview-track-head__eyebrow">Orders</div>
              <div class="theme-preview-track-head__title">Order placed</div>
            </div>

            <div class="theme-preview-track-progress">
              <span class="theme-preview-track-progress__step theme-preview-track-progress__step--active">
                <q-icon name="eva-arrow-forward-outline" size="16px" />
              </span>
              <span class="theme-preview-track-progress__line"></span>
              <span class="theme-preview-track-progress__step">
                <q-icon name="eva-settings-2-outline" size="16px" />
              </span>
              <span class="theme-preview-track-progress__line"></span>
              <span class="theme-preview-track-progress__step">
                <q-icon name="eva-car-outline" size="16px" />
              </span>
              <span class="theme-preview-track-progress__line"></span>
              <span class="theme-preview-track-progress__step">
                <q-icon name="eva-home-outline" size="16px" />
              </span>
            </div>

            <div class="theme-preview-track-note">
              Your order is scheduled on Apr 1, 2026 at 07:45
            </div>

            <div class="theme-preview-track-id">
              <span>Order ID</span>
              <span>#10021</span>
            </div>

            <div class="theme-preview-track-card">
              <div class="theme-preview-track-card__top">
                <div>
                  <div class="theme-preview-track-card__name">L’ULTIMO SPICCHIO PIZZA</div>
                  <div class="theme-preview-track-card__meta">Total</div>
                </div>
                <div class="theme-preview-track-card__price">300.00</div>
              </div>
              <div class="theme-preview-track-card__actions">
                <button type="button" class="theme-preview-track-card__btn">Chat</button>
                <button type="button" class="theme-preview-track-card__btn theme-preview-track-card__btn--icon">
                  <q-icon name="eva-phone-outline" size="18px" />
                </button>
              </div>
            </div>

            <div class="theme-preview-track-route">
              <div class="theme-preview-track-route__item">
                <span class="theme-preview-track-route__dot theme-preview-track-route__dot--merchant"></span>
                <div>
                  <div class="theme-preview-track-route__title">From restaurant</div>
                  <div class="theme-preview-track-route__meta">Turkmenbashi</div>
                </div>
              </div>
              <div class="theme-preview-track-route__item">
                <span class="theme-preview-track-route__dot theme-preview-track-route__dot--home"></span>
                <div>
                  <div class="theme-preview-track-route__title">Delivered to</div>
                  <div class="theme-preview-track-route__meta">Awaza, Turkmenistan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Cart</div>
        <div class="theme-preview-showcase theme-preview-showcase--cart">
          <div class="theme-preview-cart-head">
            <div>
              <div class="theme-preview-cart-head__eyebrow">Basket</div>
              <div class="theme-preview-cart-head__title">Your order</div>
            </div>
            <div class="theme-preview-cart-head__badge">3</div>
          </div>

          <div class="theme-preview-cart-list">
            <article
              v-for="item in cartItems"
              :key="item.title"
              class="theme-preview-cart-card"
            >
              <div
                class="theme-preview-cart-card__thumb"
                :style="{ background: item.art }"
              ></div>
              <div class="theme-preview-cart-card__body">
                <div class="theme-preview-cart-card__top">
                  <div class="theme-preview-cart-card__name">{{ item.title }}</div>
                  <div class="theme-preview-cart-card__price">{{ item.price }}</div>
                </div>
                <div class="theme-preview-cart-card__meta">{{ item.meta }}</div>
                <div class="theme-preview-cart-card__bottom">
                  <button type="button" class="theme-preview-cart-card__link">
                    Edit
                  </button>
                  <div class="theme-preview-qty">
                    <button type="button" class="theme-preview-qty__btn">
                      <q-icon name="remove" size="14px" />
                    </button>
                    <span class="theme-preview-qty__value">{{ item.qty }}</span>
                    <button type="button" class="theme-preview-qty__btn theme-preview-qty__btn--active">
                      <q-icon name="add" size="14px" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div class="theme-preview-cart-summary">
            <div class="theme-preview-cart-summary__row">
              <span>Total</span>
              <strong>232.00</strong>
            </div>
            <button type="button" class="theme-preview-cta">
              <span>Place order</span>
              <span>232.00</span>
            </button>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Item modal</div>
        <div class="theme-preview-showcase theme-preview-showcase--modal">
          <div class="theme-preview-modal">
            <div class="theme-preview-modal__image-wrap">
              <div class="theme-preview-modal__image"></div>
              <button type="button" class="theme-preview-modal__close">
                <q-icon name="close" size="20px" />
              </button>
            </div>

            <div class="theme-preview-modal__content">
              <div class="theme-preview-modal__title-row">
                <div>
                  <div class="theme-preview-modal__title">Chicken cream soup</div>
                  <div class="theme-preview-modal__subtitle">
                    Delicate, warming and silky in texture.
                  </div>
                </div>
                <button type="button" class="theme-preview-modal__fav">
                  <q-icon name="eva-heart-outline" size="20px" />
                </button>
              </div>

              <div class="theme-preview-modal__size">
                <span class="theme-preview-modal__size-label">Size</span>
                <span class="theme-preview-modal__size-value">35.00</span>
              </div>

              <div class="theme-preview-modal__field">
                <span class="theme-preview-modal__field-label">Special instructions</span>
                <div class="theme-preview-modal__field-box"></div>
              </div>

              <div class="theme-preview-modal__footer">
                <div class="theme-preview-qty theme-preview-qty--modal">
                  <button type="button" class="theme-preview-qty__btn">
                    <q-icon name="remove" size="14px" />
                  </button>
                  <span class="theme-preview-qty__value">1</span>
                  <button type="button" class="theme-preview-qty__btn theme-preview-qty__btn--active">
                    <q-icon name="add" size="14px" />
                  </button>
                </div>
                <button type="button" class="theme-preview-cta theme-preview-cta--modal">
                  <span>Add to cart</span>
                  <span>35.00</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Address picker</div>
        <div class="theme-preview-showcase theme-preview-showcase--address">
          <div class="theme-preview-address-shell">
            <div class="theme-preview-address-search">
              <q-icon name="eva-search-outline" size="18px" />
              <span>Search location</span>
            </div>

            <div class="theme-preview-address-group">
              <div class="theme-preview-address-group__title">Current location</div>
              <button type="button" class="theme-preview-address-row">
                <span class="theme-preview-address-row__icon theme-preview-address-row__icon--active">
                  <q-icon name="eva-navigation-2-outline" size="16px" />
                </span>
                <span class="theme-preview-address-row__body">
                  <span class="theme-preview-address-row__name">Use current location</span>
                  <span class="theme-preview-address-row__meta">Awaza, Turkmenistan</span>
                </span>
              </button>
            </div>

            <div class="theme-preview-address-group">
              <div class="theme-preview-address-group__title">Saved addresses</div>
              <button
                v-for="address in addressItems"
                :key="address.name"
                type="button"
                class="theme-preview-address-row"
              >
                <span class="theme-preview-address-row__icon">
                  <q-icon name="eva-pin-outline" size="16px" />
                </span>
                <span class="theme-preview-address-row__body">
                  <span class="theme-preview-address-row__name">{{ address.name }}</span>
                  <span class="theme-preview-address-row__meta">{{ address.meta }}</span>
                </span>
                <q-icon name="eva-arrow-forward-outline" size="16px" />
              </button>
            </div>

            <div class="theme-preview-address-actions">
              <button type="button" class="theme-preview-address-action">
                <q-icon name="eva-search-outline" size="18px" />
                <span>Search for a new address</span>
              </button>
              <button type="button" class="theme-preview-address-action">
                <q-icon name="eva-map-outline" size="18px" />
                <span>Choose on map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Auth</div>
        <div class="theme-preview-showcase theme-preview-showcase--auth">
          <div class="theme-preview-auth">
            <div class="theme-preview-auth__hero">
              <img
                src="/tagam-logo.svg"
                alt="Tagam"
                class="theme-preview-auth__logo"
              />
              <div class="theme-preview-auth__eyebrow">Welcome back</div>
              <div class="theme-preview-auth__title">Sign in to continue</div>
              <div class="theme-preview-auth__copy">
                Save addresses, switch languages and reorder faster in one tap.
              </div>
            </div>

            <div class="theme-preview-auth__form">
              <div class="theme-preview-auth__field">Email address</div>
              <div class="theme-preview-auth__field">Password</div>
              <button type="button" class="theme-preview-cta theme-preview-cta--wide">
                <span>Sign in</span>
              </button>
              <button type="button" class="theme-preview-auth__secondary">
                Create account
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">About restaurant</div>
        <div class="theme-preview-showcase theme-preview-showcase--info">
          <div class="theme-preview-sheet">
            <div class="theme-preview-sheet__header">
              <div>
                <div class="theme-preview-sheet__eyebrow">About us</div>
                <div class="theme-preview-sheet__title">Coffee House Waffles</div>
              </div>
              <button type="button" class="theme-preview-sheet__close">
                <q-icon name="close" size="18px" />
              </button>
            </div>

            <div class="theme-preview-sheet__body">
              <p class="theme-preview-sheet__copy">
                A warm all-day spot for breakfast, desserts and comforting dinner
                plates with a soft premium atmosphere.
              </p>

              <div class="theme-preview-sheet__facts">
                <div class="theme-preview-sheet__fact">
                  <span class="theme-preview-sheet__fact-label">Address</span>
                  <span class="theme-preview-sheet__fact-value">Turkmenbashi, Awaza</span>
                </div>
                <div class="theme-preview-sheet__fact">
                  <span class="theme-preview-sheet__fact-label">Working hours</span>
                  <span class="theme-preview-sheet__fact-value">10:00 - 23:00</span>
                </div>
                <div class="theme-preview-sheet__fact">
                  <span class="theme-preview-sheet__fact-label">Phone</span>
                  <span class="theme-preview-sheet__fact-value">+993 65 00-00-05</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="theme-preview-section">
        <div class="theme-preview-label">Service selection</div>
        <div class="theme-preview-showcase theme-preview-showcase--service">
          <div class="theme-preview-sheet">
            <div class="theme-preview-sheet__header">
              <div>
                <div class="theme-preview-sheet__eyebrow">Service</div>
                <div class="theme-preview-sheet__title">How would you like to order?</div>
              </div>
              <button type="button" class="theme-preview-sheet__close">
                <q-icon name="close" size="18px" />
              </button>
            </div>

            <div class="theme-preview-sheet__body">
              <div class="theme-preview-service-list">
                <button
                  v-for="service in serviceOptions"
                  :key="service.label"
                  type="button"
                  class="theme-preview-service-option"
                  :class="{ 'theme-preview-service-option--active': service.active }"
                >
                  <span class="theme-preview-service-option__icon">
                    <q-icon :name="service.icon" size="18px" />
                  </span>
                  <span class="theme-preview-service-option__copy">
                    <span class="theme-preview-service-option__title">{{ service.label }}</span>
                    <span class="theme-preview-service-option__meta">{{ service.meta }}</span>
                  </span>
                  <q-icon name="eva-checkmark-outline" size="18px" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup>
const selectionTabs = [
  { label: "Offers", active: false },
  { label: "Recommended", active: true },
  { label: "Popular", active: false },
  { label: "Nearby", active: false },
];

const cuisines = [
  { label: "Burgers" },
  { label: "Steaks" },
  { label: "Salads" },
];

const dishes = [
  {
    title: "Set mix",
    price: "45.00",
    art: "radial-gradient(circle at 30% 25%, rgba(255,202,122,0.95), rgba(148,74,19,0.6) 45%, rgba(48,31,22,0.96) 100%)",
  },
  {
    title: "Blue cheese pear",
    price: "78.00",
    art: "radial-gradient(circle at 55% 30%, rgba(245,192,103,0.92), rgba(176,95,34,0.58) 40%, rgba(43,27,19,0.96) 100%)",
  },
  {
    title: "Mini burgers trio",
    price: "95.00",
    art: "radial-gradient(circle at 45% 30%, rgba(255,166,79,0.92), rgba(138,72,26,0.62) 45%, rgba(45,30,23,0.96) 100%)",
  },
];

const cartItems = [
  {
    title: "Chicken ramen",
    price: "30.00",
    qty: 1,
    meta: "Broth, noodles, chicken fillet",
    art: "radial-gradient(circle at 40% 35%, rgba(255,224,140,0.95), rgba(160,96,34,0.62) 46%, rgba(45,30,22,0.96) 100%)",
  },
  {
    title: "Thai style beef",
    price: "55.00",
    qty: 2,
    meta: "Bell pepper, glass noodles, sesame",
    art: "radial-gradient(circle at 45% 35%, rgba(255,175,82,0.95), rgba(138,70,24,0.62) 44%, rgba(45,30,22,0.96) 100%)",
  },
];

const addressItems = [
  {
    name: "Hotel Berkarar",
    meta: "Awaza, Turkmenistan",
  },
  {
    name: "Home",
    meta: "Turkmenbashi, Balkan",
  },
];

const serviceOptions = [
  {
    label: "Delivery",
    meta: "Courier brings your order",
    icon: "eva-car-outline",
    active: true,
  },
  {
    label: "Pickup",
    meta: "Collect it yourself",
    icon: "eva-shopping-bag-outline",
    active: false,
  },
  {
    label: "Dine in",
    meta: "Eat at the restaurant",
    icon: "eva-home-outline",
    active: false,
  },
];
</script>

<style scoped>
.theme-preview-page {
  min-height: 100vh;
  padding: 24px 18px 48px;
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(124, 73, 34, 0.14), transparent 22%),
    linear-gradient(180deg, #140f0d 0%, #191311 46%, #1e1714 100%);
  color: #f6efe7;
}

.theme-preview-shell {
  max-width: 430px;
  margin: 0 auto;
}

.theme-preview-header {
  padding: 18px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 28px;
  background: rgba(34, 27, 23, 0.92);
  box-shadow: 0 20px 42px rgba(0, 0, 0, 0.28);
}

.theme-preview-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.theme-preview-header__logo {
  width: 132px;
  height: auto;
  display: block;
  filter: brightness(1.02);
}

.theme-preview-header__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-preview-icon-btn {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 16px;
  background: rgba(50, 40, 35, 0.92);
  color: #f18800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
}

.theme-preview-header__eyebrow,
.theme-preview-label {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.14);
  color: #f3a23f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-header__eyebrow {
  margin-top: 18px;
}

.theme-preview-header__title {
  margin: 16px 0 10px;
  font-size: 31px;
  line-height: 1.02;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #f6efe7;
}

.theme-preview-header__copy {
  margin: 0;
  color: #bcae9f;
  line-height: 1.55;
}

.theme-preview-section {
  margin-top: 24px;
}

.theme-preview-showcase {
  margin-top: 14px;
  padding: 20px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 30px;
  background: rgba(36, 29, 26, 0.94);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.26);
  position: relative;
  overflow: hidden;
}

.theme-preview-showcase::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.06), transparent 22%),
    linear-gradient(180deg, rgba(255, 248, 240, 0.018), transparent 22%);
  pointer-events: none;
}

.theme-preview-home-top {
  display: grid;
  gap: 12px;
}

.theme-preview-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  gap: 10px;
}

.theme-preview-location {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 62px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(49, 39, 34, 0.96);
}

.theme-preview-location__pin {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.14);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-location__text {
  min-width: 0;
}

.theme-preview-location__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #a89584;
}

.theme-preview-location__value {
  margin-top: 4px;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 800;
  color: #f6efe7;
}

.theme-preview-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 18px;
  background: rgba(49, 39, 34, 0.96);
  color: #a89a8d;
}

.theme-preview-search-filter {
  min-height: 50px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 18px;
  background: rgba(49, 39, 34, 0.96);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.16);
}

.theme-preview-block {
  margin-top: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 26px;
  background: rgba(41, 33, 29, 0.96);
  box-shadow: inset 0 1px 0 rgba(255, 248, 240, 0.03);
}

.theme-preview-block--compact {
  margin-top: 14px;
}

.theme-preview-block__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.theme-preview-block__title {
  font-size: 20px;
  line-height: 1;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-block__meta {
  font-size: 12px;
  color: #ab9988;
}

.theme-preview-tabs,
.theme-preview-chips {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.theme-preview-chips {
  margin-top: 14px;
}

.theme-preview-tab,
.theme-preview-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(55, 44, 38, 0.94);
  color: #d1c5b8;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
}

.theme-preview-tab--active,
.theme-preview-chip--active {
  border-color: rgba(241, 136, 0, 0.16);
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  box-shadow: 0 10px 22px rgba(217, 107, 29, 0.24);
}

.theme-preview-card-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.theme-preview-card {
  padding: 10px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 22px;
  background: rgba(49, 39, 34, 0.98);
  min-height: 176px;
}

.theme-preview-card__media {
  display: flex;
  justify-content: center;
}

.theme-preview-card__art {
  width: 92px;
  height: 92px;
  border-radius: 24px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  box-shadow: inset 0 0 0 1px rgba(255, 250, 243, 0.04);
}

.theme-preview-card__name {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.15;
  font-weight: 800;
  color: #f5efe8;
}

.theme-preview-card__price {
  font-size: 14px;
  color: #c9b7a6;
  font-weight: 700;
}

.theme-preview-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 8px;
}

.theme-preview-card__plus {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 18px rgba(217, 107, 29, 0.22);
}

.theme-preview-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.theme-preview-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(53, 42, 37, 0.96);
  color: #f1e6db;
  font-weight: 700;
}

.theme-preview-pill--action {
  width: 42px;
  min-width: 42px;
  padding: 0;
  justify-content: center;
  color: #f3a23f;
}

.theme-preview-pill__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  box-shadow: 0 0 0 4px rgba(241, 136, 0, 0.12);
}

.theme-preview-restaurant__cover {
  height: 164px;
  border-radius: 24px;
  background:
    radial-gradient(circle at 18% 22%, rgba(209, 37, 16, 0.85), transparent 8%),
    radial-gradient(circle at 83% 72%, rgba(201, 46, 26, 0.85), transparent 7%),
    radial-gradient(circle at 50% 56%, rgba(148, 49, 20, 0.72), transparent 22%),
    linear-gradient(135deg, #2d1f17 0%, #3a271d 100%);
  border: 1px solid rgba(255, 239, 231, 0.08);
}

.theme-preview-restaurant__cover--pizza {
  background:
    radial-gradient(circle at 46% 54%, rgba(255, 133, 48, 0.86), transparent 18%),
    radial-gradient(circle at 32% 44%, rgba(164, 45, 21, 0.82), transparent 8%),
    radial-gradient(circle at 63% 39%, rgba(188, 57, 26, 0.82), transparent 8%),
    linear-gradient(135deg, #2d1f17 0%, #40291e 100%);
}

.theme-preview-restaurant--secondary {
  margin-top: 14px;
}

.theme-preview-restaurant__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-top: 12px;
}

.theme-preview-restaurant__name {
  font-size: 22px;
  line-height: 1.02;
  font-weight: 900;
}

.theme-preview-restaurant__meta {
  margin-top: 6px;
  color: #aa998b;
}

.theme-preview-restaurant__rating {
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.14);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.theme-preview-bottom-nav {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
  padding: 10px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(33, 26, 23, 0.98);
}

.theme-preview-bottom-nav__item {
  min-height: 58px;
  border: 1px solid rgba(255, 239, 231, 0.06);
  border-radius: 18px;
  background: transparent;
  color: #c5b5a6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
}

.theme-preview-bottom-nav__item--active {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  box-shadow: 0 12px 24px rgba(217, 107, 29, 0.24);
}

.theme-preview-hero {
  position: relative;
  min-height: 214px;
  padding: 18px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 26px;
  background: rgba(49, 38, 34, 0.94);
  overflow: hidden;
}

.theme-preview-hero__cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.32)),
    radial-gradient(circle at 24% 40%, rgba(255, 109, 0, 0.44), transparent 18%),
    linear-gradient(135deg, #3a271d 0%, #241915 100%);
}

.theme-preview-hero__actions {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 2;
  display: flex;
  gap: 8px;
}

.theme-preview-hero__action {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 239, 231, 0.1);
  border-radius: 999px;
  background: rgba(32, 23, 19, 0.52);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-hero__content {
  position: relative;
  z-index: 1;
  max-width: 64%;
  padding-top: 92px;
}

.theme-preview-hero__title {
  font-size: 26px;
  line-height: 0.98;
  font-weight: 900;
}

.theme-preview-hero__meta {
  margin-top: 8px;
  color: #e7dace;
  font-weight: 600;
}

.theme-preview-hero__submeta {
  margin-top: 8px;
  color: #d4c4b4;
  font-size: 14px;
  font-weight: 700;
}

.theme-preview-hero__logo {
  position: relative;
  z-index: 2;
  margin: -80px 0 0 auto;
  width: 94px;
  height: 94px;
  border-radius: 999px;
  border: 3px solid #f18800;
  background: #fff8f0;
  color: #1e1714;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
}

.theme-preview-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 12px;
  margin-top: 10px;
}

.theme-preview-stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 72px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(50, 39, 35, 0.96);
  color: #f6efe7;
}

.theme-preview-stat-card--wide {
  gap: 4px;
}

.theme-preview-stat-card__label {
  color: #a89584;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.theme-preview-stat-card__value {
  font-size: 15px;
  line-height: 1.15;
  font-weight: 800;
}

.theme-preview-line-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(48, 38, 34, 0.96);
  color: #f3ebdf;
}

.theme-preview-line-item + .theme-preview-line-item {
  margin-top: 10px;
}

.theme-preview-line-item__side {
  margin-left: auto;
  color: #f3a23f;
  font-weight: 800;
}

.theme-preview-checkout-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(54, 43, 33, 0.96) 0%,
    rgba(43, 34, 29, 0.98) 100%
  );
}

.theme-preview-checkout-banner__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f3a23f;
}

.theme-preview-checkout-banner__title {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-checkout-banner__icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(241, 136, 0, 0.1);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-order-list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.theme-preview-order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 13px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 22px;
  background: rgba(47, 37, 33, 0.98);
}

.theme-preview-order-item__thumb {
  width: 62px;
  height: 62px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 42% 36%, rgba(255, 225, 129, 0.94), rgba(167, 77, 25, 0.6) 45%, rgba(50, 33, 24, 0.96) 100%);
  flex: 0 0 auto;
}

.theme-preview-order-item__thumb--orange {
  background:
    radial-gradient(circle at 44% 38%, rgba(255, 172, 93, 0.94), rgba(188, 77, 27, 0.6) 45%, rgba(50, 33, 24, 0.96) 100%);
}

.theme-preview-order-item__content {
  min-width: 0;
  flex: 1 1 auto;
}

.theme-preview-order-item__name {
  font-size: 16px;
  line-height: 1.1;
  font-weight: 800;
  color: #f6efe7;
}

.theme-preview-order-item__meta {
  margin-top: 6px;
  color: #a89584;
  font-size: 13px;
}

.theme-preview-order-item__price {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-cta {
  width: 100%;
  min-height: 56px;
  margin-top: 16px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 17px;
  font-weight: 900;
  box-shadow: 0 14px 26px rgba(217, 107, 29, 0.24);
}

.theme-preview-account-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(39, 31, 27, 0.96);
}

.theme-preview-account-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.theme-preview-account-card__name {
  font-size: 20px;
  line-height: 1;
  font-weight: 900;
}

.theme-preview-account-card__meta {
  margin-top: 6px;
  color: #a69383;
}

.theme-preview-account-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.theme-preview-block--account {
  margin-top: 16px;
}

.theme-preview-mini-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 88px;
  padding: 12px 10px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 22px;
  background: rgba(47, 37, 33, 0.96);
  color: #f4ede3;
  font-weight: 700;
}

.theme-preview-orders-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
}

.theme-preview-orders-header__eyebrow,
.theme-preview-track-head__eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #c9a277;
}

.theme-preview-orders-header__title,
.theme-preview-track-head__title {
  margin-top: 6px;
  font-size: 28px;
  line-height: 0.98;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-orders-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.theme-preview-orders-tabs__item {
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(50, 39, 35, 0.96);
  color: #cdbdac;
  font-size: 13px;
  font-weight: 700;
}

.theme-preview-orders-tabs__item--active {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
  box-shadow: 0 10px 18px rgba(217, 107, 29, 0.22);
}

.theme-preview-orders-search {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  margin-top: 18px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 22px;
  background: rgba(47, 37, 33, 0.96);
  color: #a89584;
}

.theme-preview-order-card {
  margin-top: 16px;
}

.theme-preview-order-card__top {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: start;
  padding: 18px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 28px 28px 0 0;
  background: rgba(42, 33, 29, 0.98);
}

.theme-preview-order-card__brand {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.92);
  color: #1f1815;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.theme-preview-order-card__copy {
  min-width: 0;
}

.theme-preview-order-card__name {
  font-size: 18px;
  line-height: 1.05;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-order-card__meta {
  margin-top: 8px;
  color: #b3a291;
  font-size: 14px;
  line-height: 1.2;
}

.theme-preview-order-card__price {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #e7d9cb;
}

.theme-preview-order-card__bottom {
  padding: 16px 18px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-top: 0;
  border-radius: 0 0 28px 28px;
  background: rgba(39, 31, 27, 0.98);
}

.theme-preview-order-card__progress {
  display: grid;
  grid-template-columns: 34px 1fr 34px 1fr 34px 1fr 34px;
  align-items: center;
  gap: 8px;
}

.theme-preview-order-card__step {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.08);
  color: #c8b8aa;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-order-card__step--active {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
}

.theme-preview-order-card__line {
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 239, 231, 0.12);
}

.theme-preview-order-card--secondary .theme-preview-order-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.theme-preview-order-card__action {
  color: #82c8ff;
  font-size: 15px;
  font-weight: 800;
}

.theme-preview-order-card__repeat {
  color: #f3a23f;
  font-size: 15px;
  font-weight: 800;
}

.theme-preview-track-shell {
  display: grid;
  gap: 14px;
}

.theme-preview-track-progress {
  display: grid;
  grid-template-columns: 36px 1fr 36px 1fr 36px 1fr 36px;
  align-items: center;
  gap: 8px;
  padding: 12px 0 0;
}

.theme-preview-track-progress__step {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.08);
  color: #c7b7a8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-track-progress__step--active {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
}

.theme-preview-track-progress__line {
  height: 2px;
  border-radius: 999px;
  background: rgba(255, 239, 231, 0.12);
}

.theme-preview-track-note {
  color: #d8c7b8;
  line-height: 1.4;
}

.theme-preview-track-id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(47, 37, 33, 0.96);
  color: #f3ebdf;
  font-weight: 800;
}

.theme-preview-track-card {
  padding: 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(42, 33, 29, 0.98);
}

.theme-preview-track-card__top {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.theme-preview-track-card__name {
  font-size: 20px;
  line-height: 1.05;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-track-card__meta {
  margin-top: 8px;
  color: #a89584;
}

.theme-preview-track-card__price {
  font-size: 20px;
  line-height: 1;
  font-weight: 900;
  color: #e7d9cb;
}

.theme-preview-track-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.theme-preview-track-card__btn {
  min-height: 42px;
  padding: 0 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(49, 39, 34, 0.96);
  color: #e8ddd3;
  font-weight: 800;
}

.theme-preview-track-card__btn--icon {
  width: 42px;
  min-width: 42px;
  padding: 0;
  justify-content: center;
}

.theme-preview-track-route {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(39, 31, 27, 0.98);
}

.theme-preview-track-route__item {
  display: flex;
  align-items: start;
  gap: 12px;
}

.theme-preview-track-route__dot {
  width: 12px;
  height: 12px;
  margin-top: 5px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.theme-preview-track-route__dot--merchant {
  background: #82c8ff;
  box-shadow: 0 0 0 4px rgba(130, 200, 255, 0.12);
}

.theme-preview-track-route__dot--home {
  background: #f18800;
  box-shadow: 0 0 0 4px rgba(241, 136, 0, 0.12);
}

.theme-preview-track-route__title {
  font-weight: 800;
  color: #f6efe7;
}

.theme-preview-track-route__meta {
  margin-top: 4px;
  color: #a89584;
}

.theme-preview-cart-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
}

.theme-preview-cart-head__eyebrow {
  color: #a89584;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-cart-head__title {
  margin-top: 6px;
  font-size: 24px;
  line-height: 1;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-cart-head__badge {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(241, 136, 0, 0.16);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.theme-preview-cart-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.theme-preview-cart-card {
  display: grid;
  grid-template-columns: 86px minmax(0, 1fr);
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(39, 31, 27, 0.96);
}

.theme-preview-cart-card__thumb {
  aspect-ratio: 1 / 1;
  border-radius: 20px;
  background: radial-gradient(circle at 40% 35%, rgba(255,224,140,0.95), rgba(160,96,34,0.62) 46%, rgba(45,30,22,0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 248, 240, 0.06);
}

.theme-preview-cart-card__body {
  min-width: 0;
}

.theme-preview-cart-card__top,
.theme-preview-cart-card__bottom,
.theme-preview-cart-summary__row,
.theme-preview-modal__title-row,
.theme-preview-modal__size,
.theme-preview-modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.theme-preview-cart-card__name,
.theme-preview-modal__title {
  font-size: 18px;
  line-height: 1.08;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-cart-card__price,
.theme-preview-modal__size-value {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #f4e7d9;
}

.theme-preview-cart-card__meta,
.theme-preview-modal__subtitle,
.theme-preview-auth__copy {
  margin-top: 8px;
  color: #a89584;
  line-height: 1.45;
}

.theme-preview-cart-card__bottom {
  margin-top: 14px;
}

.theme-preview-cart-card__link {
  padding: 0;
  border: 0;
  background: transparent;
  color: #f3a23f;
  font-weight: 800;
}

.theme-preview-qty {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 8px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(47, 37, 33, 0.96);
}

.theme-preview-qty--modal {
  padding: 0 6px;
}

.theme-preview-qty__btn {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.08);
  color: #d7c7b7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-qty__btn--active {
  background: linear-gradient(135deg, #f18800 0%, #d96b1d 100%);
  color: #fff8f1;
}

.theme-preview-qty__value {
  min-width: 18px;
  text-align: center;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-cart-summary {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background: rgba(39, 31, 27, 0.96);
}

.theme-preview-cart-summary__row {
  color: #d7c7b7;
  font-size: 15px;
}

.theme-preview-cart-summary__row strong {
  font-size: 20px;
  color: #f6efe7;
}

.theme-preview-showcase--modal,
.theme-preview-showcase--auth {
  overflow: visible;
}

.theme-preview-modal {
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 28px;
  background: rgba(39, 31, 27, 0.98);
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
}

.theme-preview-modal__image-wrap {
  position: relative;
  padding: 18px 18px 0;
}

.theme-preview-modal__image {
  aspect-ratio: 1 / 1;
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 35%, rgba(248, 208, 66, 0.95), rgba(183, 130, 27, 0.72) 40%, rgba(52, 36, 28, 0.96) 100%);
}

.theme-preview-modal__close,
.theme-preview-modal__fav {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(47, 37, 33, 0.96);
  color: #e3d5c8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-modal__close {
  position: absolute;
  top: 30px;
  right: 30px;
}

.theme-preview-modal__content {
  display: grid;
  gap: 14px;
  padding: 18px;
}

.theme-preview-modal__size-label,
.theme-preview-modal__field-label,
.theme-preview-address-group__title {
  color: #a89584;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-modal__field {
  display: grid;
  gap: 8px;
}

.theme-preview-modal__field-box,
.theme-preview-auth__field,
.theme-preview-address-search {
  min-height: 50px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 18px;
  background: rgba(47, 37, 33, 0.96);
}

.theme-preview-modal__field-box {
  box-shadow: inset 0 1px 0 rgba(255, 248, 240, 0.03);
}

.theme-preview-cta--modal {
  min-width: 188px;
}

.theme-preview-address-shell,
.theme-preview-auth__form {
  display: grid;
  gap: 14px;
}

.theme-preview-address-search,
.theme-preview-auth__field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: #a99a8d;
}

.theme-preview-address-group {
  display: grid;
  gap: 10px;
}

.theme-preview-address-row,
.theme-preview-address-action {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  padding: 0 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(39, 31, 27, 0.96);
  color: #eadfd4;
  text-align: left;
}

.theme-preview-address-row__icon {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.08);
  color: #cdbfb0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.theme-preview-address-row__icon--active {
  background: rgba(241, 136, 0, 0.16);
  color: #f3a23f;
}

.theme-preview-address-row__body {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
}

.theme-preview-address-row__name {
  font-weight: 800;
  color: #f6efe7;
}

.theme-preview-address-row__meta {
  color: #a89584;
}

.theme-preview-address-actions {
  display: grid;
  gap: 10px;
  margin-top: 2px;
}

.theme-preview-auth {
  display: grid;
  gap: 18px;
}

.theme-preview-auth__hero {
  padding: 18px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(241, 136, 0, 0.12), transparent 28%),
    rgba(39, 31, 27, 0.98);
}

.theme-preview-auth__logo {
  width: 126px;
  height: auto;
  display: block;
}

.theme-preview-auth__eyebrow {
  margin-top: 18px;
  color: #f3a23f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-auth__title {
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-cta--wide {
  width: 100%;
}

.theme-preview-auth__secondary {
  min-height: 52px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(47, 37, 33, 0.96);
  color: #eadfd4;
  font-weight: 800;
}

.theme-preview-sheet {
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 28px;
  background: rgba(39, 31, 27, 0.98);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.28);
}

.theme-preview-sheet__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 18px 16px;
  border-bottom: 1px solid rgba(255, 239, 231, 0.08);
}

.theme-preview-sheet__eyebrow {
  color: #f3a23f;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-sheet__title {
  margin-top: 6px;
  font-size: 22px;
  line-height: 1.05;
  font-weight: 900;
  color: #f6efe7;
}

.theme-preview-sheet__close {
  width: 38px;
  height: 38px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 999px;
  background: rgba(47, 37, 33, 0.96);
  color: #e3d5c8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.theme-preview-sheet__body {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.theme-preview-sheet__copy {
  margin: 0;
  color: #c8b8aa;
  line-height: 1.55;
}

.theme-preview-sheet__facts {
  display: grid;
  gap: 12px;
}

.theme-preview-sheet__fact {
  display: grid;
  gap: 4px;
  padding: 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(47, 37, 33, 0.96);
}

.theme-preview-sheet__fact-label {
  color: #a89584;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.theme-preview-sheet__fact-value {
  color: #f6efe7;
  font-weight: 800;
}

.theme-preview-service-list {
  display: grid;
  gap: 10px;
}

.theme-preview-service-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 66px;
  padding: 0 14px;
  border: 1px solid rgba(255, 239, 231, 0.08);
  border-radius: 20px;
  background: rgba(47, 37, 33, 0.96);
  color: #d8c8ba;
  text-align: left;
}

.theme-preview-service-option--active {
  border-color: rgba(241, 136, 0, 0.35);
  background: rgba(241, 136, 0, 0.08);
  color: #f6efe7;
}

.theme-preview-service-option__icon {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 248, 240, 0.08);
  color: #f3a23f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.theme-preview-service-option__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  flex: 1 1 auto;
}

.theme-preview-service-option__title {
  color: #f6efe7;
  font-weight: 800;
}

.theme-preview-service-option__meta {
  color: #a89584;
  line-height: 1.35;
}
</style>
