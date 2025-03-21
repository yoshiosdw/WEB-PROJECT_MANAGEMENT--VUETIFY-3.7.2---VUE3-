<script setup>
import axiosIns from '@/plugins/axios'
import { hexToRgb } from '@layouts/utils'
import Swal from 'sweetalert2'
import { onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'

const vuetifyTheme = useTheme()
const refVueApexChart = ref()
const data = ref([])
const monthData = ref([])
const newArray = ref()
const countData = ref([])

const fetchCount = async () => {
  try {
    const ret = await axiosIns.get('/job/order/count' )

    data.value = ret.data.data
    monthData.value = data.value.map(counts => counts.month)
    countData.value = data.value.map(counts => counts.count_jo)
    newArray.value = [{
      data: countData.value,
    }]
    chartCount()
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchCount()
})

const chartCount = () => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const labelPrimaryColor = `rgba(${ hexToRgb(currentTheme.primary) },${ variableTheme['dragged-opacity'] })`
  const legendColor = `rgba(${ hexToRgb(currentTheme['on-background']) },${ variableTheme['high-emphasis-opacity'] })`
  const borderColor = `rgba(${ hexToRgb(String(variableTheme['border-color'])) },${ variableTheme['border-opacity'] })`
  const labelColor = `rgba(${ hexToRgb(currentTheme['on-surface']) },${ variableTheme['disabled-opacity'] })`

  return {
    title: 'Orders',
    icon: 'tabler-shopping-cart',
    chartOptions: {
      chart: {
        parentHeightOffset: 0,
        type: 'bar',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          columnWidth: '30%',
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
        // labelPrimaryColor,
        // labelPrimaryColor,
        currentTheme.primary,

        // labelPrimaryColor,
        // labelPrimaryColor,
        // labelPrimaryColor,
        // labelPrimaryColor,
        // labelPrimaryColor,
        // labelPrimaryColor,
      ],
      dataLabels: {
        enabled: true,
        formatter(val) {
          return `${ val }`
        },
        offsetY: -25,
        style: {
          fontSize: '15px',
          colors: [legendColor],
          fontWeight: '600',
          fontFamily: 'Public Sans',
        },
      },
      legend: { show: false },
      tooltip: { enabled: false },
      xaxis: {
        categories: monthData.value,
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
                fontWeight: '400',
              },
            },
          },
        },
      ],
    },
    series: newArray.value,
  }
}
</script>

<template>
  <VRow>
    <VCol
      v-if="newArray"
      cols="12"
    >
      <VCard
        title="Job Order"
        subtitle="BY MONTH"
        class="text-center"
        style="height: 500px"
      >
        <VCardText>
          <VueApexCharts
            ref="refVueApexChart"
            :key="currentTab"
            :options="chartCount().chartOptions"
            :series="chartCount().series"
            height="340"
            class="mt-3"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
