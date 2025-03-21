<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { formatDateMySql } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const approvals = ref(null)
const processFilter = ref([])
const selectedProcess = ref("")
const fetchingProcessStatus = ref(false)
const sequence = ref(1)

// const transactionDate1 = ref(now());
const transactionDate = ref("")
const shiftFilter = ref([])
const shift = ref(null)
const machineNumber = ref(null)
const duration = ref(0)
const approveBy = ref(null)

const fetchApproval = async () => {
  try {
    const ret = await axiosIns.get("/trial/approvals/by", {
      
      params: {
        trial_id: trialStore.trial.id,
      },
    })

    approvals.value = ret.data.data
    shiftFilter.value = shift
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Approval failed",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchApproval()
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

const shifts = [
  {
    id: 1,
    name: "Shift I",
  },
  {
    id: 2,
    name: "Shift II",
  },
  {
    id: 3,
    name: "Shift III",
  },
  {
    id: 4,
    name: "Long Shift I",
  },
  {
    id: 9,
    name: "Long Shift II",
  },
]

const refApprovalForm = ref()

const onSubmit = () => {
  refApprovalForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createApproval()
    }
  })
}

const createApproval = async () => {
  try {
    const ret = await axiosIns.post(
      "/trial/approvals",
      {
        trial_id: trialStore.trial.id,
        process_id: selectedProcess.value,
        sequence: sequence.value,
        transaction_date: formatDateMySql(transactionDate.value),
        approve_by: approveBy.value,
        machine_number: machineNumber.value,
        shift: shift.value,
        duration: duration.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    selectedProcess.value = ""
    sequence.value = ""
    approveBy.value = ""
    machineNumber.value = ""
    transactionDate.value = ""
    shift.value = ""
    duration.value = 0
    fetchApproval()
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Approval failed.",
      icon: "error",
    })
  }
}

const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`trial/approvals/${id}`)

  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Delete data failed.",
      icon: "error",
    })
  }
}



const confirmDeleteApprovalHandler = approveId => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then(result => {
    if (result.isConfirmed) {
      deleteData(approveId)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol
      v-if="ability.can('Manage', 'Trial Approval')"
      cols="12"
    >
      <VCard v-if="approvals">
        <VCardText>
          <VForm
            ref="refApprovalForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="4">
                <VSelect
                  v-model="selectedProcess"
                  :items="processFilter"
                  label="Process"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
              <!--
                <VCol cols="4">
                <VTextField v-model="sequence" label="No Urut Process" />
                </VCol> 
              -->
              <VCol cols="4">
                <VDateInput
                  v-model="transactionDate"
                  label="Transaction Date"
                />
              </VCol>
              <VCol cols="4">
                <VSelect
                  v-model="shift"
                  :items="shifts"
                  label="Shift"
                  item-title="name"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="machineNumber"
                  label="Machine Name"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="approveBy"
                  label="Approval Name"
                />
              </VCol>
              <VCol cols="4">
                <VTextField
                  v-model="duration"
                  label="Duration (Minutes)"
                  type="number"
                  inputmode="numeric"
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
                Process
              </th>
              <th scope="col">
                Date
              </th>
              <th scope="col">
                Shift
              </th>
              <th scope="col">
                Machine Number
              </th>
              <th scope="col">
                Approve Name
              </th>
              <th scope="col">
                Duration
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="approve in approvals"
              :key="approve.id"
              style="height: 3.75rem"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ approve.process.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ formatDateMySql(approve.transaction_date) }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ approve.shift }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ approve.machine_number }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ approve.approve_by }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ approve.duration }}
                    </p>
                  </div>
                </div>
              </td>
              <td
                class="text-center"
                style="width: 5rem"
              >
                <VBtn
                  v-if="ability.can('Manage', 'Trial Approval')"
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteApprovalHandler(approve.id)"
                >
                  <VIcon
                    size="22"
                    icon="tabler-trash"
                    color="error"
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

<route lang="yaml">
meta:
  action: Read
  subject: Trial Approval
  redirectIfLoggedIn: false
</route>
