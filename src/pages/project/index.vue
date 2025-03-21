<script setup>
import List from './list/index.vue'
import Board from './kanban/index.vue'
import Summary from './summary/index.vue'
import Configuration from './configuration/index.vue'

const configTab = ref(null)

const tabs = [
  {
    title: 'List',
    icon: 'tabler-list-details',
  },
  {
    title: 'Board',
    icon: 'tabler-layout-kanban',

  },
  {
    title: 'Summary',
    icon: 'tabler-columns-3',

  },
  {
    title: 'Configuration',
    icon: 'tabler-settings',

  },
]
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VTabs
        v-model="configTab"
        direction="horizontal"
        class="v-tabs-pill"
      >
        <VTab
          v-for="tab in tabs"
          :key="tab.title"
          :prepend-icon="tab.icon"
        >
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
      <VDivider class="mt-2" />
      <VWindow
        v-model="configTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <List />
        </VWindowItem>

        <VWindowItem>
          <Board />
        </VWindowItem>

        <VWindowItem>
          <Summary />
        </VWindowItem>

        <VWindowItem>
          <Configuration />
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
