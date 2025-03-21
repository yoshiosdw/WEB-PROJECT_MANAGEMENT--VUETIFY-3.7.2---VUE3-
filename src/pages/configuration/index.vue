<script setup>
import ItemType from './types/index.vue'
import ItemCategory from './categories/index.vue'
import Vendor from './vendor/index.vue'

const configTab = ref(null)

const tabs = [
  {
    title: 'Vendor',
  },
  {
    title: 'Item Type',
  },
  {
    title: 'Item Category',
  },
 
]
</script>

<template>
  <VRow>
    <VCol
      cols="2"
      class="mt-5"
    >
      <VTabs
        v-model="configTab"
        direction="vertical"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.title"
        >
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
    </VCol>
    <VCol cols="10">
      <VWindow
        v-model="configTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <Vendor />
        </VWindowItem>

        <VWindowItem>
          <ItemType />
        </VWindowItem>

        <VWindowItem>
          <ItemCategory />
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>

<style scoped>
.v-tabs-vertical {
  height: 100%;
  border-right: 1px solid #e0e0e0;
}

.v-tabs-vertical .v-tab {
  align-items: start;
  justify-content: start;
}
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
