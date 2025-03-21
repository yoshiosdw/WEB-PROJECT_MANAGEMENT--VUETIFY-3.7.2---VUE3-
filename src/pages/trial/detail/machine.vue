<script setup>
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useTrialStore } from "../useTrialStore"

const trialStore = useTrialStore()
const machines = ref(null)
const totalMachines = ref(0)
const machine_number = ref(null)
const isVisible = ref(false)
const isParameterVisible = ref(false)
const totalPage = ref(0)
const selectedProcess = ref("")
const processFilter = ref([])
const sequence = ref(1)
const createResultData = ref(null)

const selectedMachine = ref(null)
const sequenceResult = ref(null)
const resultPerShiftInKg = ref(0)
const wasteInKg = ref(0)
const wasteTargetInPercentage = ref(0)
const ampere = ref(0)
const operatorNumber = ref(0)

const trialResult = ref(null)
const dataCount = ref(0)
const isConfirmDialogVisible = ref(false)

// variable for parameter
const machineSettingParameter = ref("")
const machineParameterParameter = ref(0)
const machineAmpereParameter = ref(0)

// Parameter
const parameters = ref(null)
const trialMachineId = ref(null)

const totalParam = ref(0)
const rowPerPage = ref(10)
const currentPage = ref(1)
const last = ref(0)


const fetchingProcessStatus = ref(false)

const fetchMachines = async () => {
  try {

    const param = {
      trial_id: trialStore.trial.id,

    }

    const ret = await axiosIns.get("/machines", {
      params:param,
    },
    )

    machines.value = ret.data.data
    totalMachines.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
    trialStore.machine = ret.data.data
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Machine failed.",
      icon: "error",
    })
  }
}

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
  fetchMachines()
})

watchEffect(() => {
  fetchProcess()
})

const createMachines = async () => {
  try {
    const ret = await axiosIns.post(
      "/machines",
      {
        trial_id: trialStore.trial.id,
        process_id: selectedProcess.value,
        sequence: sequence.value,
        machine_number: machine_number.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    selectedProcess.value = ""
    sequence.value = ""
    machine_number.value = ""
    fetchMachines()
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Machine failed.",
      icon: "error",
    })
  }
}

const clearForm = () => {
  resultPerShiftInKg.value = 0
  wasteInKg.value = 0
  wasteTargetInPercentage.value = 0
  ampere.value = 0
  operatorNumber.value = 0
}

const showDialog = async machine => {
  try {
    const ret = await axiosIns.get("/trialresult/trial", {
      
      params: {
        trial_id: trialStore.trial.id,
        machine_id: machine.id,
        sequence: sequenceResult.value,
      },
    })

    selectedMachine.value = machine
    trialResult.value = ret.data.data
    trialMachineId.value = machine.id
    dataCount.value = ret.data.data.length
    if (dataCount.value == 0) {
      clearForm()
    } else {
      clearForm()

      // alert(ret.data.data[0].result_per_shift_in_kg);

      resultPerShiftInKg.value = ret.data.data[0].result_per_shift_in_kg
      wasteInKg.value = ret.data.data[0].waste_in_kg
      sequenceResult.value = ret.data.data[0].sequence
      wasteTargetInPercentage.value =
        ret.data.data[0].waste_target_in_percentage
      ampere.value = ret.data.data[0].ampere
      operatorNumber.value = ret.data.data[0].operator_number
    }
    isVisible.value = true
  } catch (error) {
    Swal.fire({
      text: error,
      title: "Manufacture",
      icon: "error",
    })
  }
}

const refMachineForm = ref()

const onSubmit = () => {
  refMachineForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createMachines()
  })
  clearForm()
}

const onSubmitResult = async () => {
  try {
    const ret = await axiosIns.post(
      "/machine/results",
      {
        id: dataCount.value === 0 ? null : trialResult.value[0].id,
        trial_id: trialStore.trial.id,
        trial_machine_id: selectedMachine.value.id,
        process_id: selectedMachine.value.process.id,
        sequence: sequenceResult.value,
        result_per_shift_in_kg: resultPerShiftInKg.value,
        waste_in_kg: wasteInKg.value,
        waste_target_in_percentage: wasteTargetInPercentage.value,
        ampere: ampere.value,
        operator_number: operatorNumber.value,
        process_id: selectedMachine.value.process_id,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    clearForm()
    isVisible.value = false
  } catch (error) {
    Swal.fire({
      text: "Create Machine Result failed.",
      title: "Manufacture",
      icon: "error",
    })
  }
}

const closeDialogHandler = () => {
  clearForm()
  isVisible.value = false
}

const refParameterForm = ref()

const onSubmitParameter = () => {
  refParameterForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createMachineParameter()
  })
}

const createMachineParameter = async () => {
  try {
    const ret = await axiosIns.post(
      "machine/parameters",
      {
        trial_machine_id: trialMachineId.value,
        name: machineSettingParameter.value,
        parameter: machineParameterParameter.value,
        ampere: machineAmpereParameter.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    selectedProcess.value = ""
    machine_number.value = ""
    machineSettingParameter.value = ""
    machineParameterParameter.value = 0
    machineAmpereParameter.value = 0
    fetchParameter(trialMachineId.value, currentPage.value, rowPerPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Parameter failed.",
      icon: "error",
    })
  }
}

const clearParameterForm = () => {
  machineSettingParameter.value = ""
  machineParameterParameter.value = 0
  machineAmpereParameter.value = 0
}

const showParameterDialog = machine => {
  const machineObject = JSON.parse(JSON.stringify(machine))

  trialMachineId.value = machineObject.id
  fetchParameter(trialMachineId.value, currentPage.value, rowPerPage.value, find.value)
  isParameterVisible.value = true
  isConfirmDialogVisible.value = true
}

const closeParameterDialog = () => {
  clearParameterForm()
  isParameterVisible.value = false
}

const fetchParameter = async( trialMachineId, page, perPage, find ) => {
  try {
    const ret = await axiosIns.get(`machine/parameters/${trialMachineId}`, {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    parameters.value = ret.data.data
    totalParam.value = ret.data.meta.total
    last.value = ret.data.meta.last

    // console.log(ret.data.data);
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Parameter failed.",
      icon: "error",
    })
  }
}

const paginationDataParam = computed(() => {
  const firstIndex = totalParam.value == 0 ? 0 : (currentPage.value - 1) * rowPerPage.value + 1
  const lastIndex = currentPage.value * rowPerPage.value >= totalParam.value ? totalParam.value : currentPage.value * rowPerPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalParam.value} entries`
})

watch(currentPage, newPage => {
  fetchParameter(trialMachineId.value, newPage, rowPerPage.value, find.value)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="machines">
        <VTable class="text-no-wrap">
          <thead
            class="text-uppercase"
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                Machine Number
              </th>
              <th scope="col">
                Prosess Name
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="machine in machines"
              :key="machine.id"
              tr
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ machine.machine_number }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ machine.process.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <VBtn
                  v-if="ability.can('Read', 'Trial Machine')"
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="showParameterDialog(machine)"
                >
                  <VIcon
                    size="22"
                    icon="carbon:result"
                    color="success"
                  />
                  Parameter
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <VDivider />
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog
    v-model="isParameterVisible"
    width="1024"
  >  
    <DialogCloseBtn @click="isParameterVisible = !isParameterVisible" />
    <VCard>
      <VCardText>
        <VTable class="text-no-wrap">
          <thead
            class="text-uppercase"
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                Machine Parameter
              </th>
              <th scope="col">
                Parameter Value
              </th>
              <th scope="col">
                Ampere
              </th>
            </tr>
          </thead>
          <tbody v-if="parameters">
            <tr
              v-for="parameter in parameters"
              :key="parameter.id"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ parameter.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ parameter.parameter }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ parameter.ampere }}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCardText>
      <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
        <span class="text-sm text-disabled">
          {{ paginationDataParam }}
        </span>

        <VPagination
          v-model="currentPage"
          size="small"
          :total-visible="5"
          :length="last"
        />
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Trial Machine
    redirectIfLoggedIn: false
  </route>
