<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const props = defineProps({
  priority: {
    type: String,
    required: true,
  },
})

const allData = computed(() => props.priority)

const vuetifyTheme = useTheme()
const currentTab = ref(0)
const refVueApexChart = ref()

const low = allData.value.total_low
const lowest = allData.value.total_lowest
const medium = allData.value.total_medium
const height = allData.value.total_height
const heighest = allData.value.total_heigest

const chartConfigs = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${hexToRgb(currentTheme.primary)},${variableTheme['dragged-opacity']})`
  const legendColor = `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`
  const borderColor = `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`
  const labelColor = `rgba(${hexToRgb(currentTheme['on-surface'])},${variableTheme['disabled-opacity']})`

  return [
    {
      chartOptions: {
        chart: {
          parentHeightOffset: 0,
          type: 'bar',
          toolbar: { show: false },
        },
        plotOptions: {
          bar: {
            columnWidth: '32%',
            startingShape: 'rounded',
            borderRadius: 4,
            distributed: true,
            dataLabels: { position: 'top' },
          },
        },
        grid: {
          show: false,
          padding: {
            top: 0,
            bottom: 0,
            left: -10,
            right: -10,
          },
        },
        colors: [
          '#008000', 
          '#90EE90', 

          // '#FFFF00', 
          '#FFD700',
          '#FFC0CB', 
          '#FF0000', 
        ],
        dataLabels: {
          offsetY: -25,
          style: {
            fontSize: '15px',
            colors: [legendColor],
            fontWeight: 'bold',
            fontFamily: 'Public Sans',
          },
        },
        legend: { show: false },
        tooltip: { enabled: false },
        xaxis: {
          categories: [
            'Lowest',
            'Low',
            'Medium',
            'Hight',
            'Highest',
          ],
          axisBorder: {
            show: true,
            color: borderColor,
          },
          axisTicks: { show: false },
          labels: {
            style: {
              colors: labelColor,
              fontSize: '14px',
              fontFamily: 'Public Sans',
              fontWeight: 'bold',
            },
          },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            style: {
              fontSize: '14px',
              colors: labelColor,
              fontFamily: 'Public Sans',
              fontWeight: 'bold',
            },
            min: 0,
            max: 60000,
            tickAmount: 6,
          },
        },
        responsive: [
          {
            breakpoint: 1441,
            options: { plotOptions: { bar: { columnWidth: '41%' } } },
          },
          {
            breakpoint: 590,
            options: {
              plotOptions: { bar: { columnWidth: '61%' } },
              yaxis: { labels: { show: false } },
              grid: {
                padding: {
                  right: 0,
                  left: -20,
                },
              },
              dataLabels: {
                style: {
                  fontSize: '12px',
                  fontWeight: 'bold',
                },
              },
            },
          },
        ],
      },
      series: [
        {
          data: [
            allData.value.total_lowest || 0,
            allData.value.total_low || 0,
            allData.value.total_medium || 0,
            allData.value.total_height || 0,
            allData.value.total_heigest || 0,
          ],
        },
      ],
    },
  ]
})
</script>

<template>
  <VCard
    class="text-center"
    title="Priority Report"
  >
    <VDivider />
    <VCardText>
      <VueApexCharts
        ref="refVueApexChart"
        :key="currentTab"
        :options="chartConfigs[Number(currentTab)].chartOptions"
        :series="chartConfigs[Number(currentTab)].series"
        height="267"
      />
    </VCardText>
  </VCard>
</template>
