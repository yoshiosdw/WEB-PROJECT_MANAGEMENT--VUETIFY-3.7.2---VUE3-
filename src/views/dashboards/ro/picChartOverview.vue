<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const refVueApexChart = ref()
const data = ref([])
const monthData = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const fetchPic = async () => {
  try {
    const ret = await axiosIns.get('/return/count/pic' )

    data.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchPic()
})

const chartCount = () => {
  const seriesData = {}

  data.value.forEach(item => {
    const { pic, month, count_ro } = item
    if (!seriesData[pic]) {
      seriesData[pic] = Array.from({ length: 12 }).fill(0)
    }
    seriesData[pic][month - 1] += count_ro // Sum up the counts for each month
  })

  const series = Object.keys(seriesData).map(pic => ({
    name: pic,
    data: seriesData[pic],
  }))

  return {
    series: series,
    options: {
      chart: {
        type: 'bar',
        height: 450,
        stacked: true,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            total: {
              enabled: true,
              offsetX: 0,
              style: {
                fontSize: '13px',
                fontWeight: 900,
              },
            },
          },
        },
      },
      stroke: {
        width: 1,
        colors: ['#fff'],
      },
      title: {
        text: 'Total Return by PIC and Month',
      },
      xaxis: {
        categories: monthData.map(month => month.substring(0, 3)), // Use abbreviated month names
        labels: {
          formatter: function (val) {
            return val 
          },
        },
      },
      yaxis: {
        title: {
          text: undefined,
        },
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val
          },
        },
      },
      fill: {
        opacity: 1,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        offsetX: 40,
      },
    },
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <!-- {{ chartCount().seriesData }} -->
        <VCardText>
          <VueApexCharts 
            ref="refVueApexChart"
            :type="chartCount().options.chart.type"
            :options="chartCount().options"
            :series="chartCount().series"
            :height="chartCount().options.chart.height"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
