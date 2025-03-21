<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const data = ref([])
const nameData = ref([])
const countData = ref([])
const showLoading = ref(false)

const fetchCountStatus = async() => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/job/order/count-statuses' )

    data.value = ret.data.data
    nameData.value = data.value.map(counts => counts.status)
    countData.value = data.value.map(counts => counts.count_jo)

    // Inisialisasi chartOptions 
    const chartOptions = {
      chart: {
        type: 'pie',
      },
      labels: nameData.value,
      dataLabels: {
        enabled: true,
        formatter: function (val, opts) {
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
    Swal.fire({
      title: 'SAT',
      text: 'Get data failed',
      icon: 'error',
    })
    showLoading.value = false
  }
}

watchEffect(() => {
  fetchCountStatus()
})

const chartOptionsRef = ref(null)
const chartOptionsName = ref(null)
</script>

<template>
  <VRow>
    <VCol cols="12">
      <template v-if="chartOptionsRef && chartOptionsName">
        <VCard
          title="Detail Job Order"
          class="text-center"
          style="height: 500px"
          :loading="showLoading"
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
