<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { requiredValidator } from "@/@core/utils/validators"
import Product from '@/pages/lookup/product.vue'
import axiosIns from "@/plugins/axios"
import { formatDateMySql } from "@core/utils/formatters"
import { now } from "@vueuse/core"
import Swal from "sweetalert2"
import { ref } from "vue"
import { useRoute } from "vue-router"
import Acceptance from "./acceptance.vue"
import Approval from "./approval.vue"
import Composition from "./composition.vue"
import Result from "./hasilresult.vue"
import Keterangan from "./keterangan.vue"
import Machine from "./machine.vue"
import Material from "./material.vue"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const route = useRoute()
const trialId = route.params.id
const getTrial = ref()
const spk_number = ref()

const saved = ref(false)
const waiting = ref(true)

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

const getValueFromItemDialog = val => {
  item_code.value = val.ItemNumber
  item_name.value = val.ProductName
  family_product.value = val.ProductCategory
}

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

const document_number = ref("Created automatically by system")
const document_date = ref(now())
const trial_type = ref(trial_types[0])
const item_code = ref(null)
const family_product = ref(null)
const item_name = ref(null)
const size = ref(null)
const trial_note = ref(null)
const remark = ref(null)
const executor = ref("")
const executorFilter = ref([])
const fetchingExecutorStatus = ref(false)
const activeTab = ref("material")
const showLoading = ref(false)

const refCreateTrialForm = ref()

const onSubmit = () => {
  refCreateTrialForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createTrial()
  })
}

const createTrial = async () => {
  try {
    const ret = await axiosIns.post(
      "/trials",
      {
        document_date: formatDateMySql(document_date.value),
        trial_type: trial_type.value.id,
        item_code: item_code.value,
        family_product: family_product.value,
        item_name: item_name.value,
        size: size.value,
        trial_note: trial_note.value,
        remark: remark.value,
        return_executor_id: executor.value,
        spk_number: spk_number.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    saved.value = true
    trialStore.trial = ret.data.data

    // updateStatusSaved({data: ret, status: true})
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Trial failed.",
      icon: "error",
    })
  }
}

const fetchExecutor = async () => {
  try {
    const { data: ret } = await axiosIns.get("/trial/return/executors" )

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

const fetchTrialId = async id => {
  try {
    const ret = await axiosIns.get(`/trials/${id}` )

    getTrial.value = ret.data.data[0]

    // documentDate = trial.value.document_date;
    // documentNumber = trial.value.document_number;
    // trialType = trial.value.trial_type;
    // itemCode = trial.value.item_code
    // trialNote.value = trial.value.trial_note;
  } catch (error) {
    console.log(error)
  }
}

watchEffect(() => {
  fetchExecutor(); fetchTrialId(trialId)
})

const getStatusFromItemDialog = val => {
  waiting.value = val.value
}
</script>

<template>
  <VRow>
    <div
      v-if="showLoading"
      class="loading"
    >
      <div class="effect-1 effects" />
      <div class="effect-2 effects" />
      <div class="effect-3 effects" />
    </div>
    <VCol
      v-else
      cols="12"
    >
      <VCard>
        <VCardText>
          <VForm
            ref="refCreateTrialForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VRadioGroup
                  v-model="trial_type"
                  inline
                >
                  <VRadio
                    v-for="type in trial_types"
                    :key="type.id"
                    :label="type.name"
                    :value="type"
                    :readonly="saved"
                  />
                </VRadioGroup>
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="document_number"
                  label="No Dokumen"
                  placeholder="Created by System"
                  :readonly="saved"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="spk_number"
                  label="SPK Number"
                  :readonly="saved"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VDateInput
                  v-model="document_date"
                  label="Tanggal Dokumen"
                  :readonly="saved"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="executor"
                  label="Executor"
                  :items="executorFilter"
                  item-title="name"
                  item-value="id"
                  :readonly="saved"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow v-if="trial_type.id !== 1">
              <VCol
                cols="6"
                class="d-flex gap-4"
              >
                <VTextField
                  v-model="item_code"
                  label="Item"
                  readonly
                  :rules="[requiredValidator]"
                />
                <Product 
                  :disabled="saved"
                  @product="getValueFromItemDialog"
                  @product-loading="getStatusFromItemDialog"
                />
                <!--
                  <itemBrowse
                  @data="getValueFromItemDialog"
                  @statusFetchingData="getStatusFromItemDialog"
                  /> 
                -->
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="family_product"
                  label="Family Product"
                  readonly
                />
              </VCol>
            </VRow>

            <VRow v-if="trial_type.id === 1">              
              <VCol
                cols="6"
                class="d-flex gap-4"
              >
                <VTextField
                  v-model="item_code"
                  label="Item"
                  :readonly="saved"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="family_product"
                  label="Family Product"
                  :readonly="saved"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="item_name"
                  label="Nama"
                  :readonly="saved"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="size"
                  label="Size"
                  :rules="[requiredValidator]"
                  placeholder="(lebar - panjang - tebal)"
                  :readonly="saved"
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
                  :readonly="saved"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  v-if="!saved"
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
                <VBtn
                  color="warning"
                  :to="{ name: 'trial' }"
                >
                  Close
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard v-if="saved">
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
            <VWindowItem value="material">
              <Material />
            </VWindowItem>
            <VWindowItem value="approval">
              <Approval />
            </VWindowItem>
            <VWindowItem value="composition">
              <Composition />
            </VWindowItem>
            <VWindowItem value="machines">
              <Machine />
            </VWindowItem>
            <VWindowItem value="result">
              <Result :header-id="trialId" />
            </VWindowItem>
            <VWindowItem value="acceptance">
              <Acceptance />
            </VWindowItem>
            <VWindowItem value="keterangan">
              <Keterangan />
            </VWindowItem>
            <!--
              <VWindowItem value="costing">
              <CostingApproval />
              </VWindowItem> 
            -->
          </VWindow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Manage
  subject: Trial
  redirectIfLoggedIn: false
</route>
