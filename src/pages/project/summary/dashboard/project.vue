<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const props = defineProps({
  project: {
    type: String,
    required: true,
  },
})


const vuetifyTheme = useTheme()

const allProject = computed(() => props.task)
const alldone = computed(() => props.done)

const series = computed(() => {
  if (allProject.value && alldone.value) {
    const totalTask = allProject.value
    const totalDone = alldone.value
    
    return [(totalDone / totalTask) * 100] 
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
          background: currentTheme.surface,
          strokeWidth: '100%',
        },
        dataLabels: {
          name: {
            offsetY: -20,
            color: `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['disabled-opacity'] })`,
            fontSize: '14px',
            fontWeight: '400',
            fontFamily: 'Public Sans',
          },
          value: {
            offsetY: 10,
            color: `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['high-emphasis-opacity'] })`,
            fontSize: '38px',
            fontWeight: '600',
            fontFamily: 'Public Sans',
          },
        },
      },
    },
    colors: [currentTheme.primary],
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.5,
        gradientToColors: [currentTheme.primary],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 0.6,
        stops: [
          30,
          70,
          100,
        ],
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
    responsive: [{
      breakpoint: 960,
      options: { chart: { height: 280 } },
    }],
  }
})
</script>

<template>
  <VCard
    title="Task Report"
  >
    <VCardText>
      <VRow>
        <VCol
          cols="12"
          md="5"
          sm="6"
          style="text-align: center;"
        >
          <div class="mb-4">
            <h4 class="text-4xl font-weight-semibold mb-2">
              {{ props.task }}
            </h4>
            <p class="text-sm">
              Total Task
            </p>
          </div>
        </VCol>
        <VCol
          cols="12"
          md="7"
          sm="6"
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
