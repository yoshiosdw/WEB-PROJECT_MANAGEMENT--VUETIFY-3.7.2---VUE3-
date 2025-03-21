<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import ItemBrowse from "./item-browse.vue"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const itemCode = ref(null)
const itemName = ref(null)
const amountKg = ref(0)
const tonase = ref(0)
const amountPercentage = ref(0)
const waiting = ref(true)

const getValueFromItemDialog = val => {
  itemCode.value = val.ItemNumber
  itemName.value = val.ProductName
}

const getStatusFromItemDialog = val => {
  waiting.value = val.value
}

const compositions = ref(null)
const totalCompositions = ref(0)
const totalPage = ref(0)

const fetchComposition = async () => {
  waiting.value = true
  try {
    const ret = await axiosIns.get("/compositions", {
      
      params: {
        trial_id: trialStore.trial.id,
      },
    })

    compositions.value = ret.data.data
    totalCompositions.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
    waiting.value = true
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Get data Composition failed.",
      icon: "error",
    })
  }
}

const errors = ref({
  itemCode: undefined,
  amountKg: undefined,
  amountPercentage: undefined,
})

watchEffect(() => {
  fetchComposition()
})

const refCompositionForm = ref()

const onSubmit = () => {
  refCompositionForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createComposition()
    }
  })
}

const calculatePercentage = () => {
  const result = (amountKg.value / 25) * 100 // Hitung persentase dari amountKg/25

  amountPercentage.value = result // Simpan hasil perhitungan ke variabel amountPercentage
}

const createComposition = async () => {
  try {
    const ret = await axiosIns.post(
      "compositions",
      {
        trial_id: trialStore.trial.id,
        item_code: itemCode.value,
        item_name: itemName.value,
        tonase: amountKg.value,
        percentage: amountPercentage.value,
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("sinarjoAccessToken"),
        },
      },
    )

    itemCode.value = null
    itemName.value = null
    amountKg.value = 0
    amountPercentage.value = 0
    fetchComposition() // Refresh composition data after successful creation
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Create Composition failed.",
      icon: "error",
    })
  }
}

const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`compositions/${id}` )

    fetchComposition()
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

const confirmDeleteCompositionHandler = compositionId => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then(result => {
    if (result.isConfirmed) {
      deleteData(compositionId)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol
      v-if="ability.can('Manage', 'Trial Compostion')"
      cols="12"
    >
      <VCard v-if="compositions">
        <VCardText>
          <VForm
            ref="refCompositionForm"
            @submit.prevent="onSubmit"
          >
            <VRow v-if="waiting">
              <VCol
                cols="6"
                class="d-flex gap-4"
              >
                <VTextField
                  v-model="itemCode"
                  label="Item"
                  :rules="[requiredValidator]"
                  readonly="true"
                />
                <ItemBrowse
                  @data="getValueFromItemDialog"
                  @status-fetching-data="getStatusFromItemDialog"
                />
              </VCol>
              <VCol cols="6">
                <VRow>
                  <VCol cols="6">
                    <VTextField
                      v-model="amountKg"
                      label="Quantity (Kg)"
                      suffix="Kg"
                      type="number"
                      inputmode="numeric"
                      reverse=""
                      :rules="[requiredValidator]"
                      @change="calculatePercentage"
                    />
                  </VCol>
                  <VCol cols="6">
                    <VTextField
                      v-model="amountPercentage"
                      label="Percentage(%)"
                      suffix="%"
                      type="number"
                      inputmode="numeric"
                      reverse=""
                      :rules="[requiredValidator]"
                      readonly="true"
                    />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="itemName"
                  label="Name"
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
              <th scope="col">
                Action
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
              <td
                class="text-center"
                style="width: 5rem"
              >
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="confirmDeleteCompositionHandler(composition.id)"
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
  subject: Trial Compostion
  redirectIfLoggedIn: false
</route>
