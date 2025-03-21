<script setup>
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'

const props = defineProps({
  priority: {
    type: String,
    required: true,
  },
  lastMonthFirst: {
    type: String,
    required: true,
  },
  lastMonthSecond: {
    type: String,
    required: true,
  },
  lastMonthThree: {
    type: String,
    required: true,
  },
  monthName: {
    type: String,
    required: true,
  },
})

const allData = computed(() => props.priority)

const montOne = computed(() => parseFloat(props.lastMonthFirst))
const montTwo = computed(() => parseFloat(props.lastMonthSecond))
const montThree = computed(() => parseFloat(props.lastMonthThree))

const monthName = computed(() => props.monthName)

const montNameFirst = computed(() => monthName.value.month_name_1)
const montNameTwo = computed(() => monthName.value.month_name_2)
const montNameThree = computed(() => monthName.value.month_name_3)

const vuetifyTheme = useTheme()
const currentTab = ref(0)
const refVueApexChart = ref()

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
          height: 450,
          type: 'area',  // Changed to 'area' for smooth spline effect
          toolbar: { show: false },
        },
        dataLabels: {
          enabled: false,  // Disabling data labels as per example
        },
        stroke: {
          curve: 'smooth',  // Smooth curve for spline effect
          width: 3,  // Adjust line width if needed
        },
        markers: {
          size: 6,  // Adjust the size of the markers
          colors: ['#FF0000'],  // Red color for the markers
          strokeColors: '#FFFFFF',  // White border around the markers
          strokeWidth: 2,  // Border width of the markers
          hover: {
            size: 8,  // Increase size on hover
            sizeOffset: 2,
          },
        },
        grid: {
          show: true,
          borderColor: borderColor,
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
          '#FFFF00', 
          '#FFC0CB', 
          '#FF0000', 
        ],
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            format: 'dd/MM/yy HH:mm',  // Customize tooltip format
          },
        },
        xaxis: {
          type: 'category',  // You can use category here for smooth transitions
          categories: [montNameFirst.value, montNameTwo.value, montNameThree.value],  // Using month names for categories
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
            options: { plotOptions: { area: { curve: 'smooth' } } },
          },
          {
            breakpoint: 590,
            options: {
              dataLabels: {
                style: {
                  fontSize: '12px',
                  fontWeight: 'bold',
                },
              },
              yaxis: { labels: { show: false } },
              grid: {
                padding: {
                  right: 0,
                  left: -20,
                },
              },
            },
          },
        ],
      },
      series: [
        {
          name: 'Project Report',
          data: [montOne.value, montTwo.value, montThree.value],  // Using montOne, montTwo, montThree values
        },
      ],
    },
  ]
})
</script>

<template>
  <VCard>
    <VCardTitle
      class="  text-center"
    >
      3 Month Last Projects
    </VCardTitle>
    <VDivider />
    <VCardText>
      <VueApexCharts
        ref="
      refVueApexChart"
        :key="currentTab"
        :options="chartConfigs[Number(currentTab)].chartOptions"
        :series="chartConfigs[Number(currentTab)].series"
        height="350"  
      />
    </VCardText>
  </VCard>
</template>
