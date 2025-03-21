<script setup>
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import itemBrowse from "./item-browse.vue"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const materials = ref(null)
const totalMaterials = ref(0)
const rowPerPage = ref(10)
const totalPage = ref(0)

const itemCode = ref(null)
const itemName = ref(null)
const qtyZack = ref(0)
const qtyKg = ref(0)

const kgChageHandler = () => {
  qtyZack.value = qtyKg.value / 25
}

const zakChangeHandler = () => {
  qtyKg.value = qtyZack.value * 25
}

const waiting = ref(true)

const getValueFromItemDialog = val => {
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
}

const getStatusName = ref([])

const fetchMaterial = async () => {
  waiting.value = true
  try {
    const ret = await axiosIns.get("/trial/materials", {
      params: {
        trial_id: trialStore.trial.id,
      },
    })
    materials.value = ret.data.data
    totalMaterials.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
    getStatusName.value = trialStore.trial.statusName
    // getStatusName.value = materials.trial.statusName
    waiting.value = true
  } catch (error) {
    console.log(error)
    // Swal.fire({
    //   title: "Manufacture",
    //   text: error,
    //   icon: "error",
    // })
  }
}

const errors = ref({
  itemCode: undefined,
  qtyZack: undefined,
  qtKg: undefined,
})

watchEffect(() => {
  fetchMaterial()
})

const paginationData = computed(() => {
  const lastIndex = rowPerPage.value
  return `Showing ${rowPerPage.value} to ${lastIndex} of ${totalMaterials.value} entries`
})

const refMaterialForm = ref()
const onSubmit = () => {
  refMaterialForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createTrialMaterial()
  })
}

const createTrialMaterial = async () => {
  try {
    const ret = await axiosIns.post(
      "trial/materials",
      {
        trial_id: trialStore.trial.id,
        item_code: itemCode.value,
        item_name: itemName.value,
        qty_zack: qtyZack.value,
        qty_kg: qtyKg.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      }
    )
    fetchMaterial()
    itemCode.value = ""
    itemName.value = ""
    qtyKg.value = 0
    qtyZack.value = 0
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create material failed.",
      icon: "error",
    })
  }
}

const deleteData = async (id) => {
  try {
    const ret = await axiosIns.delete(`trial/materials/${id}` )

    fetchMaterial()
    Swal.fire({
      text: "Delete",
      title: "Manufacture",
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

const confirmDeleteMaterialHandler = (materialId) => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      deleteData(materialId)
    }
  })
}

// const calculateQuantity = () => {
//   const result = qtyZack.value * 25
//   qtyKg.value = result
// }

const getStatusFromItemDialog = (val) => {
  // alert(val.value)
  waiting.value = val.value
}

</script>

<template>
  <VRow>
    <VCol
      v-if="ability.can('Manage', 'Trial Material')"
      cols="12"
    >
      <VCard>
        <VCardText>
          <VForm ref="refMaterialForm" @submit.prevent="onSubmit">
            <VRow v-if="waiting">
              <VCol cols="6" class="d-flex gap-4" v-if="getStatusName !== 'Substitusi Bahan'">
                <VTextField label="Item" v-model="itemCode" :readonly="true" />
                <itemBrowse
                  @data="getValueFromItemDialog"
                  @statusFetchingData="getStatusFromItemDialog"
                />
              </VCol>
               <VCol cols="6" class="d-flex gap-4" v-if="getStatusName === 'Substitusi Bahan'">
                <VTextField 
                  label="Item" 
                  v-model="itemCode"
                />
              </VCol>
              <VCol cols="6">
                <VRow>
                  <VCol cols="6">
                    <VTextField
                      label="Qty Zack"
                      :suffix="'Zack'"
                      v-model="qtyZack"
                      type="number"
                      inputmode="numeric"
                      reverse
                      @input="zakChangeHandler"
                    />
                  </VCol>
                  <VCol cols="6">
                    <VTextField
                      label="Qty KG"
                      :suffix="'Kg'"
                      v-model="qtyKg"
                      type="number"
                      inputmode="numeric"
                      reverse
                      @input="kgChageHandler"
                    />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextField label="Name" v-model="itemName" :readonly="getStatusName !== 'Substitusi Bahan'" />
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
      <VCard>
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Name</th>
              <th scope="col">Qty Zack</th>
              <th scope="col">Qty Kg</th>
              <th scope="col">Action</th>
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
              <td>
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteMaterialHandler(material.id)"
                  v-if="ability.can('Manage', 'Trial Material')"
                >
                  <VIcon size="22" icon="tabler-trash" color="error" />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>

        <!-- <VDivider />
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>
        </VCardText> -->
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Trial Material
  redirectIfLoggedIn: false
</route>
