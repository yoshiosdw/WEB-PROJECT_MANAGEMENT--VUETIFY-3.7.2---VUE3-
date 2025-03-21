<script setup>
import { requiredValidator } from "@/@core/utils/validators"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"

const props = defineProps({
  data: ({
    type: Object,
  }),
})

const emits = defineEmits(['status'])
const caseForm = ref()
const cases = ref()
const caseData = ref()

const isVisible = ref(false)

const sendStatus = val => {
  emits('status', val)
}

const fetchCase = async() => {
  try {
    const ret = await axiosIns.get('/sat/cases' )

    caseData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Get data failed',
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchCase()
})

const updateSat = async() => {
  try {
    const ret = await axiosIns.patch(`job/order/cases/${props.data.id}`, {
      // params: {
      case: cases.value,

      // }
    } )

    emits('case-updated', true)
    sendStatus(true)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Update case failed',
      icon: 'error',
    })
    sendStatus(false)
    console.log(error)
  }
}

const onSubmit = () => {
  caseForm.value?.validate().then(({ valid: isValid }) => {
    if(isValid) {
      updateSat(),
      isVisible.value = false
    }
  })
}

const cancelClickHandler = () => {
  isVisible.value = false
  cases.value = ''
}
</script>

<template>
  <VDialog
    v-model="isVisible"
    :width="700"
    persistent
  >
    <template #activator="{props}">
      <VListItemTitle v-bind="props">
        <VIcon
          color="success"
          size="24"
          class="me-3"
          icon="tabler-check"
        />
        Closed
      </VListItemTitle>
    </template>
    <VCard>
      <VCardText>
        <VForm
          ref="caseForm"
          style="height: auto;"
          @submit.prevent="onSubmit"
        >
          <VRow>
            <VCol cols="12">
              <VSelect 
                v-model="cases"
                label="Case"
                :items="caseData"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                clearable
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <div class="d-flex mt-6 gap-4 justify-end">
                <VBtn
                  color="warning"
                  @click="cancelClickHandler"
                >
                  Cancel
                </VBtn>
                <VBtn
                  color="primary"
                  type="submit"
                >
                  Save
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
  </route>
