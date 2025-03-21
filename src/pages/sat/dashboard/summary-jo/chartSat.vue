<script setup>
import axiosIns from '@/plugins/axios'
import { ref, computed, watchEffect } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const countJo = ref({})

const fetchCountJO = async () => {
  try {
    const response = await axiosIns.get('job/order/total/count')

    countJo.value = response.data.data
  } catch (error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchCountJO()
})

const months = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

const capitalizedMonths = months.map(month => month.charAt(0).toUpperCase() + month.slice(1))

const satJo = computed(() => {
  const years = new Set()

  Object.values(countJo.value).forEach(yearData => {
    Object.keys(yearData).forEach(year => years.add(year))
  })
  
  return Array.from(years)
})

const series = computed(() => {
  return satJo.value.map(year => ({
    name: year,
    data: months.map(month => countJo.value[month]?.[year] || 0),
  }))
})

const getChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 420,
    stacked: false,
    toolbar: {
      show: true,
    },
  },
  
  // colors: ['#2E8B57', '#1E90FF'],
  xaxis: {
    categories: capitalizedMonths,
    labels: {
      style: {
        fontSize: '14px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '14px',
      },
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '70%',
      dataLabels: {
        position: 'top',
      },
    },
  },
  legend: {
    position: 'right',
    offsetY: 20,
  },
  dataLabels: {
    enabled: true,
    offsetY: -20,

    // formatter: val => (val === 0 ? '' : val),
    style: {
      colors: ['#000'],
    },
  },
}))
</script>

<template>
  <VCard
    class="text-center"
    title="Total"
    subtitle="Job Order"
  >
    <div>
      <VueApexCharts
        type="bar"
        height="420"
        :options="getChartOptions"
        :series="series"
      />
    </div>
  </VCard>
</template>
