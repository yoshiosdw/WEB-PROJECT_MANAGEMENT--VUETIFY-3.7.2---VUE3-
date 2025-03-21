<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const props = defineProps({
  task: {
    type: String,
    required: true,
  },
  done: {
    type: String,
    required: true,
  },
  project: {
    type: String,
    required: true,
  },
})

// const allData = computed(() => props.task)

// const totaltask = allData.value.total_task
// const todo = allData.value.total_todo
// const hold = allData.value.total_hold
// const done = allData.value.total_done
// const inprogress = allData.value.total_in_progress

const vuetifyTheme = useTheme()

const alltask = computed(() => props.task)
const alldone = computed(() => props.done)
const project = computed(() => props.project)

const series = computed(() => {
  if (alltask.value && alldone.value) {
    const totalTask = alltask.value
    const totalDone = alldone.value
    
    // Calculate percentage and round it to 2 decimal places
    const percentage = ((totalDone / totalTask) * 100).toFixed(2)
    
    return [parseFloat(percentage)] // Convert the result back to a number
  }
  
  return [0]  
})



const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables

  return {
    labels: ['Completed Task'],
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        offsetY: 10,
        startAngle: -140,
        endAngle: 130,
        hollow: { size: '65%' },
        track: {
          background: `rgba(${hexToRgb(currentTheme['primary'])}, 0.1)`, // Track bar transparan
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            offsetY: -20,
            color: `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['disabled-opacity']})`,
            fontSize: '14px',
            fontWeight: '400',
            fontFamily: 'Public Sans',
          },
          value: {
            offsetY: 10,
            color: `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`,
            fontSize: '38px',
            fontWeight: '600',
            fontFamily: 'Public Sans',
          },
        },
      },
    },
    colors: [`rgba(${hexToRgb(currentTheme['primary'])}, 1)`], // Warna bar progres
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.5,
        gradientToColors: [currentTheme.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [30, 70, 100],
      },
    },
    stroke: { dashArray: 10 },
    grid: {
      padding: {
        top: -20,
        bottom: 5,
      },
    },
    states: {
      hover: { filter: { type: 'none' } },
      active: { filter: { type: 'none' } },
    },
    responsive: [
      {
        breakpoint: 960,
        options: { chart: { height: 280 } },
      },
    ],
  }
})
</script>

<template>
  <VCard
    class="text-center"
    title="Task Report"
  >
    <VDivider />
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="5" 
          sm="6"
        >
          <div class="mb-4">
            <h4 class="text-4xl font-weight-semibold mb-2">
              {{ props.task }}
            </h4>
            <p class="text-sm">
              Total Task
            </p>
          </div>
          <div class="mb-4">
            <h4 class="text-4xl font-weight-semibold mb-2">
              {{ props.project }}
            </h4>
            <p class="text-sm">
              Total Project
            </p>
          </div>
        </VCol>
        <VCol
          cols="12"
          md="5"
        >
          <VueApexCharts
            :options="chartOptions"
            :series="series"
            height="360"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 18px;
}
</style>
