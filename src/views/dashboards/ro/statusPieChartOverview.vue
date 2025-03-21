<script setup>
import axiosIns from "@/plugins/axios"
import VueApexCharts from 'vue3-apexcharts'

const data = ref([])
const statusData = ref([])
const countData = ref([])
const showLoading = ref(false)

const fetchStatus = async() => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/return/count/statuses' )

    data.value = ret.data.data
    statusData.value = data.value.map(counts => counts.status)
    countData.value = data.value.map(counts => counts.count_ro)

    const chartOptions = {
      chart: {
        type: 'pie',
      },
      labels: statusData.value,
      dataLabels: {
        enabled: true,
        formatter: function (val, opts){
          return opts.w.config.series[opts.seriesIndex]
        },
        style: {
          fontSize: '12px',
          textAlign: 'left',
        },
        position: 'bottom',
      },
      colors: ['#BBBBBB', '#E6B566', '#A1CAE2', '#E97777', '#B6E2A1'],
    }

    chartOptionsRef.value = chartOptions
    chartOptionsName.value = chartOptions.labels
    showLoading.value = false
  } catch(error) {
    console.log(error)
  }
}

const chartOptionsRef = ref(null)
const chartOptionsName = ref(null)

watchEffect(() => {
  fetchStatus()
})
</script>

<template>
  <VRow>
    <VCol cols="10">
      <template v-if="chartOptionsRef && chartOptionsName">
        <VCard
          title="Case Return by Status"
          class="text-center"
          style="height: 400px;"
        >
          <VueApexCharts 
            type="pie" 
            :options="chartOptionsRef" 
            :series="countData" 
            :labels="chartOptionsName"
          />
        </VCard>
      </template>
    </VCol>
  </VRow>
</template>
