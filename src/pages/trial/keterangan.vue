<script setup>
import { formatDateMySql } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTrialStore } from './useTrialStore'

const props = defineProps({
  headerId: {
    type: String,
    required: true,
  },
})

const trialStore = useTrialStore()
const trialNote = ref(trialStore.trial.trial_note)
const route = useRoute()
const trialId = ref(route.params.id)
const trial = ref()
const refNoteForm = ref() 
const documentNumber = ref(trialStore.trial.document_number) 
const documentDate = ref(trialStore.trial.document_date) 
const trialType = ref(trialStore.trial.trial_type) 
const itemCode = ref(trialStore.trial.item_code) 
const itemName = ref(trialStore.trial.item_name) 
const familyProduct = ref(trialStore.trial.family_product) 
const size = ref(trialStore.trial.size) 
const remark = ref(trialStore.trial.remark)
 
const fetchTrial = async id => {
  try {
    const ret = await axiosIns.get(`/trials/${id}` )

    trial.value = ret.data.data

    // documentDate = ret.data.data[0].document_date;
    // documentNumber = trial.value[0].document_number;
    // trialType = trial.value[0].trial_type;
    // itemCode = trial.value[0].item_code
    // itemName = trial.value[0].item_name
    // familyProduct = trial.value[0].family_product
    // size = trial.value[0].size
    // remark = trial.value[0].remark
    // trialNote.value = trial.value[0].trial_note;
  } catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  fetchTrial(trialStore.trial.id)
})

const updateTrial = async id => {
  try {
    await axiosIns.patch(`/trials/${id}`, {
      document_date: formatDateMySql(documentDate.value),
      trial_type: trialType.value,
      document_number: documentNumber.value,
      item_code: itemCode.value,
      item_name: itemName.value,
      family_product: familyProduct.value,
      size: size.value,
      remark: remark.value,
      trial_note: trialNote.value,
    } )
    fetchTrial(trialStore.trial.id)
    Swal.fire({
      title: 'Manufacture',
      text: 'Update successfully',
      icon: 'success',
    })
  } catch (error) {
    console.log(error)
  }
}

const onSubmit = () => {
  refNoteForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) updateTrial(trialStore.trial.id)
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VForm
            ref="refNoteForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="trialNote"
                  rows="2"
                  label="Catatan"
                />
              </VCol>
            </VRow>
            <!-- {{ trialStore.trial.id }} -->
            <!-- {{ documentDate }} -->
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
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
