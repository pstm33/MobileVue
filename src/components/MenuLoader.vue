<template>
  <template v-if="loading_type == 'list'">
    <q-list>
      <q-item v-for="ske in 5" :key="ske">
        <q-item-section top avatar>
          <q-skeleton height="90px" width="110px" class="radius8" square />
        </q-item-section>
        <q-item-section top>
          <q-skeleton type="text"></q-skeleton>
          <q-skeleton type="text"></q-skeleton>
          <q-skeleton type="text" width="100px"></q-skeleton>
        </q-item-section>
        <q-item-section side class="row items-stretch">
          <div class="column items-center col-12 q-gutter-y-sm">
            <div class="col" v-for="ske in 2" :key="ske">
              <q-skeleton type="circle" size="2.4em" />
            </div>
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </template>

  <template v-else-if="loading_type == 'merchant_header'">
    <q-skeleton height="150px" square />
    <q-list>
      <q-item>
        <q-item-section avatar>
          <q-skeleton
            height="50px"
            width="50px"
            square
            class="radius8"
          ></q-skeleton>
        </q-item-section>
        <q-item-section>
          <q-skeleton type="text" width="150px"></q-skeleton>
          <q-skeleton type="text"></q-skeleton>
        </q-item-section>
      </q-item>
    </q-list>

    <div class="q-pl-md q-pr-md q-gutter-y-md">
      <div class="q-gutter-x-md flex items-center">
        <div v-for="items in 3" :key="items">
          <q-skeleton type="QBtn" class="radius28"></q-skeleton>
        </div>
      </div>

      <div class="border-grey radius8 q-pa-sm text-caption">
        <div class="row items-center justify-center">
          <div v-for="items in 3" :key="items" class="col text-center">
            <q-skeleton type="QCheckbox" style="margin: auto"></q-skeleton>
          </div>
        </div>
      </div>

      <q-skeleton
        v-if="merchant_loading"
        type="QChip"
        style="height: 35px"
        class="full-width"
      />
    </div>
  </template>

  <template v-else-if="loading_type == 'grid'">
    <div class="row items-start q-col-gutter-md q-pl-md q-pr-md">
      <div class="col-6 q-gutter-y-xs" v-for="items in 4" :key="items">
        <q-skeleton height="8em" square class="radius8"></q-skeleton>
        <q-skeleton type="text" style="width: 70%; margin: auto"></q-skeleton>
      </div>
    </div>
  </template>

  <template v-else-if="loading_type == 'list-only'">
    <q-item v-for="items in 4" :key="items" dense>
      <q-item-section>
        <q-item-label>
          <q-skeleton type="rect"></q-skeleton>
        </q-item-label>
      </q-item-section>
    </q-item>
  </template>

  <!-- //end -->
</template>

<script>
export default {
  name: "MenuLoader",
  props: ["loading_type"],
  setup() {
    return {};
  },
};
</script>
