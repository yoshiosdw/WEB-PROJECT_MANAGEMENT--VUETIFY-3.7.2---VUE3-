<script setup>
import { useToast } from 'vue-toastification';
import location from "./location/index.vue";

const toast = useToast()
const currentTab = ref('tab-1')
const tabs = [
  {
    title: 'Lokasi Timbangan',
    icon: 'tabler-map-pin'
  },
  {
    title: 'Jenis Kargo',
    icon: 'tabler-box'
  },
  {
    title: 'Asal Muatan',
    icon: 'tabler-truck'
  },
]


</script>

<template>
  <VRow>
    <VCol cols="2" class="mt-5">
      <VTabs v-model="currentTab" direction="vertical" class="v-tabs-pill">
        <VTab v-for="tab in tabs" :key="tab.title">
          <span>{{ tab.title }}</span>
        </VTab>
      </VTabs>
    </VCol>
    <VCol cols="10" class="mt-5">
      <VWindow v-model="currentTab" touch="false">
        <VWindowItem>
          <location />
        </VWindowItem>
        <VWindowItem>
          <p>Kargo</p>
        </VWindowItem>
        <VWindowItem>
          <p>Truck</p>
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Auth
    redirectIfLoggedIn: false
  </route>