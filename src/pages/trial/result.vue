<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { defineProps, ref } from "vue"

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

const results = ref(null)
const totalResults = ref(0)
const totalPage = ref(0)

const selectedProcess = ref("")
const processFilter = ref([])
const selectedMachine = ref("")
const machineFilter = ref([])
const fetchingProcessStatus = ref(false)

const hasilKg = ref(0)
const wasteKg = ref(0)
const targetWaste = ref(0)
const ampere = ref(null)
const operator = ref(null)

const fetchResults = async () => {
  try {
    const ret = await axiosIns.get("/trialresult/all", {
      
      params: {
        trial_id: props.headerId,
      },
    })

    results.value = ret.data.data
    totalResults.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Result failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchResults()
})

const fetchProcess = async () => {
  try {
    const { data: ret } = await axiosIns.get("/process/all" )

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

const fetchMachines = async () => {
  try {
    const { data: ret } = await axiosIns.get("/trialmachine/all", {
      
      params: {
        trial_id: props.headerId,
      },
    })

    machineFilter.value = ret.data
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Machine failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchProcess()
})

watchEffect(() => {
  console.log("asdfadsfsa")
})

watchEffect(() => {
  fetchMachines()
})

const refResultForm = ref()

const onSubmit = () => {
  refResultForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createResult()
  })
}

const createResult = async () => {
  try {
    const ret = await axiosIns.post(
      "trialresults/create",
      {
        trial_id: props.headerId,
        trial_machine_id: selectedMachine.value.id,
        process_id: selectedProcess.value.id,
        result_per_shift_in_kg: hasilKg.value,
        waste_in_kg: wasteKg.value,
        waste_target_in_percentge: targetWaste.value,
        ampere: ampere.value,
        operator_number: operator.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    selectedMachine.value = ""
    selectedProcess.value = ""
    hasilKg.value = 0
    wasteKg.value = 0
    targetWaste.value = 0
    ampere.value = 0
    operator.value = null

    fetchResults()
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Result failed.",
      icon: "error",
    })
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="fetchingProcessStatus">
        <VCardText>
          <VForm
            ref="refResultForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VSelect
                  v-model="selectedMachine"
                  :items="machineFilter"
                  label="Process"
                  item-title="machine_number"
                  item-value="abbr"
                  single-line
                  return-object
                />
              </VCol>
              <VCol cols="6">
                <VSelect
                  v-model="selectedProcess"
                  :items="processFilter"
                  label="Process"
                  item-title="name"
                  item-value="abbr"
                  single-line
                  return-object
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="hasilKg"
                  label="Hasil /Shift (kg)"
                  type="number"
                  inputmode="numeric"
                  reverse=""
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="wasteKg"
                  label="Waste (kg)"
                  type="number"
                  inputmode="numeric"
                  reverse=""
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="targetWaste"
                  label="Target Waste (%)"
                  type="number"
                  inputmode="numeric"
                  reverse=""
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model="ampere"
                  label="Ampere"
                  type="number"
                  inputmode="numeric"
                  reverse=""
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="operator"
                  label="Operator"
                  type="number"
                  inputmode="numeric"
                  reverse=""
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  color="success"
                  type="submit"
                >
                  Save and Create New
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Machine Number
              </th>
              <th scope="col">
                Process
              </th>
              <th scope="col">
                Hasil /Shift (kg)
              </th>
              <th scope="col">
                Waste (kg)
              </th>
              <th scope="col">
                Target Waste (%)
              </th>
              <th scope="col">
                Ampere
              </th>
              <th scope="col">
                Operator
              </th>
              <th scope="col">
                Action
              </th>
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
                    <p class="text-base">
                      {{ result.result_per_shift_in_kg }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.waste_in_kg }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.waste_target_in_percentage }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.ampere }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ result.operator_number }}
                    </p>
                  </div>
                </div>
              </td>
              <td
                class="text-center"
                style="width: 5rem"
              >
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                >
                  <VIcon
                    size="22"
                    icon="tabler-trash"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>
