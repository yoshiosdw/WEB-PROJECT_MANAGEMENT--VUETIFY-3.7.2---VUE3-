<script setup>
import axiosIns from '@/plugins/axios'
import router from '@/router'
import ChartOverview from '@/views/dashboards/home/ChartOverview.vue'
import PieChartOverview from '@/views/dashboards/home/PieChartOverview.vue'
import Swal from 'sweetalert2'
import { useJobOrder } from '../useJobOrderStore'

const jobOrderStore = useJobOrder()
const firstTask = ref(null)
const secondTask = ref(null)
const thirdTask = ref(null)
const fourthTask = ref(null)
const fifthTask = ref(null)
const sixthTask = ref(null)
const isLoading = ref(false)

const fetchFirst = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/first` )

    isLoading.value = false
    firstTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const fetchSecond = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/second` )

    isLoading.value = false
    secondTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const fetchThird = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/third` )

    isLoading.value = false
    thirdTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const fetchFourth = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/fourth` )

    isLoading.value = false
    fourthTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const fetchFifth = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/fifth` )

    isLoading.value = false
    fifthTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const fetchSixth = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/sixth` )

    isLoading.value = false
    sixthTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

const redirectToSat = department => {
  jobOrderStore.pic = department,
  router.push({ name: 'sat' })
}

onMounted(() => {
  fetchFirst(),
  fetchSecond(),
  fetchThird(),
  fetchFourth(),
  fetchFifth(),
  fetchSixth()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="text-center mb-4">
          Outstanding Task
        </VCardTitle>
        <VCardText :loading="isLoading">
          <VRow>
            <!-- {{ firstTask }} -->
            <VCol
              v-if="firstTask"
              cols="2"
              class="text-center"
              :loading="isLoading"
            >
              <!--
                <VBtn 
                @click="redirectToSat(firstTask[0].department_in_charge)" 
                variant="none" class="text-center"
                >
                <h2 class="text-center">{{ firstTask[0].count_jo }}</h2>
                </VBtn> 
              -->
              <h2 class="text-center">
                {{ firstTask[0].count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ firstTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small class="text-center">
                  {{ firstTask[0].name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="secondTask"
              cols="2"
              class="text-left"
              :loading="isLoading"
            >
              <!--
                <VBtn @click="redirectToSat(secondTask[0].department_in_charge)" variant="none" class="text-center">
                <h2 class="text-center">{{ secondTask[0].count_jo }}</h2>
                </VBtn> 
              -->
              <h2 class="text-center">
                {{ secondTask[0].count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ secondTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ secondTask[0].name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="thirdTask"
              cols="2"
              class="text-left"
              :loading="isLoading"
            >
              <h2 class="text-center">
                {{ thirdTask[0].count_jo }}
              </h2>
              <!-- <h2 class="text-center" @click="redirectToSat(thirdTask[0].department_in_charge)">{{ thirdTask[0].count_jo }}</h2> -->
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ thirdTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ thirdTask[0].name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="fourthTask"
              cols="2"
              class="text-left"
              :loading="isLoading"
            >
              <h2 class="text-center">
                {{ fourthTask[0].count_jo }}
              </h2>
              <!-- <h2 class="text-center" @click="redirectToSat(fourthTask[0].department_in_charge)">{{ fourthTask[0].count_jo }}</h2> -->
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ fourthTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ fourthTask[0].name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="fifthTask"
              cols="2"
              class="text-left"
              :loading="isLoading"
            >
              <!-- <h2 class="text-center" @click="redirectToSat(fifthTask[0].department_in_charge)">{{ fifthTask[0].count_jo }}</h2> -->
              <h2 class="text-center">
                {{ fifthTask[0].count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ fifthTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ fifthTask[0].name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="sixthTask"
              cols="2"
              class="text-left"
            >
              <h2 class="text-center">
                {{ sixthTask[0].count_jo }}
              </h2>
              <!-- <h2 class="text-center" @click="redirectToSat(sixthTask[0].department_in_charge)">{{ sixthTask[0].count_jo }}</h2> -->
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ sixthTask[0].department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ sixthTask[0].name }}
                </small>
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    <!--
      <VCol cols="12">
      <AnalyticOverview />
      </VCol> 
    -->
    <VSpacer />
    <VCol cols="12">
      <VRow>
        <VCol cols="5">
          <PieChartOverview />
        </VCol>
        <VCol
          cols="7"
          class="chart-container"
        >
          <ChartOverview />
        </VCol>
      </VRow>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
  </route>
