<script setup>
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const acceptances = ref(null)
const totalAcceptance = ref(0)
const rowPerPage = ref(10)
const currentPage = ref(1)
const totalPage = ref(0)

const standardAcceptance = ref(null)
const actualAcceptance = ref(null)
const approvedAcceptance = ref(false)
const criteriaFilter = ref([])
const selectedCriteria = ref("")
const fetchingCriteriaStatus = ref(false)
const note = ref(null)

const fetchAcceptance = async () => {
  try {
    const ret = await axiosIns.get("/acceptance/results", {
      
      params: {
        trial_id: trialStore.trial.id,
      },
    })

    acceptances.value = ret.data.data
    totalAcceptance.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Acceptance failed.",
      icon: "error",
    })
  }
}

const fetchCriteria = async () => {
  fetchingCriteriaStatus.value = false
  try {
    const { data: ret } = await axiosIns.get("/acceptance/criterias" )

    criteriaFilter.value = ret.data
    fetchingCriteriaStatus.value = true
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Criteria failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchAcceptance()
})

watchEffect(() => {
  fetchCriteria()
})

const refAcceptanceForm = ref(null)

const onSubmit = () => {
  refAcceptanceForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createAcceptance()
  })
}

const getApprovedStatus = approvedValue => {
  return approvedValue === 1 ? "Yes" : "No"
}

watch(selectedCriteria, newSelectedCriteria => {
  if (newSelectedCriteria) {
    standardAcceptance.value = newSelectedCriteria.standard
  } else {
    standardAcceptance.value = null
  }
})

const createAcceptance = async () => {
  try {
    // let approvedValue = approvedAcceptance ? 1 : 0;
    let approvedValue = approvedAcceptance.value ? 1 : 0

    const ret = await axiosIns.post(
      "acceptance/results",
      {
        trial_id: trialStore.trial.id,
        criteria_id: selectedCriteria.value.id,
        standard: standardAcceptance.value,
        actual: actualAcceptance.value,
        approved: approvedValue,
        note: note.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    selectedCriteria.value = ""
    standardAcceptance.value = null
    actualAcceptance.value = null
    note.value = null
    approvedAcceptance.value = false

    fetchAcceptance()
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Acceptance failed.",
      icon: "error",
    })
  }
}

const paginationData = computed(() => {
  const lastIndex = rowPerPage.value
  
  return `Showing ${rowPerPage.value} to ${lastIndex} of entries`
})

const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`acceptance/results/${id}`, {
      xt: "Delete",
      icon: "success",
    })
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Delete data failed.",
      icon: "error",
    })
  }
}

const confirmDeleteAcceptanceHandler = acceptanceId => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then(result => {
    if (result.isConfirmed) {
      deleteData(acceptanceId)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol
      v-if="ability.can('Manage', 'Trial Acceptance')"
      cols="12"
    >
      <VCard v-if="fetchingCriteriaStatus">
        <VCardText>
          <VForm
            ref="refAcceptanceForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <VSelect
                  v-model="selectedCriteria"
                  :items="criteriaFilter"
                  label="Criteria"
                  item-title="name"
                  item-value="id"
                  return-object
                  :menu-props="{ maxHeight: '200px' }"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="standardAcceptance"
                  label="Standard"
                  readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model="actualAcceptance"
                  label="Actual"
                />
              </VCol>
              <VCol
                cols="6"
                style="display: flex; gap: 10px"
              >
                <VSwitch
                  v-model="approvedAcceptance"
                  label="YES"
                  color="success"
                />
              </VCol>
            </VRow>
            <VRow v-if="1 == 2">
              <!-- <VRow v-if="1 == 2"> -->
              <VCol cols="12">
                <VTextarea
                  v-model="note"
                  label="Keterangan"
                  rows="2"
                  auto-grow
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
                Criteria
              </th>
              <th scope="col">
                Standard
              </th>
              <th scope="col">
                Actual
              </th>
              <th scope="col">
                Approved
              </th>
              <!-- <th scope="col">Note</th> -->
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="acceptance in acceptances"
              :key="acceptance.id"
              style="height: 3.75rem"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ acceptance.criteria.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ acceptance.standard }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ acceptance.actual }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ getApprovedStatus(acceptance.approved) }}
                      <!-- {{ acceptance.approved }} -->
                    </p>
                  </div>
                </div>
              </td>
              <!--
                <td>
                <div class="d-flex align-center">
                <div class="d-flex flex-column">
                <p class="text-base">
                {{ acceptance.note }}
                </p>
                </div>
                </div>
                </td> 
              -->
              <td
                class="text-center"
                style="width: 5rem"
              >
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteAcceptanceHandler(acceptance.id)"
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

        <!--
          <VDivider />
          <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
          >
          <span class="text-sm text-disabled">
          {{ paginationData }}
          </span>
          </VCardText> 
        -->
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Trial Acceptance
    redirectIfLoggedIn: false
  </route>
