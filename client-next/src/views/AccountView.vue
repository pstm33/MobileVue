<script setup>
import { runtimeConfig } from "@/config/runtime"
import { useAppStore } from "@/stores/app"

const store = useAppStore()
</script>

<template>
  <section class="app-page">
    <section class="section-card profile-panel">
      <div class="profile-panel__row">
        <div class="avatar-orb">TN</div>
        <div>
          <div class="section-title">Integration status</div>
          <div class="section-copy">
            This page now reflects the real app context instead of mock profile content.
          </div>
        </div>
      </div>

      <div class="hero-stats hero-stats--compact">
        <div class="metric-card metric-card--light">
          <strong>{{ store.city }}</strong>
          <span>current live place</span>
        </div>
        <div class="metric-card metric-card--light">
          <strong>{{ store.banners.length }}</strong>
          <span>live banners</span>
        </div>
        <div class="metric-card metric-card--light">
          <strong>{{ store.collections.length }}</strong>
          <span>real API shelves</span>
        </div>
      </div>
    </section>

    <section class="section-card">
      <div class="section-head">
        <div>
          <div class="section-title">Runtime configuration</div>
          <div class="section-copy">Useful while we wire the full client stack to the existing backend.</div>
        </div>
      </div>

      <div class="list-stack">
        <article class="feed-row feed-row--compact">
          <div class="feed-row__cover feed-row__cover--neutral"></div>
          <div class="feed-row__body">
            <div class="feed-row__top">
              <h3>API base</h3>
              <span>live</span>
            </div>
            <p>{{ runtimeConfig.apiBaseUrl }}</p>
          </div>
        </article>

        <article class="feed-row feed-row--compact">
          <div class="feed-row__cover feed-row__cover--neutral"></div>
          <div class="feed-row__body">
            <div class="feed-row__top">
              <h3>Selected address</h3>
              <span>stored</span>
            </div>
            <p>{{ store.selectedPlaceLabel }}</p>
          </div>
        </article>

        <article class="feed-row feed-row--compact">
          <div class="feed-row__cover feed-row__cover--neutral"></div>
          <div class="feed-row__body">
            <div class="feed-row__top">
              <h3>Portability</h3>
              <span>ready</span>
            </div>
            <p>Environment-driven config, relative paths, and standalone folder structure.</p>
          </div>
        </article>
      </div>
    </section>
  </section>
</template>
