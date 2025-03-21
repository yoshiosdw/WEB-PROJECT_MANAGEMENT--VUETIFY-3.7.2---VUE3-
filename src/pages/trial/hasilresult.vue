<script setup>
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useTrialStore } from "./useTrialStore"

const results = ref(null)
const totalResults = ref(0)
const totalPage = ref(0)

const selectedProcess = ref("")
const processFilter = ref([])
const selectedMachine = ref("")
const machineFilter = ref([])
const trialStoreMachine = ref([])
const trialStore = useTrialStore()
const fetchingProcessStatus = ref(false)

const sequence = ref(1)
const resultPerShiftInKg = ref(0)
const wasteInKg = ref(0)
const wasteTargetInPercentage = ref(0)
const ampere = ref(0)
const operatorNumber = ref("")
const resultDate = ref()

const props = defineProps({
  headerId: {
    type: String,
    required: true,
  },
  tabId: {
    type: String,
    required: true,
  },
})

const fetchResult = async () => {
  try {
      const ret = await axiosIns.get("/machine/results", {

      params: {
        trial_id: trialStore.trial.id,
      },
    })
    results.value = ret.data.data
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Result failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchResult()
})

const fetchProcess = async () => {
  try {
    const { data: ret } = await axiosIns.get("/trial/get/processes" )

    processFilter.value = ret.data
    fetchingProcessStatus.value = true
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Proccess failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchProcess()
})

const refResultForm = ref()
const onSubmit = () => {
  refResultForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createResult()
    }
  })
}

const createResult = async () => {
  try {
    const ret = await axiosIns.post(
      "/machine/results",
      {
        trial_id: trialStore.trial.id,
        trial_machine_id: selectedMachine.value,
        process_id: selectedProcess.value,
        sequence: sequence.value,
        result_per_shift_in_kg: resultPerShiftInKg.value,
        waste_in_kg: wasteInKg.value,
        waste_target_in_percentage: wasteTargetInPercentage.value,
        ampere: ampere.value,
        operator_number: operatorNumber.value,
        date: resultDate.value
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      }
    )
    selectedMachine.value = ""
    selectedProcess.value = ""
    sequence.value = ""
    resultPerShiftInKg.value = 0
    wasteInKg.value = 0
    wasteTargetInPercentage.value = 0
    ampere.value = 0
    operatorNumber.value = ""

    fetchResult()
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Result failed.",
      icon: "error",
    })
  }
}

const confirmDeleteResultHandler = (resultId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteData(resultId)
    }
  })
}

const deleteData = async (id) => {
  try {
    const ret = await axiosIns.delete(`machine/results/${id}` )

    fetchResult()
    Swal.fire({
      title: "Manufacture",
      text: "Delete",
      icon: "success",
    })
  } catch {
    {
      Swal.fire({
        title: "Manufacture",
        text: "Delete data failed.",
        icon: "error",
      })
    }
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12" v-if="ability.can('Manage', 'Trial Result')">
      <VCard v-if="results">
        <VCardText>
          <VForm ref="refResultForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="4">
                <VSelect
                  v-if="trialStore.machine"
                  label="Machine Number"
                  :items="trialStore.machine"
                  item-title="machine_number"
                  item-value="id"
                  v-model="selectedMachine"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  label="Process"
                  :items="processFilter"
                  item-title="name"
                  item-value="id"
                  v-model="selectedProcess"
                />
              </VCol>
              <VCol cols="4">
                <VDateInput
                 v-model="resultDate"
                 label="Date"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  label="Hasil per Shift (kg)"
                  type="number"
                  v-model="resultPerShiftInKg"
                  inputmode="numeric"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  label="Waste (kg)"
                  type="number"
                  v-model="wasteInKg"
                  inputmode="numeric"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  label="Target Waste (%)"
                  type="number"
                  v-model="wasteTargetInPercentage"
                  inputmode="numeric"
                />
              </VCol>
            </VRow>
            <VRow>
              <!-- <VCol cols="4">
                <VTextField
                  label="Urutan Process"
                  type="number"
                  v-model="sequence"
                  inputmode="numeric"
                />
              </VCol> -->
              <VCol cols="6">
                <VTextField
                  label="Ampere"
                  type="number"
                  v-model="ampere"
                  inputmode="numeric"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  label="Jumlah Operator"
                  type="number"
                  v-model="operatorNumber"
                  inputmode="numeric"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12" class="d-flex justify-end gap-4">
                <VBtn color="success" type="submit">Save and Create New</VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard v-if="results">
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Machine Number</th>
              <th scope="col">Process</th>
              <th scope="col">Hasil /Shift(kg)</th>
              <th scope="col">Waste(kg)</th>
              <th scope="col">Target Waste(%)</th>
              <th scope="col">Ampere</th>
              <th scope="col">Operator(orang)</th>
              <th scope="col">Tanggal</th>
              <th scope="col">Action</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="result in results"
              :key="result.id"
              style="height: 3.75rem"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.machine.machine_number }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.process.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.result_per_shift_in_kg }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.waste_in_kg }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.waste_target_in_percentage }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.ampere }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.operator_number }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-uppercase">
                      {{ result.date }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="text-center" style="width: 5rem">
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteResultHandler(result.id)"
                >
                  <VIcon size="22" icon="tabler-trash" color="error" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Trial Result
  redirectIfLoggedIn: false
</route>
