<script setup>
import Type from './type/index.vue'
import Priority from './priority/index.vue'
import Team from './team/index.vue'
import Status from './status/index.vue'
import Department from './department/index.vue'

const configTab = ref(null)

const tabs = [
  {
    title: 'Team',
  },
  {
    title: 'Priority',
  },
  {
    title: 'Type',
  },
  {
    title: 'Status',
  },
  {
    title: 'Department',
  },
]
</script>

<template>
  <VRow>
    <VCol
      cols="3"
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
    <VCol cols="9">
      <VWindow
        v-model="configTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem>
          <Team />
        </VWindowItem>

        <VWindowItem>
          <Priority />
        </VWindowItem>

        <VWindowItem>
          <Type />
        </VWindowItem>

        <VWindowItem>
          <Status />
        </VWindowItem>

        <VWindowItem>
          <Department />
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
