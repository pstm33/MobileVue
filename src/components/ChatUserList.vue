<template>
  <q-list class="tagam-chat-user-list">
    <q-item-label v-if="headerTitle" header class="tagam-chat-user-header">
      {{ headerTitle }}
    </q-item-label>
    <template v-for="items in data" :key="items">
      <q-item
        class="tagam-chat-user-item"
        clickable
        @click="$emit('onChatuser', items.client_uuid, items)"
      >
        <q-item-section avatar>
          <q-avatar class="tagam-chat-user-avatar">
            <img :src="items.photo_url" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label class="tagam-chat-user-name">
            {{ items.first_name }}
          </q-item-label>
          <q-item-label class="tagam-chat-user-type">
            {{ formatUserType(items.user_type) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="eva-chevron-right-outline" class="tagam-text-muted" />
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script>
export default {
  name: "ChatUserList",
  props: ["data", "headerTitle"],
  emits: ["onChatuser"],
  methods: {
    formatUserType(userType) {
      const type = `${userType || ""}`.toLowerCase();
      if (type === "merchant") return this.$t("Restaurant");
      if (type === "admin") return this.$t("Support");
      if (type === "driver") return this.$t("Driver");
      if (type === "customer") return this.$t("Customer");
      return userType || this.$t("Chat");
    },
  },
};
</script>

<style lang="scss">
.tagam-chat-user-list {
  display: grid;
  gap: 12px;
  padding: 0 16px 22px;
}

.tagam-chat-user-header {
  padding: 12px 2px 2px;
  color: var(--tagam-text);
  font-size: 20px;
  line-height: 1.12;
  font-weight: 950;
}

.tagam-chat-user-item {
  min-height: 82px;
  padding: 14px;
  border: 1px solid var(--tagam-border);
  border-radius: 22px;
  background: var(--tagam-surface);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-chat-user-avatar {
  width: 54px;
  height: 54px;
  border: 1px solid var(--tagam-border);
  box-shadow: var(--tagam-shadow-soft);
}

.tagam-chat-user-name {
  color: var(--tagam-text);
  font-size: 16px;
  line-height: 1.14;
  font-weight: 900;
}

.tagam-chat-user-type {
  margin-top: 4px;
  color: var(--tagam-text-muted);
  font-size: 13px;
  font-weight: 700;
}
</style>
