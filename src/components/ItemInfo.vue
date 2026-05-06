<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @before-show="beforeShow"
    :persistent="loading"
  >
    <q-card class="item-info-sheet">
      <div class="item-info-sheet__handle-wrap">
        <div class="item-info-sheet__handle"></div>
      </div>

      <q-toolbar class="item-info-sheet__toolbar">
        <q-toolbar-title class="item-info-sheet__title">
          {{ getFirstItem.item_name }}
        </q-toolbar-title>
        <div class="item-info-sheet__price">
          <div class="item-info-sheet__price-value">
            <NumberFormat
              :amount="getFirstItem.price.price_after_discount"
              :money_config="money_config"
            ></NumberFormat>
          </div>
          <div class="item-info-sheet__price-label">
            {{ $t("base price") }}
          </div>
        </div>
      </q-toolbar>

      <q-list class="item-info-sheet__list">
        <template v-for="items in data" :key="items">
          <q-item clickable class="item-info-sheet__item">
            <q-item-section avatar top>
              <q-responsive style="width: 64px; height: 64px">
                <q-img
                  :src="items.url_image"
                  lazy
                  fit="scale-down"
                  class="item-info-sheet__image"
                  spinner-color="secondary"
                  spinner-size="sm"
                  placeholder-src="placeholder.png"
                />
              </q-responsive>
            </q-item-section>
            <q-item-section top>
              <div class="item-info-sheet__item-title">
                {{ items.item_name }}
              </div>
              <div class="item-info-sheet__item-size" v-if="items.price.size_name != ''">
                ({{ items.price.size_name }})
              </div>

              <div class="item-info-sheet__item-details">
                <div v-if="items.attributes">
                  <template
                    v-for="attributes in items.attributes"
                    :key="attributes"
                  >
                    <template
                      v-for="attributes_data in attributes"
                      :key="attributes_data"
                    >
                      <span class="q-mr-xs">{{ attributes_data }},</span>
                    </template>
                  </template>
                </div>

                <template v-for="addons in items.addons" :key="addons">
                  <div
                    v-for="addon_items in addons.addon_items"
                    :key="addon_items"
                  >
                    {{ addon_items.sub_item_name }}
                  </div>
                </template>

                <div
                  v-if="items.special_instructions != ''"
                  class="text-blue-grey-6"
                >
                  "{{ items.special_instructions }}"
                </div>
              </div>

              <q-btn
                :label="$t('Edit')"
                no-caps
                color="primary"
                padding="4px 0px"
                flat
                align="left"
                class="item-info-sheet__edit"
                @click="editItem(items)"
              ></q-btn>
            </q-item-section>
            <q-item-section side>
              <div class="item-info-sheet__qty">
                <div>
                  <q-btn
                    v-if="items.qty == 1"
                    flat
                    size="sm"
                    padding="3px 7px"
                    icon="eva-trash-outline"
                    color="grey"
                    @click="removeItem(items)"
                  ></q-btn>
                  <q-btn
                    v-else
                    flat
                    size="sm"
                    padding="3px 7px"
                    icon="eva-minus-outline"
                    color="grey"
                    @click="updateCartQty(-1, items.qty, items)"
                  ></q-btn>
                </div>
                <div class="item-info-sheet__qty-value">
                  {{ items.qty }}
                </div>
                <div>
                  <q-btn
                    @click="updateCartQty(1, items.qty, items)"
                    flat
                    size="sm"
                    padding="3px 7px"
                    icon="eva-plus-outline"
                    color="grey"
                  ></q-btn>
                </div>
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>

      <q-card-actions align="center" class="item-info-sheet__actions">
        <q-btn
          unelevated
          rounded
          color="primary"
          no-caps
          size="lg"
          class="fit"
          @click="makeAnother"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Add Another") }}
          </div>
        </q-btn>
      </q-card-actions>

      <q-inner-loading
        :showing="loading"
        color="primary"
        size="lg"
        label-class="dark"
        class="z-top"
      />
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  props: ["money_config", "cart_uuid"],
  name: "ItemInfo",
  components: {
    NumberFormat: defineAsyncComponent(() =>
      import("components/NumberFormat.vue")
    ),
  },
  data() {
    return {
      modal: false,
      data: null,
      item_qty: 0,
      loading: false,
    };
  },
  computed: {
    getFirstItem() {
      return this.data[0] ?? null;
    },
    hasData() {
      return Object.keys(this.data).length > 0;
    },
  },
  methods: {
    editItem(value) {
      this.$emit(
        "showItemdetails",
        value.cat_id,
        value.item_token,
        value.cart_row
      );
      this.modal = false;
    },
    makeAnother() {
      const item = this.getFirstItem;
      this.$emit("showItemdetails", item.cat_id, item.item_token);
      this.modal = false;
    },
    async removeItem(value) {
      try {
        this.loading = true;
        await APIinterface.removeCartItem(this.cart_uuid, value.cart_row);
        this.$emit("afterUpdateqty");
        this.modal = false;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async updateCartQty(Qty, itemQty, item) {
      let QtyTotal = itemQty + Qty;
      item.qty = QtyTotal;
      try {
        this.loading = true;
        await APIinterface.updateCartItems(
          this.cart_uuid,
          item.cart_row,
          QtyTotal
        );
        this.$emit("afterUpdateqty");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.item-info-sheet {
  border-radius: 30px 30px 0 0;
  background: rgba(255, 249, 240, 0.98);
  border: 1px solid rgba(113, 74, 24, 0.12);
  box-shadow: 0 22px 44px rgba(70, 41, 12, 0.18);
  overflow: hidden;
}

.item-info-sheet__handle-wrap {
  display: flex;
  justify-content: center;
  padding: 10px 0 2px;
}

.item-info-sheet__handle {
  width: 46px;
  height: 5px;
  border-radius: 999px;
  background: rgba(113, 74, 24, 0.2);
}

.item-info-sheet__toolbar {
  min-height: 72px;
  padding: 8px 18px 12px;
  border-bottom: 1px solid rgba(113, 74, 24, 0.08);
}

.item-info-sheet__title {
  font-size: 18px;
  line-height: 1.1;
  font-weight: 900;
  color: #20160f;
}

.item-info-sheet__price {
  text-align: right;
  padding-left: 12px;
}

.item-info-sheet__price-value {
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
  color: #20160f;
}

.item-info-sheet__price-label {
  margin-top: 4px;
  font-size: 11px;
  color: #8a6a4e;
}

.item-info-sheet__list {
  padding: 8px 10px 0;
}

.item-info-sheet__item {
  margin-bottom: 8px;
  border-radius: 22px;
  background: rgba(255, 252, 247, 0.86);
  box-shadow: 0 10px 22px rgba(87, 52, 18, 0.05);
}

.item-info-sheet__image {
  border-radius: 16px;
  background: rgba(244, 239, 229, 0.8);
}

.item-info-sheet__item-title {
  font-size: 16px;
  line-height: 1.15;
  font-weight: 800;
  color: #1f150d;
}

.item-info-sheet__item-size {
  margin-top: 2px;
  font-size: 12px;
  color: #8a6a4e;
}

.item-info-sheet__item-details {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.35;
  color: #6f6254;
}

.item-info-sheet__edit {
  margin-top: 6px;
  font-weight: 700;
}

.item-info-sheet__qty {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 999px;
  border: 1px solid rgba(217, 107, 29, 0.28);
  background: rgba(255, 249, 240, 0.92);
}

.item-info-sheet__qty-value {
  min-width: 18px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: #20160f;
}

.item-info-sheet__actions {
  padding: 10px 14px 14px;
  border-top: 1px solid rgba(113, 74, 24, 0.08);
}
</style>
