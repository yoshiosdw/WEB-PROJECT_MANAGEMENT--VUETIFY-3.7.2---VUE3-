<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

const props = defineProps({
  headerId:{
    type: String,
    default: null,
  },
})

const emit = defineEmits(['saved', 'closed'])
const route = useRoute()

const waiting = ref(false)

// const priorityId = computed(() => props.headerId)
const priorityId = ref(props.headerId)

const toast = useToast()

const isVisible = ref(false)
const isVisibleLine = ref(false)

const refForm = ref()

const showLoading = ref(false)

const code = ref()
const description = ref()

// const projectTeamId = ref()
const priorityData = ref([])

const saved = ref(false)

const closeDialog = () => {
  isVisible.value = false

  // clearForm()
  emit('closed', true)
}

const fetchPriority = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.get(`/projectPriority/${id}` )

    showLoading.value = false

    priorityData.value = ret.data.data[0]
    code.value = priorityData.value.code
    description.value = priorityData.value.description
    

  } catch(error) {
    toast.error('Failed get data')

  }
  finally{showLoading.value = false}
}

const modifyTeam = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`/projectPriority/${id}`, {
      code            : code.value,
      description     : description.value,

    } )

    emit('saved', true)

    isVisible.value = false
    isVisibleLine.value = true
    
    // console.log(ret.data.data.id)
    // clearForm()
    showLoading.value = false

    // projectTeamId.value = ret.data.data.id
    fetchPriority(priorityId.value)

  } catch (error) {
    console.log(error)
    toast.error('Failed create data')
  } finally {
    showLoading.value = false
  }
}

// watchEffect(() => {
//   fetchPriority(priorityId.value)
// })

const setWaitingTrue = () => {
  waiting.value = true
  fetchPriority(priorityId.value)
}


const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      modifyTeam(priorityId.value)
    }
  })
}
</script>

<template>
  <div>
    <VDialog
      v-model="isVisible"
      width="1024"
      transition="dialog-bottom-transition"
      persistent
      z-index="1024"
    >
      <template #activator="{props: activatorProps}">
        <VIcon
          v-bind="activatorProps"
          :size="22"
          icon="tabler-edit"
          @click="setWaitingTrue"
        />
      </template>
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Project Priority</VCardTitle>
        <VDivider />
  
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="code"
                  label="code"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow
              class="mt-3"
            >
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  color="warning"
                  :disabled="showLoading"
                  @click="closeDialog"
                >
                  Cancel
                </VBtn>
  
                <VBtn
                  color="error"
                  :disabled="showLoading"
                  @click="validateFom"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VDialog>
  </div>
</template>

<style>
.no-spinner input::-webkit-outer-spin-button,
.no-spinner input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-spinner input[type="text"] {
  -moz-appearance: textfield; /* For Firefox */
}
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
