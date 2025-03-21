<script setup>
import CategoriesChartOverview from '@/views/dashboards/ro/categoriesChartOverview.vue';
import StatusPieChartOverview from '@/views/dashboards/ro/statusPieChartOverview.vue';
import TypesChartOverview from '@/views/dashboards/ro/typesChartOverview.vue';
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VRow>
        <VCol cols="6">
          <!-- <PicChartOverview /> -->
          <CategoriesChartOverview />
        </VCol>
        <VCol cols="6">
          <TypesChartOverview />
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="5" style="height: 400px;">
          <StatusPieChartOverview />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Return
    redirectIfLoggedIn: false
  </route>
