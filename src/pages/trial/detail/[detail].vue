<script setup>
import { formatDateMySql } from "@/@core/utils/formatters"
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { useTrialStore } from "../useTrialStore"
import Machine from "./machine.vue"

const trialStore = useTrialStore()
const route = useRoute()
const trialId = route.params.detail
const trials = ref(null)
const documentNumber = ref(null)
const documentDate = ref(null)
const trialType = ref([])
const trialTypeId = ref(null)
const itemCode = ref(null)
const familyProduct = ref(null)
const itemName = ref(null)
const size = ref(null)
const trialNote = ref(null)
const remark = ref(null)
const executor = ref(null)
const executorFilter = ref([])
const fetchingExecutorStatus = ref(false)
const saved = ref(true)
const activeTab = ref("material")

const waiting = ref(true)
const showLoading = ref(true)

const materials = ref()
const totalMaterials = ref(0)
const lastMaterials = ref(0)
const approvals = ref()
const compositions = ref()
const results = ref()
const acceptances = ref()
const spk_number = ref()
const selectedType = ref(null)


const fetchTrial = async id => {
  try {
    const ret = await axiosIns.get(`/trials/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
    })

    trialStore.trial = ret.data.data[0]
    documentNumber.value = ret.data.data[0].document_number
    documentDate.value = ret.data.data[0].document_date
    itemCode.value = ret.data.data[0].item_code
    itemName.value = ret.data.data[0].item_name
    familyProduct.value = ret.data.data[0].family_product
    size.value = ret.data.data[0].size
    remark.value = ret.data.data[0].remark
    trialNote.value = ret.data.data[0].trial_note
    executor.value = ret.data.data[0].executor
    trialTypeId.value = ret.data.data[0].trial_type
    spk_number.value = ret.data.data[0].spk_number
    selectedType.value = ret.data.data[0].trial_type

    saved.value = true
  } catch (error) {
    showLoading.value = false
    console.log(error)
  }
}

const tabs = [
  {
    title: "Materials",
    icon: "tabler-building",
    tab: "material",
  },
  {
    title: "Approval PPIC",
    icon: "tabler-building",
    tab: "approval",
  },
  {
    title: "Composition",
    icon: "tabler-building",
    tab: "composition",
  },
  {
    title: "Machines",
    icon: "tabler-building",
    tab: "machines",
  },
  {
    title: "Result",
    icon: "tabler-building",
    tab: "result",
  },
  {
    title: "Acceptance",
    icon: "tabler-building",
    tab: "acceptance",
  },
  {
    title: "Catatan",
    icon: "tabler-building",
    tab: "keterangan",
  },
]

const trial_types = [
  {
    id: 1,
    name: "Sample Baru",
  },
  {
    id: 2,
    name: "Sample Product Existing",
  },
  {
    id: 3,
    name: "Substitusi Bahan",
  },
  {
    id: 9,
    name: "Others",
  },
]

const fetchExecutor = async () => {
  try {
    const { data: ret } = await axiosIns.get("/trial/return/executors", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
    })

    executorFilter.value = ret.data
    fetchingExecutorStatus.value = true
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Executor failed.",
      icon: "error",
    })
  }
}

const fetchMaterial = async () => {
  waiting.value = true
  try {
    const ret = await axiosIns.get("/trial/materials", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        trial_id: trialId,
      },
    })

    materials.value = ret.data.data
    totalMaterials.value = ret.data.meta.total
    lastMaterials.value = ret.data.meta.last
    waiting.value = true
  } catch (error) {
    console.log(error)
  }
}

const fetchApproval = async () => {
  try {
    const ret = await axiosIns.get("/trial/approvals/by", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        trial_id: trialId,
      },
    })

    approvals.value = ret.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchComposition = async () => {
  waiting.value = true
  try {
    const ret = await axiosIns.get("/compositions", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        trial_id: trialId,
      },
    })

    compositions.value = ret.data.data
    waiting.value = true
  } catch (error) {
    console.log(error)
  }
}

const fetchResults = async () => {
  try {
    const ret = await axiosIns.get("/machine/results", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        trial_id: trialId,
      },
    })

    results.value = ret.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchAcceptance = async () => {
  try {
    const ret = await axiosIns.get("/acceptance/results", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        trial_id: trialId,
      },
    })

    acceptances.value = ret.data.data
  } catch (error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchTrial(trialId),
  fetchExecutor(),
  fetchMaterial(),
  fetchApproval(),
  fetchComposition(),
  fetchResults(),
  fetchAcceptance()
})

const getApprovedStatus = approvedValue => {
  return approvedValue === 1 ? "Yes" : "No"
}

const getStatusFromItemDialog = val => {
  waiting.value = val
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="waiting">
        <VCardTitle>Trial Detail</VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VRadioGroup
                v-model="selectedType"
                inline
              >
                <VRadio
                  v-for="type in trial_types"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                  readonly="true"
                />
              </VRadioGroup>
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="3">
              <VTextField
                v-model="documentNumber"
                label="No Dokumen"
                placeholder="Created by System"
                readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VTextField
                v-model="spk_number"
                label="SPK Number"
                readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VDateInput
                v-model="documentDate"
                label="Tanggal Dokumen"
                readonly="true"
              />
            </VCol>
            <VCol cols="3">
              <VSelect
                v-model="executor"
                label="Executor"
                :items="executorFilter"
                item-title="name"
                item-value="id"
                readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="6"
              class="d-flex gap-4"
            >
              <VTextField
                v-model="itemCode"
                label="Item"
                :rules="[requiredValidator]"
                readonly
              />
            </VCol>
            <VCol cols="6">
              <VTextField
                v-model="familyProduct"
                label="Family Product"
                readonly
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="itemName"
                label="Nama"
                readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="size"
                label="Size"
                :rules="[requiredValidator]"
                readonly="true"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="remark"
                label="Keterangan"
                rows="2"
                auto-grow
                readonly
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              class="d-flex justify-end gap-4"
            >
              <VBtn
                color="warning"
                :to="{ name: 'trial' }"
              >
                Close
              </VBtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardText>
          <VTabs
            v-model="activeTab"
            class="v-tab-pill"
          >
            <VTab
              v-for="item in tabs"
              :key="item.icon.tab"
              :value="item.tab"
            >
              <VIcon
                size="20"
                start
                :icon="item.icon"
              />
              {{ item.title }}
            </VTab>
          </VTabs>
          <VWindow
            v-model="activeTab"
            :touch="false"
            class="disable-tab-transition"
          >
            <VWindowItem
              value="material"
            >
              <VCard>
                <div class="mt-3 gap-4 my-card">
                  <VTable class="text-no-wrap">
                    <thead
                      class="text-uppercase"
                      style="background-color: #efefef;"
                    >
                      <tr>
                        <th scope="col">
                          Item
                        </th>
                        <th scope="col">
                          Name
                        </th>
                        <th scope="col">
                          Qty Zack
                        </th>
                        <th scope="col">
                          Qty Kg
                        </th>
                      </tr>
                    </thead>
  
                    <tbody>
                      <tr
                        v-for="material in materials"
                        :key="material.id"
                        style="height: 3.75rem"
                      >
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ material.item_code }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ material.item_name }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ material.qty_zack }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ material.qty_kg }}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCard>
            </VWindowItem>
            <VWindowItem value="approval">
              <VCard>
                <div class="mt-3 gap-4 my-card">
                  <VTable class="text-no-wrap">
                    <thead
                      class="text-uppercase"
                      style="background-color: #efefef;"
                    >
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
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCard>
            </VWindowItem>
            <VWindowItem value="composition">
              <VCard>
                <div class="mt-3 gap-4 my-card">
                  <VTable class="text-no-wrap">
                    <thead
                      class="text-uppercase"
                      style="background-color: #efefef;"
                    >
                      <tr>
                        <th scope="col">
                          Item
                        </th>
                        <th scope="col">
                          Name
                        </th>
                        <th scope="col">
                          Quantity
                        </th>
                        <th scope="col">
                          Percentage
                        </th>
                      </tr>
                    </thead>
          
                    <tbody>
                      <tr
                        v-for="composition in compositions"
                        :key="composition.id"
                        style="height: 3.75rem"
                      >
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ composition.item_code }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ composition.item_name }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ composition.tonase }}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div class="d-flex align-center">
                            <div class="d-flex flex-column">
                              <p class="text-base">
                                {{ composition.percentage }}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCard>
            </VWindowItem>
            <VWindowItem value="machines">
              <Machine />
            </VWindowItem>            
            <VWindowItem value="result">
              <VCard>
                <div class="mt-3 gap-4 my-card">
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
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCard>
            </VWindowItem>
            <VWindowItem value="acceptance">
              <VCard>
                <div class="mt-3 gap-4 my-card">
                  <VTable class="text-no-wrap">
                    <thead
                      class="text-uppercase"
                      style="background-color: #efefef;"
                    >
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
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </div>
              </VCard>
            </VWindowItem>
            <VWindowItem value="keterangan">
              <VCard>
                <VCardText>
                  <VRow>
                    <VCol cols="12">
                      <VTextarea
                        v-model="trialNote"
                        rows="2"
                        label="Catatan"
                        readonly
                      />
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>
            </VWindowItem>
          </VWindow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style scoped>
  .my-card {
    height: calc(53vh - 300px);
    overflow-y: auto;
  }
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Trial
    redirectIfLoggedIn: false
  </route>
