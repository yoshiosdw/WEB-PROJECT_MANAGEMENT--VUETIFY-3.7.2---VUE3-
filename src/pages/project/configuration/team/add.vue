<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'
import router from '@/router'
import { requiredValidator } from '@/@core/utils/validators'

// import Person from '@/pages/ticket/person.vue'
// import Person from '@/pages/lookup/employee.vue'
// import Person from '@/pages/lookup/employeeICT.vue'
import Person from './employeeICTSelected.vue'
import Ticket from '@/pages/lookup/ticket.vue'

const emit = defineEmits(['saved', 'closed'])
const toast = useToast()

const isVisible = ref(false)
const isVisibleLine = ref(false)

const refForm = ref()

const showLoading = ref(false)
const person = ref()
const personNik = ref()
const personId = ref()

const name = ref()
const description = ref()

const projectTeamId = ref()
const saved = ref(false)

const perPage = ref(10)
const page = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)
const lineData = ref([])


const getApprovalPerson = val => {
 
  person.value = val.person.name
  personNik.value = val.person.nik

  personId.value = val.id

}

const closeDialog = () => {
  isVisible.value = false
  saved.value = false
  clearForm()

  // emit('closed', true)
}

const projectTeamLine = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.get(`/projectTeamLine/by/header/${id}` )

    showLoading.value = false

    lineData.value = ret.data.data
    

  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
  finally{showLoading.value = false}
}

const createTeam = async () => {
  saved.value = false
  showLoading.value = true
  try {
    const ret = await axiosIns.post('/project/teams', {
      name            : name.value,
      description     : description.value,

    } )

    // emit('saved', true)
    saved.value = true
    sendData(ret)

    // isVisible.value = false
    // isVisibleLine.value = true
    
    // console.log(ret.data.data.id)
    // clearForm()
    showLoading.value = false

    projectTeamId.value = ret.data.data.id
  } catch (error) {
    console.log(error)
    toast.error('Failed create data')
  } finally {
    showLoading.value = false
  }
}

const sendData = val => {
  emit('closed', val)
}

watchEffect(() => {
  if(projectTeamId.value != null)
  {
    projectTeamLine(projectTeamId.value)
  }
})

const getSuccess = () => {
  projectTeamLine(projectTeamId.value)
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createTeam()
    }
  })
}

const clearForm = () => {
  name.value = ''
  description.value = ''
}

const deleteData = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.delete(`/projectTeam/lines/${id}` )

    projectTeamLine(projectTeamId.value)

    showLoading.value = false

  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
  finally{showLoading.value = false}
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
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
      <template #activator="{props}">
        <VBtn
          v-bind="props"
          prepend-icon="tabler-plus"
        >
          Add Team
        </VBtn>
      </template>
      <DialogCloseBtn @click="closeDialog" />
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Add Team</VCardTitle>
        <VDivider />
  
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="4">
                <VTextField
                  v-model="name"
                  label="Name Team"
                  :rules="[requiredValidator]"
                  :disabled="saved"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="description"
                  label="Description"
                  :rules="[requiredValidator]"
                  :disabled="saved"
                />
              </VCol>
            </VRow>
            <VRow
              v-if="!saved"
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
            <VRow
              v-if="saved"
              class="mt-3"
            >
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <Person
                  :team-id="projectTeamId"
                  @employee="getApprovalPerson"
                  @post-success="getSuccess"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>

        <VCardText
          title="Teams Members"
        >
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef;"
            >
              <tr>
                <th scope="col">
                  Action
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Name Team
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in lineData"
                :key="index"
              >
                <td class="text-no-wrap">
                  <VBtn
                    icon
                    variant="none"
                    color="error"
                    title="Delete"
                    size="22"
                    @click="btnDeleteClickHandler(data.id)"
                  >
                    <VIcon
                      icon="tabler-trash"
                    />
                  </VBtn>
                </td>
                <td style="white-space: nowrap;">
                  {{ data.employee?.person?.name }}
                </td>

                <td style="white-space: nowrap;">
                  {{ data.employee?.person?.nik }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <!--
          <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
          {{ paginationData }}
          </span>

          <VPagination
          v-model="page"
          size="small"
          :total-visible="5"
          :length="last"
          />
          </VCardText> 
        -->
      </VCard>
    </VDialog>
    

    <!--
      <Line
      v-if="isVisibleLine"
      :header-id="projectId"
      /> 
    -->
  </div>
</template>
