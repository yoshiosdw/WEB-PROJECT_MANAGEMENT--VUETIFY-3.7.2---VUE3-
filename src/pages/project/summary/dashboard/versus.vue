<script setup>
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  taskData: {
    type: String,
    required: true,
  },
  trackData: {
    type: String,
    required: true,
  },
  overdueData: {
    type: String,
    required: true,
  },
})

const overduePercentage = computed(() => {
  const task = parseFloat(props.taskData)
  const overdue = parseFloat(props.overdueData)
  
  return task ? ((overdue / task) * 100).toFixed(2) : 0
})

const onTrackPercentage = computed(() => {
  const task = parseFloat(props.taskData)
  const track = parseFloat(props.trackData)
  
  return task ? ((track / task) * 100).toFixed(2) : 0
})

const chartOptions = (percentage, color) => ({
  chart: { 
    type: 'radialBar', 
    sparkline: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      hollow: { size: '50%' },  // Adjust size for center positioning
      track: { background: '#f0f0f0' },
      dataLabels: {
        value: {
          fontSize: '20px',      // Make the percentage value larger
          fontWeight: 500,
          color: '#333',         // Color of the percentage text
          offsetY: 0,            // Ensure it's centered
        },
      },
    },
  },
  colors: [color],
  labels: [''],
})
</script>

<template>
  <VCard
    class="text-center"
    title="Deadline Classification"
  >
    <VDivider />

    <VCardText>
      <VRow no-gutters>
        <!-- Overdue Section -->
        <VCol cols="5">
          <div class="d-flex align-center mb-3">
            <VAvatar
              color="error"
              variant="tonal"
              :size="30"
              rounded
              class="me-2"
            >
              <VIcon
                size="18"
                icon="tabler-alert-triangle"
              />
            </VAvatar>
            <span>Overdue</span>
          </div>
          <div class="d-flex gap-8 justify-center align-center">
            <VueApexCharts
              :options="chartOptions(overduePercentage, '#ff5252')"
              :series="[overduePercentage]"
              height="213"
              width="213"
            />
            <h4
              class="text-4xl font-weight-semibold mb-2"
            >
              {{ overdueData }}
            </h4>
            <span
              class="font-weight-semibold text-disabled"
              style="font-size: 20px; white-space: no-wrap;"
            >from {{ taskData }}</span>
          </div>
        </VCol>

        <!-- Divider with VS -->
        <VCol cols="2">
          <div class="d-flex flex-column align-center justify-center h-100">
            <VDivider
              vertical
              class="mx-auto"
            />
            <div class="pa-1">
              <VChip size="20">
                <span class="text-xs pa-1">VS</span>
              </VChip>
            </div>
            <VDivider
              vertical
              class="mx-auto"
            />
          </div>
        </VCol>

        <!-- On Track Section -->
        <VCol cols="5">
          <div class="d-flex align-center justify-end mb-3">
            <span class="me-2">On Track</span>

            <VAvatar
              color="success"
              variant="tonal"
              :size="30"
              rounded
            >
              <VIcon
                size="18"
                icon="tabler-skateboarding"
              />
            </VAvatar>
          </div>
          <div class="d-flex gap-8 justify-center align-center">
            <VueApexCharts
              :options="chartOptions(onTrackPercentage, '#4caf50')"
              :series="[onTrackPercentage]"
              height="213"
              width="213"
            />
            <h4 class="text-4xl font-weight-semibold mb-2">
              {{ trackData }}
            </h4>
            <span
              class="font-weight-semibold text-disabled"
              style="font-size: 20px; white-space: no-wrap;"
            >from {{ taskData }}</span>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
