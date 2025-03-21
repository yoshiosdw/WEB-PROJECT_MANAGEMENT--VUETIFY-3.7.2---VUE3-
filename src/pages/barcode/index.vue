<script setup>
import { formatDateMySql } from "@/@core/utils/formatters"
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import { onMounted, ref } from "vue"
import { useToast } from "vue-toastification"
import Report from "./report.vue"
import { VDateInput } from "vuetify/lib/labs/components.mjs"

const toast = useToast()
const typelabels = ref([])
const shifts = ref([])
const units = ref([])
const lastNumber = ref([])
const productionDate = ref(new Date())
const productionId = ref()
const pengawas = ref()
const operator = ref()
const codeContainer = ref()
const unit = ref(1)
const typeLabel = ref(1)
const shift = ref(1)
const fromNumber = ref(1)
const toNumber = ref(1)
const total = computed(() => toNumber.value - fromNumber.value + 1)
const showQrCode = ref(true)
const showMachineNumber = ref(true)
const showCodeContainer = ref(true)
const refForm = ref()
const idProd = ref()

const fetchShift = async ()=> {
  try {
    const res = await axiosIns.get('/shift')

    shifts.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchUnit = async ()=> {
  try {
    const res = await axiosIns.get('/units')

    units.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchTypeLabel = async ()=> {
  try {
    const res = await axiosIns.get('/typelabel')

    typelabels.value = res.data.data
  } catch (error) {
    console.log(error)
  }
}

const fetchLastNumber = async ()=> {
  try {
    const params = {
      boNumber: productionId.value,
    }

    const res = await axiosIns.get('/barcodes/getlast', { params })
    
    lastNumber.value = res.data
    fromNumber.value = lastNumber.value.nextPage
    toNumber.value = lastNumber.value.nextPage
    idProd.value = productionId.value
    console.log(lastNumber.value)
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchShift()
  fetchUnit()
  fetchTypeLabel()
})

const printBarcode = async ()=> {
  try {
    const params = {
      unit_id: unit.value,
      shift_id: shift.value,
      pengawas: pengawas.value,
      operator: operator.value,
      code_container: codeContainer.value,
      type_id: typeLabel.value,
      prod_date: formatDateMySql (productionDate.value),
      prod_id: productionId.value,
      from_page: fromNumber.value,
      to_page: toNumber.value,
      showQrCode: showQrCode.value,
      showMachineNumber: showMachineNumber.value,
      showCodeContainer: showCodeContainer.value,
    }

    const response = await axiosIns.post('/barcodes/print/barcode', params, {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))

    window.open(url, '_blank')
    
  } catch (error) {
    console.log(error)
    if (error.response && error.response.data) {
      const reader = new FileReader()

      reader.onload = function () {
        try {
          const jsonError = JSON.parse(reader.result)
          const errorMessage = jsonError.message || 'Terjadi kesalahan!'

          toast.error(errorMessage)
        } catch (e) {
          toast.error('Terjadi kesalahan dalam membaca response!')
        }
      }
      reader.readAsText(error.response.data)
    } else {
      toast.error('Terjadi kesalahan pada server!')
    }
  }
}

const validateForm = () => {
  refForm.value?.validate().then(({ valid: isValid })=> {
    if (isValid) {
      printBarcode()
    }
  }) 
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VForm ref="refForm">
          <VCardText class="mt-2">
            <VRow>
              <VCol cols="3">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="productionId"
                    label="Produksi"
                    :rules="[requiredValidator]"
                    clearable
                    @keyup.enter="fetchLastNumber"
                  />
                </div>
              </VCol>
    
              <VCol cols="3">
                <VDateInput
                  v-model="productionDate"
                  label="Tanggal Produksi"
                  density="compact"
                  prepend-icon=""
                  hide-actions="true"
                  clearable
                  variant="outlined"
                />
              </VCol>
              
              <VCol cols="3">
                <VSelect 
                  v-model="shift"
                  label="Shift"
                  :items="shifts"
                  item-value="id"
                  item-title="name"
                />
              </VCol>
    
              <VCol cols="3">
                <VAutocomplete 
                  v-model="typeLabel"
                  label="Jenis Label"
                  :rules="[requiredValidator]"
                  :items="typelabels"
                  item-value="id"
                  item-title="name"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="fromNumber"
                  label="Stiker No"
                  type="number"
                  density="compact"
                  class="w-100"
                />
              </VCol>
    
              <VCol cols="3">
                <VTextField
                  v-model="toNumber"
                  label="Hingga"
                  type="number"
                  density="compact"
                  class="w-100"
                />
              </VCol>
    
              <VCol cols="3">
                <VTextField
                  v-model="total"
                  label="Total"
                  type="number"
                  density="compact"
                  class="w-100"
                />
              </VCol>
    
              <VCol cols="3">
                <VSelect 
                  v-model="unit"
                  :rules="[requiredValidator]"
                  label="Unit"
                  :items="units"
                  item-value="id"
                  item-title="name"
                />
              </VCol>
            </VRow>
  
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="pengawas"
                  :rules="[requiredValidator]"
                  label="Pengawas"
                  clearable
                />
              </VCol>
    
              <VCol cols="4">
                <VTextField
                  v-model="operator"
                  :rules="[requiredValidator]"
                  label="Operator"
                  clearable
                />
              </VCol>

              <VCol cols="4">
                <VTextField
                  v-model="codeContainer"
                  label="Kode Container"
                  clearable
                />
              </VCol>
            </VRow>
    
            <VRow> 
              <VCol cols="4">
                <div class="d-flex align-items-center">
                  <VCheckbox 
                    v-model="showQrCode" 
                    label="Tampilkan Qr Code?" 
                    density="compact"
                  />
                </div>
              </VCol>
    
              <VCol cols="4">
                <div class="d-flex align-items-center">
                  <VCheckbox 
                    v-model="showMachineNumber" 
                    label="Tampilkan Kode Mesin?" 
                    density="compact"
                  />
                </div>
              </VCol>

              <VCol cols="4">
                <div class="d-flex align-items-center">
                  <VCheckbox 
                    v-model="showCodeContainer" 
                    label="Tampilkan Kode Container?" 
                    density="compact"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol 
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  @click="validateForm"
                >
                  Print
                </VBtn>
              </VCol>
            </VRow>
          </VCardText>
        </VForm>
      </VCard>
    </VCol>
    <VCol>
      <VCard>
        <Report :bo-number="idProd" />
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Barcode
    redirectIfLoggedIn: false
</route>
