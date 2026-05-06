<script setup>
import { onMounted, ref } from "vue"
import { useAppStore } from "@/stores/app"

const store = useAppStore()
const tokenInput = ref(store.clientToken)

async function saveAndLoad() {
  store.setClientToken(tokenInput.value)
  await store.loadDashboard()
  await store.loadOrders("recent")
}

onMounted(async () => {
  if (store.clientToken) {
    await store.loadOrders("recent")
  }
})
</script>

<template>
  <section class="app-page">
    <section class="section-card">
      <div class="section-head">
        <div>
          <div class="section-title">Реальные заказы требуют авторизацию клиента</div>
          <div class="section-copy">
            Каталог можно смотреть анонимно, но история заказов и повторный заказ требуют клиентский токен.
          </div>
        </div>
      </div>

      <form class="orders-auth" @submit.prevent="saveAndLoad">
        <label class="search-field">
          <span class="search-field__icon">◎</span>
          <input
            v-model="tokenInput"
            type="text"
            placeholder="Вставьте клиентский токен"
          />
        </label>
        <button class="search-submit-button" type="submit">Загрузить заказы</button>
      </form>

      <div class="helper-copy">
        Токен хранится только в этом браузере. Без него экран не подменяет историю заказов заглушками.
      </div>
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <div class="section-title">История заказов</div>
          <div class="section-copy">Источник: `/interface/OrderList` по клиентскому токену.</div>
        </div>
      </div>

      <div v-if="store.ordersLoading" class="helper-copy">Загружаем реальные заказы...</div>
      <div v-else-if="store.ordersError" class="helper-copy">{{ store.ordersError }}</div>
      <div v-else-if="!store.orders.length" class="helper-copy">
        Пока нет загруженных заказов.
      </div>

      <div v-else class="list-stack">
        <article v-for="order in store.orders" :key="order.order_uuid || order.order_id" class="feed-row">
          <div class="feed-row__cover feed-row__cover--neutral"></div>
          <div class="feed-row__body">
            <div class="feed-row__top">
              <h3>{{ order.restaurant_name }}</h3>
              <span>{{ order.total }}</span>
            </div>
            <p>#{{ order.order_id }} · {{ order.date_created }}</p>
            <div class="feed-row__meta">
              <span>{{ order.status }}</span>
              <span>{{ order.order_type }}</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
