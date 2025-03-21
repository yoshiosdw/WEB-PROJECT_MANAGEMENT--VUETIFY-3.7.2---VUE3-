<script setup>
import axiosIns from "@/plugins/axios"
import VueApexCharts from 'vue3-apexcharts'

const refVueApexChart = ref()
const data = ref([])
const monthData = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const showLoading = ref(false)

const fetchCategories = async () => {
  showLoading.value = true
  try {
    const response = await axiosIns.get('/return/count/categories' )

    data.value = response.data.data
    showLoading.value = false
    chartCount()
  } catch (error) {
    console.error('Error fetching data:', error)
    showLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})

const chartCount = () => {
  const seriesData = {}

  data.value.forEach(item => {
    const { department_in_charge, year, month, count_ro } = item
    if (!seriesData[department_in_charge]) {
      seriesData[department_in_charge] = Array.from({ length: 12 }).fill(0)
    }
    seriesData[department_in_charge][month - 1] += count_ro
  })

  const series = Object.keys(seriesData).map(department_in_charge => ({
    name: department_in_charge,
    data: seriesData[department_in_charge],
  }))

  return {
    series: series,
    options: {
      chart:{
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
        text: 'Case Return by Department',
      },
      xaxis: {
        categories: monthData.map(month => month.substring(0, 3)),
        labels: {
          formatter: function(val){
            return val
          },
        },
      }, 
      yaxis: {
        title: {
          text: undefined,
        },
      },
    },
  }

  // const options = {
  //   chart: {
  //     type: 'bar',
  //     height: 350
  //   },
  //   plotOptions: {
  //     bar: {
  //       horizontal: false,
  //       dataLabels: {
  //         total: {
  //           enabled: true,
  //           offsetX: 0,
  //           style: {
  //             fontSize: '13px',
  //             fontWeight: 900
  //           }
  //         }
  //       }
  //     }
  //   },
  //   stroke: {
  //     width: 1,
  //     colors: ['#fff']
  //   },
  //   title: {
  //     text: 'Case Return by Department'
  //   },
  //   xaxis: {
  //     categories: monthData.map(month => month.substring(0, 3)),
  //     labels: {
  //       formatter: function (val) {
  //         return val;
  //       }
  //     }
  //   },
  //   yaxis: {
  //     title: {
  //       text: undefined
  //     }
  //   },
  //   tooltip: {
  //     y: {
  //       formatter: function (val) {
  //         return val;
  //       }
  //     }
  //   },
  //   fill: {
  //     opacity: 1
  //   },
  //   legend: {
  //     position: 'top',
  //     horizontalAlign: 'left',
  //     offsetX: 40
  //   }
  // };

  // return { series, options };
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay :loading="showLoading" />
      <VCard>
        <VCardText>
          <!--
            <VueApexCharts 
            type="bar"
            :options="chartCount().options"
            :series="chartCount().series"
            height="350"
            /> 
          -->
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
