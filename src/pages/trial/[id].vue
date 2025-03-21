<script setup>
import { VDateInput } from 'vuetify/lib/labs/components.mjs'
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import Acceptance from "./acceptance.vue"
import Approval from "./approval.vue"
import Composition from "./composition.vue"
import Result from "./hasilresult.vue"
import Keterangan from "./keterangan.vue"
import Machine from "./machine.vue"
import Material from "./material.vue"
import { useTrialStore } from "./useTrialStore"
import Product from '@/pages/lookup/product.vue'
import { watchEffect } from "vue"

const trialStore = useTrialStore()
const route = useRoute()
const trialId = route.params.id
const trials = ref(null)
const document_number = ref(null)
const document_date = ref(null)
const trial_type = ref([])
const trial_type_id = ref(null)
const item_code = ref(null)
const family_product = ref(null)
const item_name = ref(null)
const size = ref(null)
const trial_note = ref(null)
const remark = ref(null)
const executor = ref(null)
const executorFilter = ref([])
const fetchingExecutorStatus = ref(false)
const saved = ref(true)
const activeTab = ref("material")
const spk_number = ref(null)


const waiting = ref(true)
const showLoading = ref(true)

const fetchTrial = async id => {
  try {
    const ret = await axiosIns.get(`/trials/${id}` )

    trialStore.trial = ret.data.data[0]
    document_number.value = ret.data.data[0].document_number
    document_date.value = ret.data.data[0].document_date
    item_code.value = ret.data.data[0].item_code
    item_name.value = ret.data.data[0].item_name
    family_product.value = ret.data.data[0].family_product
    size.value = ret.data.data[0].size
    remark.value = ret.data.data[0].remark
    trial_note.value = ret.data.data[0].trial_note
    executor.value = ret.data.data[0].executor
    trial_type_id.value = ret.data.data[0].trial_type
    spk_number.value = ret.data.data[0].spk_number
    saved.value = true
  } catch (error) {
    showLoading.value = false

    // Swal.fire({
    //   title: "Manufacture",
    //   text: error,
    //   icon: "error",
    // });
  }
}

const getValueFromItemDialog = val => {
  item_code.value = val.ItemNumber
  item_name.value = val.ProductName
  family_product.value = val.ProductCategory
}

const getStatusFromItemDialog = ()=>{
  waiting.value = val.value
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

watchEffect(() => {
  fetchTrial(trialId)

  const selectedType = trial_types.find(
    type => type.id === trial_type_id.value,
  )

  trial_type.value = selectedType
})

const refCreateTrialForm = ref()

const onSubmit = () => {
  refCreateTrialForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateTrial(trialStore.trial.id)
  })
}

const updateTrial = async id => {
  if (trialStore.trial !== null) {
    try {
      const ret = await axiosIns.patch(
        `/trials/${id}`,
        {
          // document_date: formatDateMySql(document_date.value),
          trial_type: trial_type.value.id,
          item_code: item_code.value,
          family_product: family_product.value,
          item_name: item_name.value,
          size: size.value,
          remark: remark.value,
          trial_note: trial_note.value,
          executor: executorFilter.value,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
          },
        },
      )

      trialStore.trial = ret.data.data[0]
      saved.value = true
      Swal.fire({
        text: "Data updated",
        title: "Manufacture",
        icon: "info",
      })
      
    } catch (error) {
      console.log("Update data failed.")
    }
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

watchEffect(() => {
  fetchExecutor()
})

const fetchMachines = async() =>{
  try{
    const response = await axiosIns.get(`/machines`, {
      params: {
        trial_id: trialId
      }
    });
    trialStore.machine = response.data.data
  }catch(error){
    console.log(error)
  }
}

watchEffect(()=>{
  fetchMachines()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard v-if="waiting">
        <VCardText>
          <VForm
            ref="refCreateTrialForm"
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
                    readonly="true"
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
                  readonly="true"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="spk_number"
                  label="SPK Number"
                  :readonly="saved"
                />
              </VCol>
              <VCol cols="3">
                <VDateInput
                  v-model="document_date"
                  label="Tanggal Dokumen"
                />
              </VCol>
              <VCol cols="3">
                <VSelect
                  v-model="executor"
                  label="Executor"
                  :items="executorFilter"
                  item-title="name"
                  item-value="id"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="6"
                class="d-flex gap-4"
              >
                <VTextField
                  v-model="item_code"
                  label="Item"
                  :rules="[requiredValidator]"
                  readonly
                />
                <Product
                  v-if="trial_type_id !==1"
                  @product="getValueFromItemDialog"
                  @product-loading="getStatusFromItemDialog"
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="family_product"
                  label="Family Product"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="item_name"
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
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <!--
                  <VBtn
                  v-if="!saved"
                  color="success"
                  type="submit"
                  >
                  Save
                  </VBtn>
                -->
                <VBtn
                  color="success"
                  type="submit"
                  :to="{ name: 'trial'}"
                  @click="onSubmit"
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
              v-if="ability.can('Read', 'Trial Material')"
              value="material"
            >
              <Material />
            </VWindowItem>

            <VWindowItem
              v-if="ability.can('Read', 'Trial Approval')"
              value="approval"
            >
              <Approval />
            </VWindowItem>
            <VWindowItem
              v-if="ability.can('Read', 'Trial Compostion')"
              value="composition"
            >
              <Composition />
            </VWindowItem>
            <VWindowItem
              v-if="ability.can('Read', 'Trial Machine')"
              value="machines"
            >
              <Machine />
            </VWindowItem>
            <VWindowItem
              v-if="ability.can('Read', 'Trial Machine')"
              value="result"
            >
              <Result :header-id="trialId" />
            </VWindowItem>
            <VWindowItem
              v-if="ability.can('Read', 'Trial Acceptance')"
              value="acceptance"
            >
              <Acceptance />
            </VWindowItem>
            <VWindowItem
              v-if="ability.can('Read', 'Trial Acceptance')"
              value="keterangan"
            >
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
