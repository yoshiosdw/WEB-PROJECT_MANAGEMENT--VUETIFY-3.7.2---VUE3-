<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const emit = defineEmits(['outstanding'])

const allTask = ref(null)
const isLoading = ref(false)
const clickedTask = ref(null)

const fetchAllTask = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/count/task/all` )

    isLoading.value = false
    allTask.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: error,
      icon: 'error',
    })
  }
}

onMounted(() => {
  fetchAllTask()
})

const redirectToSat = val => {
  clickedTask.value = clickedTask.value === val ? null : val;
  emit("outstanding", clickedTask.value);
}
</script>

<template>
    <VRow>
        <VCol cols="12">
      <VCard>
        <VCardTitle class="text-center mb-4">
          Outstanding Task
        </VCardTitle>
        <VCardText :loading="isLoading">
          <!-- {{ firstTask }} -->
          <VRow>
            <VCol
            v-if="allTask"
            cols="2"
            class="text-center"
            :class="{ 'background-clicked': clickedTask == 1 }"
            :loading="isLoading"
            @click="redirectToSat(1)"
            style="cursor: pointer;"
            >
              
              <h2 class="text-center">
                {{ allTask.first.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ allTask.first.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small class="text-center">
                  {{ allTask.first.name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="allTask"
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': clickedTask == 2 }"
              :loading="isLoading"
              @click="redirectToSat(2)"
              style="cursor: pointer;"
              >
            
              <h2 class="text-center">
                {{ allTask.second.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ allTask.second.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ allTask.second.name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="allTask"
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': clickedTask == 3 }"
              :loading="isLoading"
              @click="redirectToSat(3)"
              style="cursor: pointer;"
            >
              <h2 class="text-center">
                {{ allTask.third.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ allTask.third.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ allTask.third.name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="allTask"
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': clickedTask == 4 }"
              :loading="isLoading"
              @click="redirectToSat(4)"
              style="cursor: pointer;"
            >
              <h2 class="text-center">
                {{ allTask.fourth.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ allTask.fourth.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ allTask.fourth.name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="allTask"
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': clickedTask == 5 }"
              :loading="isLoading"
              @click="redirectToSat(5)"
              style="cursor: pointer;"
            >
              <h2 class="text-center">
                {{ 
                  allTask.fifth.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ 
                  allTask.fifth.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ 
                    allTask.fifth.name }}
                </small>
              </p>
            </VCol>
            <VDivider vertical />
            <VCol
              v-if="allTask"
              cols="2"
              class="text-left"
              :class="{ 'background-clicked': clickedTask == 6 }"
              :loading="isLoading"
              @click="redirectToSat(6)"
              style="cursor: pointer;"
            >
              <h2 class="text-center">
                {{ allTask.sixth.count_jo }}
              </h2>
              <VSpacer class="mt-2" />
              <p
                class="text-center"
                style="margin-bottom:-2px"
              >
                <b>{{ allTask.sixth.department_in_charge }}</b>
              </p>
              <p class="text-center">
                <small>
                  {{ allTask.sixth.name }}
                </small>
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
    </VRow>
</template>

<style>
.background-clicked {
  background-color: #efefef !important;
}
</style>

<route lang="yaml">
    meta:
      action: Read
      subject: SAT
      redirectIfLoggedIn: false
</route>