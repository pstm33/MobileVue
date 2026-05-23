import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
import { LocalStorage } from "src/services/storage";

const normalizePrices = (prices) => Object.values(prices ?? {});

const normalizeAddons = (details) => {
  const items = details?.data?.items ?? {};
  const addons = details?.data?.addons ?? {};
  const addonItems = details?.data?.addon_items ?? {};
  const grouped = {};

  Object.entries(items.item_addons ?? {}).forEach(([sizeId, groupIds]) => {
    grouped[sizeId] = Object.values(groupIds)
      .map((groupId) => addons?.[sizeId]?.[groupId])
      .filter(Boolean)
      .map((group) => ({
        subcat_id: group.subcat_id,
        subcategory_name: group.subcategory_name,
        subcategory_description: group.subcategory_description,
        multi_option: group.multi_option,
        multi_option_min: Number(group.multi_option_min ?? 0),
        multi_option_value: Number(group.multi_option_value ?? 0),
        require_addon: Number(group.require_addon ?? 0),
        pre_selected: group.pre_selected,
        sub_items_checked: "",
        sub_items: Object.values(group.sub_items ?? {})
          .map((subItemId) => addonItems[subItemId])
          .filter(Boolean)
          .map((subItem) => ({
            ...subItem,
            checked: false,
            disabled: false,
            qty: 1,
          })),
      }));
  });

  return grouped;
};

const currencyCode = () => LocalStorage.getItem("currency_code") || "TMT";

export const useItemDetailStore = defineStore("itemDetail", {
  state: () => ({
    open: false,
    loading: false,
    error: "",
    slug: "",
    catId: "",
    itemUuid: "",
    details: null,
    prices: [],
    addons: {},
    selectedSizeId: "",
    quantity: 1,
    specialInstructions: "",
  }),
  getters: {
    item: (state) => state.details?.data?.items ?? null,
    merchantId: (state) => state.details?.merchant_id ?? null,
    restaurantName: (state) => state.details?.restaurant_name ?? "",
    soldOutOption: (state) => state.details?.default_sold_out_options?.value ?? "substitute",
    selectedPrice(state) {
      return this.prices.find((price) => String(price.item_size_id) === String(state.selectedSizeId));
    },
    activeAddons(state) {
      return state.addons[state.selectedSizeId] ?? [];
    },
  },
  actions: {
    close() {
      this.open = false;
    },
    async load({ slug, cat_id, item_uuid }) {
      this.open = true;
      this.loading = true;
      this.error = "";
      this.slug = slug;
      this.catId = cat_id;
      this.itemUuid = item_uuid;
      this.quantity = 1;
      this.specialInstructions = "";
      this.details = null;
      this.prices = [];
      this.addons = {};
      this.selectedSizeId = "";

      try {
        const params = new URLSearchParams({
          slug,
          cat_id,
          item_uuid,
          currency_code: currencyCode(),
        }).toString();
        const response = await APIinterface.getMenuItem(params);
        this.details = response.details;
        this.prices = normalizePrices(response.details?.data?.items?.price);
        this.addons = normalizeAddons(response.details);
        this.selectedSizeId = String(this.prices[0]?.item_size_id ?? "");
      } catch (error) {
        this.error = error?.message ?? String(error);
      } finally {
        this.loading = false;
      }
    },
    selectSingle(group, subItemId) {
      group.sub_items_checked = subItemId;
    },
    toggleAddon(group, subItem) {
      if (subItem.disabled && !subItem.checked) return;
      subItem.checked = !subItem.checked;

      const max = Number(group.multi_option_value ?? 0);
      if (group.multi_option === "custom" && max > 0) {
        const selected = group.sub_items.filter((item) => item.checked);
        group.sub_items.forEach((item) => {
          item.disabled = selected.length >= max && !item.checked;
        });
      }
    },
    addonQuantity(subItem, delta) {
      subItem.checked = true;
      subItem.qty = Math.max(1, Number(subItem.qty ?? 1) + delta);
    },
  },
});
