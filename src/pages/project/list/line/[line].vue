<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import AddLine from './addLine.vue'
import Edit from './edit.vue'

// import Person from '@/pages/ticket/person.vue'

const props = defineProps({
  headerId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['saved'])
const route = useRoute()
const toast = useToast()

const Projectpriority = ref()
const projectType = ref()
const priority = ref()
const status = ref()

const isVisible = ref(false)
const refForm = ref()

const showLoading = ref(false)
const person = ref()
const personNik = ref()
const personId = ref()

const name = ref()
const description = ref()
const planStart = ref(new Date())
const planEnd = ref()
const ActualStart = ref()
const ActualEnd = ref()
const assignTo = ref()

const ticketId = ref()
const ticketNumber = ref()
const ticketDescription = ref()

const projects = ref([])
const projectId = ref(route.params.line)
const projectTeamId = ref(route.query.team)

const planStartLine = ref(new Date())
const planEndLine = ref()
const ActualStartLine = ref()
const ActualEndLine = ref()


const statusLine = ref()
const priorityLine = ref()
const descriptionLine = ref()
const nameLine = ref()
const typeLine = ref()

const personLine = ref()

const projectLine = ref()
const perPage = ref(10)
const page = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)

const isEdit = ref(false)
const GetAdd = ref()
const getEditLine = ref()

const projectLineId = ref()

const findText = ref('')
const department = ref('')
const requestorTicket = ref('')

const fetchProjectId = async projectId => {
  isVisible.value = true
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/projects/${projectId}`, {
    })

    showLoading.value = false
    projects.value = ret.data.data[0]

    department.value = projects.value.project_department?.description
    ticketNumber.value = projects.value.ticket?.document_number
    ticketDescription.value = projects.value.ticket?.description

    requestorTicket.value = projects.value.ticket?.user?.person?.name

    name.value = projects.value.name
    description.value = projects.value.description

    priority.value = projects.value.project_priority?.description || ''
    status.value = projects.value.project_status?.description || ''
    person.value = projects.value.team?.name || ''
    planStart.value = projects.value.plan_start || ''
    planEnd.value = projects.value.plan_end || ''
    ActualStart.value = projects.value.actual_start || ''
    ActualEnd.value = projects.value.actual_end || ''
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchProjectLine = async (projectId, page, perPage, find) => {
  isVisible.value = false
  showLoading.value = true
  try {
    const ret = await axiosIns.get(`/project/line/byProject/${projectId}`, {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    showLoading.value = false
    projectLine.value = ret.data.data
    descriptionLine.value = projectLine.value?.description || ''

    priorityLine.value = projectLine.value?.project_priority?.description || ''
    statusLine.value = projectLine.value?.project_status?.description || ''
    personLine.value = projectLine.value?.assign_to?.person?.name || ''
    planStartLine.value = projectLine.value?.plan_start || ''
    planEndLine.value = projectLine.value?.plan_end || ''
    ActualStartLine.value = projectLine.value?.actual_start || ''
    ActualEndLine.value = projectLine.value?.actual_end || ''

    total.value = ret.data.meta.total
    last.value = ret.data.meta.last
    to.value = ret.data.meta.from
    from.value = ret.data.meta.to
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

watchEffect(() =>{
  fetchProjectId(projectId.value),
  fetchProjectLine(projectId.value, page.value, perPage.value, find.value)

})

const search = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${total.value}`
})

const validateFom = ()=>{
  refForm.value?.validate().then(({ valid: isValid })=>{
    if(isValid){
      createProjectLine()
    }
  })
}

const deleteData = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.delete(`/project/line/${id}` )

    fetchProjectLine(projectId.value, page.value, perPage.value, find.value)
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

const getSavedLine = val => {
  GetAdd.value = val
  fetchProjectLine(projectId.value, page.value, perPage.value, find.value)
}

const editLine = id => {
  projectLineId.value = id
  isEdit.value = true
}

const getSavedEditLine = val => {
  getEditLine.value = val
  fetchProjectLine(projectId.value, page.value, perPage.value, find.value)

}

const getClosedDialog = closed => {
  if(closed){
    console.log(closed)
    isEdit.value = false

    fetchProjectLine(projectId.value, page.value, perPage.value, find.value)
  }
}

const resolveStatusVariant = description => {
  if (description === 'To Do') {
    return {
      text: 'To Do',
      color: 'gray',
    }
  } else if (description === 'In Progress') {
    return {
      text: 'In Progress',
      color: 'info',
    }
  } else if (description === 'Done') {
    return {
      text: 'Done',
      color: 'success',
    }
  } else if (description === 'Hold') {
    return {
      text: 'Hold',
      color: 'warning',
    }
  } else if (description === 'Ended') {
    return {
      text: 'Ended',
      color: 'error',
    }
  } else if (description === 'Overdue') {
    return {
      text: 'Overdue',
      color: 'error',
    }
  } else {
    return {
      text: 'Unknown',
      color: 'error',
    }
  }
}

const prioritycolor = description => {
  if (description === 'Highest') {
    return {
      text: 'Highest',
      icon: 'tabler:chevrons-up', color: 'error',
    }
  } else if (description === 'Hight') {
    return {
      text: 'Hight',
      icon: 'tabler:chevron-up', color: 'error',
    }
  } else if (description === 'Medium') {
    return {
      text: 'Medium',
      icon: 'tabler:menu-2', color: 'warning',
    }
  } else if (description === 'Low') {
    return {
      text: 'Low',
      icon: 'tabler:menu', color: 'warning',
    }
  } else if (description === 'Lowest') {
    return {
      text: 'Lowest',
      icon: 'tabler:minus', color: 'gray',
    }
  } else {
    return {
      text: 'Unknown',
      color: 'error',
    }
  }
}

const startProject = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.post(`/project/line/execution/inProgress/${id}` )

    fetchProjectLine(projectId.value, page.value, perPage.value, find.value)

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

const btnStartHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Start Project Now?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#C51605',
    cancelButtonColor: 'default',
    confirmButtonText: 'Yes, Start Now!',
  }).then(ret => {
    if(ret.isConfirmed) {
      startProject(id)
    }
  })
}

const endProject = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.post(`/project/line/execution/done/${id}` )

    fetchProjectLine(projectId.value, page.value, perPage.value, find.value)

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

const btnEndHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Ended Project Now?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#C51605',
    cancelButtonColor: 'default',
    confirmButtonText: 'Yes, End Now!',
  }).then(ret => {
    if(ret.isConfirmed) {
      endProject(id)
    }
  })
}

const holdProject = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.post(`/project/line/execution/hold/${id}` )

    fetchProjectLine(projectId.value, page.value, perPage.value, find.value)

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

const btnHoldHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Hold Project ?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#C51605',
    cancelButtonColor: 'default',
    confirmButtonText: 'Yes, Hold Now!',
  }).then(ret => {
    if(ret.isConfirmed) {
      holdProject(id)
    }
  })
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardTitle>Project Detail</VCardTitle>
        <VDivider />
  
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="validateFom"
          >
            <VRow>
              <VCol cols="6">
                <VTextField
                  v-model="name"
                  label="Name Project"
                  variant="filled"
                  readonly
                />
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="department"
                  variant="filled"
                  label="To Department"
                  readonly
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="description"
                  variant="filled"
                  label="Description"
                  readonly
                  rows="2"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="4"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="ticketNumber"
                  label="Ticket Number"
                  readonly
                  variant="filled"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="8">
                <VTextField
                  v-model="requestorTicket"
                  label="Ticket Requestor"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="12">
                <VTextarea
                  v-model="ticketDescription"
                  label="Ticket Description"
                  rows="2"
                  readonly
                  variant="filled"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="priority"
                  label="Priority"
                  variant="filled"
                  readonly
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="9"
                class="d-flex gap-3"
              >
                <VTextField
                  v-model="person"
                  label="Assign for Team"
                  variant="filled"
                  readonly
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="3">
                <VTextField
                  v-model="planStart"
                  variant="filled"
                  readonly
                  label="Plan Start"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="planEnd"
                  label="Plan End"
                  variant="filled"
                  readonly
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="ActualStart"
                  variant="filled"
                  readonly
                  label="Actual Start"
                />
              </VCol>
              <VCol cols="3">
                <VTextField
                  v-model="ActualEnd"
                  variant="filled"
                  readonly
                  label="Actual End"
                />
              </VCol>
            </VRow>

            <VRow class="mt-3">
              <VCol
                cols="12"
                class="d-flex justify-end gap-3"
              >
                <VBtn
                  color="warning"
                  :disabled="showLoading"
                  @click="router.back()"
                >
                  Back
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>

      <VCard style="margin-top: 18px;">
        <VRow>
          <VCol cols="12">
            <VCardText class="d-flex justify-between gap-4">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10,20,30,50]"
                />
              </div>
              <div style="margin-left: auto;">
                <AddLine
                  :header-id="projectId"
                  :project-team="projectTeamId"
                  @saved="getSavedLine"
                />
              </div>
            </VCardText>
          </VCol>
        </VRow>
        <VCardText>
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
                  Status
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Priority
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Description
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Assign To
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Plan Start
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Plan End
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Plan Duration (Day)
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Actual Start
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Actual End
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Actual Duration (Day)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in projectLine"
                :key="index"
              >
                <td style="width: 5rem;">
                  <div class="d-flex justify-start">
                    <VBtn
                      icon
                      variant="none"
                      color="warning"
                      title="Edit"
                      size="22"
                      :disabled="data.status === 2"
                      @click="editLine(data.id)"
                    >
                      <VIcon
                        icon="tabler-edit"
                      />
                    </VBtn>
                    <VBtn
                      icon
                      variant="none"
                      color="error"
                      title="Delete"
                      size="22"
                      :disabled="data.status === 2 || data.status === 1"
                      @click="btnDeleteClickHandler(data.id)"
                    >
                      <VIcon
                        icon="tabler-trash"
                      />
                    </VBtn>
                    
                    <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="22"
                      title="View More"
                      :disabled="data.status === 2"
                    >
                      <VIcon
                        :size="22"
                        icon="tabler-dots-vertical"
                      />
                      
                      <VMenu activator="parent">
                        <VList>
                          <VListItem 
                            v-if="data.status === 0 || data.status === 3"
                            @click="btnStartHandler(data.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="success"
                                size="24"
                                class="me-3"
                                icon="mdi-play-speed"
                              />
                              Start
                            </VListItemTitle>
                          </VListItem>
                          <VListItem
                            v-if="data.status === 1 || data.status === 9"
                            @click="btnEndHandler(data.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="error"
                                size="24"
                                class="me-3"
                                icon=" mdi-stop-circle-outline"
                              />
                              End
                            </VListItemTitle>
                          </VListItem>
                          <VDivider />

                          <VListItem
                            v-if="data.status !== 3"
                            @click="btnHoldHandler(data.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="mdi-motion-pause-outline"
                              />
                              Hold
                            </VListItemTitle>
                          </VListItem>
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px; margin-bottom: 5px; text-align: left;"
                  >
                    <VChip
                      variant="outlined"
                      :color="resolveStatusVariant(data.project_status?.description).color"
                    >
                      {{ resolveStatusVariant(data.project_status?.description).text }}
                    </VChip>
                    <p
                      :style="{ color: data.info_project === 'Overdue' ? '#EA5455' : '#28C76F' }"
                      style="margin: 0;"
                    >
                      {{ data.info_project }}
                    </p>         
                  </div>               
                </td>
                <td class="text-no-wrap">
                  <div class="d-flex align-items-center">
                    {{ data.project_priority?.description }}
                    <VIcon 
                      :icon="prioritycolor(data.project_priority?.description).icon" 
                      :color="prioritycolor(data.project_priority?.description).color" 
                      class="me-2"
                    />
                  </div>
                </td>
                <td class="text-no-wrap">
                  {{ data.description }}
                </td>
                <td class="text-no-wrap">
                  {{ data.assign_to?.person?.name || '' }}
                </td> 
                <td class="text-no-wrap">
                  {{ data.plan_start }}
                </td>
                <td class="text-no-wrap">
                  {{ data.plan_end }}
                </td>
                <td style="text-align: right;">
                  {{ data.plan_duration }}
                </td>
                <td class="text-no-wrap">
                  {{ data.actual_start }}
                </td>
                <td class="text-no-wrap">
                  {{ data.actual_end }}
                </td>
                <td style="text-align: right;">
                  {{ data.actual_duration }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
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
      </VCard>
      <Edit
        v-if="isEdit"
        :project-id="projectId"
        :header-id="projectLineId"
        :project-team="projectTeamId"
        @saved="getSavedEditLine"
        @closed="getClosedDialog"
      />
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Project
    redirectIfLoggedIn: false
</route>
