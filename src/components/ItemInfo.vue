<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @before-show="beforeShow"
    :persistent="loading"
  >
    <q-card>
      <q-toolbar>
        <q-toolbar-title class="text-weight-bold text-subtitle1">
          {{ getFirstItem.item_name }}
        </q-toolbar-title>
        <q-space></q-space>
        <div class="column items-end">
          <div class="col text-weight-bold text-subtitle1 line-normal">
            <NumberFormat
              :amount="getFirstItem.price.price_after_discount"
              :money_config="money_config"
            ></NumberFormat>
          </div>
          <div class="col text-caption">
            {{ translateOrFallback("base price", "базовая цена") }}
          </div>
        </div>
      </q-toolbar>
      <q-space style="height: 5px" class="tagam-surface-muted"></q-space>
      <!-- <pre>{{ data }}</pre> -->
      <q-list>
        <template v-for="items in data" :key="items">
          <q-item clickable>
            <q-item-section avatar top>
              <q-responsive style="width: 50px; height: 50px">
                <img
                  :src="items.url_image"
                  lazy
                  fit="scale-down"
                  class="radius8"
                  spinner-color="secondary"
                  spinner-size="sm"
                  placeholder-src="placeholder.png"
                />
              </q-responsive>
            </q-item-section>
            <q-item-section top>
              <div class="text-subtitle2 line-normal ellipsis">
                {{ items.item_name }}
              </div>
              <div class="text-caption" v-if="items.price.size_name != ''">
                ({{ items.price.size_name }})
              </div>

              <!-- details -->
              <div class="text-caption tagam-text-muted line-normal">
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
              <!-- details -->

              <q-btn
                :label="translateOrFallback('Edit', 'Изменить')"
                no-caps
                text-color="blue"
                padding="5px 0px"
                flat
                align="left"
                @click="editItem(items)"
              ></q-btn>
            </q-item-section>
            <q-item-section side>
              <div
                class="border-primary q-pa-xs radius28 flex items-center q-gutter-x-xs"
              >
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
                <div class="text-caption">
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
      <q-card-actions align="center">
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
            {{ translateOrFallback("Add Another", "Добавить ещё") }}
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
    translateOrFallback(key, fallback) {
      return this.$te?.(key) ? this.$t(key) : fallback;
    },
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





