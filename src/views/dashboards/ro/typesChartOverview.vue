<script setup>
import axiosIns from "@/plugins/axios"
import VueApexCharts from 'vue3-apexcharts'

const refVueApexChart = ref()
const data = ref([])
const monthData = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const fetchTypes = async() => {
  try {
    const ret = await axiosIns.get('/return/count/types' )

    data.value = ret.data.data
  } catch(error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchTypes()
})

const chartCount = () => {
  const seriesData = {}

  data.value.forEach(item => {
    const { name, month, year, count_ro } = item
    if (!seriesData[name]) {
      seriesData[name] = Array.from({ length: 12 }).fill(0)
    }
    seriesData[name][month - 1] += count_ro 
  })

  const series = Object.keys(seriesData).map(name => ({
    name: name,
    data: seriesData[name],
  }))

  return {
    series: series,
    options: {
      chart: {
        type: 'bar',
        height: 300,
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
        text: 'Case Return by Types',
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
    },
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
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
