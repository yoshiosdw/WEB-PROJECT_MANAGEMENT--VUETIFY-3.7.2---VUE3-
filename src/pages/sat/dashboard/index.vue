<script setup>
import { useRouter } from 'vue-router'
import { useJobOrder } from '../useJobOrderStore'
import OutStanding from './outstanding/outStanding.vue'
import ChartSatClose from './summary-jo-qty/chartSatClose.vue'
import ChartSat from './summary-jo/chartSat.vue'

const jobOrderStore = useJobOrder()
const router = useRouter()

const handleOutStanding = val => {
  const task = val
  
  jobOrderStore.task= task
  router.push({name:'sat'})
  
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <OutStanding @outstanding="handleOutStanding"/>
    </VCol>
    <VSpacer />
        
    <!--
      <VCol cols="12">
      <VRow>
      <VCol cols="6">
      <PieChartOverview />
      </VCol>
      <VCol
      cols="6"
      class="chart-container"
      >
      <ChartOverview /> 
      </VCol>
      </VRow>
      </VCol>
    -->

    <!--
      <VCol cols="12">
      <VRow>
      <VCol cols="6">
      <ChartSat />
      </VCol>
      <VCol
      cols="6"
      class="chart-container"
      >
      <ChartSatClose />

      </VCol>
      </VRow>
      </VCol>
    -->

    <VCol cols="12">
      <ChartSat />
    </VCol>
    <VCol>
      <ChartSatClose />
</VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
  </route>
