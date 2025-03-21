<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue'
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

// import Person from '@/pages/ticket/person.vue'
// import Person from '@/pages/lookup/employee.vue'
// import Person from '@/pages/lookup/employeeICT.vue'
import Person from './employeeICTSelected.vue'

const props = defineProps({
  headerId:{
    type: String,
    default: null,
  },
})

const emit = defineEmits(['saved', 'closed'])
const route = useRoute()

// const projectId = computed(() => props.headerId)
const projectId = ref(props.headerId)

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

// const projectTeamId = ref()
const projectData = ref([])

const saved = ref(false)

const perPage = ref(10)
const page = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)
const lineData = ref()

const waiting = ref(false)

const getApprovalPerson = val => {
 
  person.value = val.person.name
  personNik.value = val.person.nik

  personId.value = val.id

}

const closeDialog = () => {
  isVisible.value = false

  // clearForm()
  emit('closed', true)
}

const projectTeam = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.get(`/project/teams/${id}` )

    showLoading.value = false

    projectData.value = ret.data.data[0]
    name.value = projectData.value.name
    description.value = projectData.value.description
    

  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
  finally{showLoading.value = false}
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

const modifyTeam = async id => {
  saved.value = false
  showLoading.value = true
  try {
    const ret = await axiosIns.patch(`/project/teams/${id}`, {
      name            : name.value,
      description     : description.value,

    } )

    // emit('saved', true)
    saved.value = true

    // isVisible.value = false
    // isVisibleLine.value = true
    
    // console.log(ret.data.data.id)
    // clearForm()
    showLoading.value = false

    // projectTeamId.value = ret.data.data.id
    projectTeam(projectId.value)

  } catch (error) {
    console.log(error)
    toast.error('Failed Update data')
  } finally {
    showLoading.value = false
  }
}

// watchEffect(() => {
//   projectTeam(projectId.value),
//   projectTeamLine(projectId.value)
// })

const getSuccess = () => {
  projectTeamLine(projectId.value)
}

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      modifyTeam(projectId.value)
    }
  })
}

const deleteData = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.delete(`/projectTeam/lines/${id}` )

    projectTeamLine(projectId.value || projectTeamId.value)

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

const setWaitingTrue = () => {
  waiting.value = true
  projectTeam(projectId.value)
  projectTeamLine(projectId.value)
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
        <VCardTitle>Project Team</VCardTitle>
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
                  label="Name Project"
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
                  :disabled="showLoading || saved"
                  @click="validateFom"
                >
                  Save
                </VBtn>

                <Person
                  :team-id="projectId"
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
                  Nik
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
  </div>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Dashboard
    redirectIfLoggedIn: false
  </route>
