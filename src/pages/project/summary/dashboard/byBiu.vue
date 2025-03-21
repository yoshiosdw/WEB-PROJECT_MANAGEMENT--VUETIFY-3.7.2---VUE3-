<script setup>
import axiosIns from '@/plugins/axios'
import { computed, onMounted, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const projects = ref({})
const totalProject = ref(0)
const series = ref([])
const categories = ref([])
const statuses = ref([]) 
const fromDate = ref('')  
const toDate = ref('')    

const fetchCountByBiu = async () => {
  try {
    const params = {
      fromdate: fromDate.value,
      todate: toDate.value,
    }

    const ret = await axiosIns.get('projects/dashboard/biu', { params })

    // Process data
    projects.value = ret.data.data
    calculateTotalProjects()
    processChartData()
  } catch (error) {
    console.log(error)
  }
}

const calculateTotalProjects = () => {
  let total = 0

  Object.values(projects.value).forEach(statuses => {
    Object.values(statuses).forEach(count => {
      total += count
    })
  })

  totalProject.value = total
}

const labelMapping = {
  ToDo: 'To Do',
  Done: 'Done',
  InProgress: 'In Progress',
  Hold: 'Hold',
}

const processChartData = () => {
  if (!projects.value || Object.keys(projects.value).length === 0) return

  const data = projects.value

  categories.value = Object.keys(data) 

  if (categories.value.length > 0) {
    statuses.value = Object.keys(data[categories.value[0]] || {})
  } else {
    statuses.value = []
  }

  series.value = statuses.value.map(status => ({
    name: labelMapping[status] || status,
    data: categories.value.map(category => data[category]?.[status] || 0),
  }))
}

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 420,
    stacked: true,
    toolbar: {
      show: true,
    },
  },
  xaxis: {
    categories: categories.value, 
    labels: {
      style: {
        fontSize: '14px',
        fontFamily: 'Public Sans',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '14px',
        fontFamily: 'Public Sans',
      },
    },
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: 'top',
        total: {
          enabled: true,
        },
      },
    },
  },
  legend: {
    position: 'right',
    offsetY: 40,
  },
  dataLabels: {
    enabled: false,
  },
}))

onMounted(() => {
  fetchCountByBiu()
})
</script>

<template>
  <VCard>
    <!-- Date range inputs -->
    <VCardTitle class="text-center mt-3">
      <div class="d-flex justify-center align-center">
        <AppDateTimePicker
          v-model="fromDate"
          placeholder="From Date"
          density="compact"
          class="mx-2"
          @change="fetchCountByBiu"
        />
        <AppDateTimePicker
          v-model="toDate"
          placeholder="To Date"
          density="compact"
          class="mx-2"
          @change="fetchCountByBiu"
        />
      </div>
    </VCardTitle>


    <!-- Total Projects count -->
    <VCardTitle class="text-center mt-3">
      Total Projects: {{ totalProject }}
    </VCardTitle>

    <!-- Conditionally render the chart only if data exists -->
    <div v-if="series.length > 0 && totalProject > 0">
      <VueApexCharts
        type="bar"
        height="420"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <!-- Optional: Message if no data is available -->
    <div v-else>
      <VCardTitle class="text-center mt-3">
        No data available for the selected date range.
      </VCardTitle>
    </div>
  </VCard>
</template>
