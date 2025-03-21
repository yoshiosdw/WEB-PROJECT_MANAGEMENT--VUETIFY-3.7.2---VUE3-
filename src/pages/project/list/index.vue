<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import axiosIns from '@/plugins/axios'
import router from '@/router'
import { watchEffect } from 'vue'
import { useToast } from 'vue-toastification'
import Project from './add.vue'
import Swal from 'sweetalert2'
import Edit from './edit.vue'
import Start from './start.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const toast = useToast()
const perPage = ref(10)
const page = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)
const projects = ref()
const Projectpriority = ref()
const projectCode = ref()
const statusCode = ref()
const statusData = ref()
const find = ref('')
const findText = ref('')

const showLoading = ref(false)

const projectId = ref()
const getEdit = ref()
const isEdit = ref(false)

const ticketTransferId = ref(route.query.id)

// const getStatus = ref(false)

const fetchProject = async (page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projects', {
      params: {
        page: page,
        perPage: perPage,
        find: find,
        status: statusCode.value,
        project_id: projectCode.value,
      },
    })

    showLoading.value = false

    projects.value = ret.data.data
    
    // getStatus.value = projects.value.project_status?.description
    total.value = ret.data.meta.total
    last.value = ret.data.meta.last
    to.value = ret.data.meta.to
    from.value = ret.data.meta.from
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  } finally {
    showLoading.value = false
  }
}

const fetchStatus = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectStatus', {
    })

    showLoading.value = false
    statusData.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const fetchPriority = async () => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectPriority', {
    })

    showLoading.value = false
    Projectpriority.value = ret.data.data
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  }
  finally{showLoading.value = false}
}

const search = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchProject(page.value, perPage.value, find.value),
  fetchStatus(),
  fetchPriority()
})

const deleteData = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.delete(`/projects/${id}` )

    fetchProject(page.value, perPage.value, find.value),

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

const editLine = id => {
  projectId.value = id
  isEdit.value = true
}

const getSavedEditLine = val => {
  getEdit.value = val
  fetchProject(page.value, perPage.value, find.value)
  isEdit.value = false
}

const getClosedDialog = closed => {
  if(closed){

    isEdit.value = false
    
    // isStart.value = false
  }
}

const getClosed = closed => {
  if(closed){

    ticketTransferId.value = null
  }
}

// const startProject = id => {
//   projectId.value = id
//   isStart.value = true
// }

const startProject = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.post(`/projects/execution/inProgress/${id}` )

    fetchProject(page.value, perPage.value, find.value),

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
    const ret = await axiosIns.post(`/projects/execution/done/${id}` )

    fetchProject(page.value, perPage.value, find.value),

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
    const ret = await axiosIns.post(`/projects/execution/hold/${id}` )

    fetchProject(page.value, perPage.value, find.value),

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

const resolveStatusVariant = description => {
  if (description === 'To Do') {
    return {
      text: 'To Do',
      color: 'default',
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
    return { text: 'Unknown', icon: 'tabler:alert-circle', color: 'error' }
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
    return { text: 'Unknown', icon: 'tabler:alert-circle', color: 'error' }
  }
}

// const prioritycolor = description => {
//   switch (description) {
//   case 'Heigest':
//     return { icon: 'tabler:chevrons-up', color: 'error' }
//   case 'Height':
//     return { icon: 'tabler:chevron-up', color: 'error' } 
//   case 'Medium':
//     return { icon: 'tabler:menu-2', color: 'warning' } 
//   case 'Low':
//     return { icon: 'tabler:menu', color: 'warning' } 
//   case 'Lowest':
//     return { icon: 'tabler:minus', color: 'gray' }
//   default:
//     return { icon: '', color: '' }
//   }
// }

const exportData = async () => {
  showLoading.value = true
  try {
    // const fromDateString = formatDateMySql(summaryStore.fromDate)
    // const toDateString = formatDateMySql(summaryStore.toDate)

    // const params = {
    //   fromDate: fromDateString,
    //   toDate: toDateString,
    // }

    const ret = await axiosIns.get(`projects/export`, { responseType: 'blob' })

    toast.success('Export Success')

    const url = window.URL.createObjectURL(new Blob([ret.data]))

    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', `Summary.xlsx`) 
    document.body.appendChild(link)
    link.click() 

    URL.revokeObjectURL(url)
    document.body.removeChild(link) 
  } catch(error) {
    console.log(error)
    toast.error('Export Failed')
  } finally { 
    showLoading.value = false
  }
}

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${total.value}`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VRow>
          <VCol cols="12">
            <VCardText class="d-flex gap-4">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10,20,30,50]"
                />
              </div>

              <div
                class="d-flex gap-4"
                style="width: 10rem;"
              >
                <VSelect
                  v-model="statusCode"
                  :items="statusData"
                  item-value="code"
                  item-title="description"
                  label="Status"
                  clearable
                />
              </div>
              <div
                class="d-flex gap-4"
                style="width: 10rem;"
              >
                <VSelect
                  v-model="projectCode"
                  :items="Projectpriority"
                  item-value="code"
                  item-title="description"
                  label="Priority"
                  clearable
                />
              </div>
              <VTextField 
                v-model="findText"
                label="Search"
                @keydown.enter="search"
              />
              <VBtn
                prepend-icon="tabler:file-spreadsheet"
                @click="exportData"
              >
                Excel
              </VBtn>
              <Project
                :ticket-data="ticketTransferId"
                @closed="getClosed"
                @saved="fetchProject(page.value, perPage.value, find.value)"
              />
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
                  Progress
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
                  Name Project
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
                  Created By
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Assign For Team
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Department
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Business Unit
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  No. Ticket
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
                v-for="(data, index) in projects"
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
                            v-if="data.status !== 3"
                            :to="{ name:'project-list-line-line', params :{line: data.id}, query :{ team: data.project_team_id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                variant="none"
                                density="compact"
                                color="error"
                                size="24"
                                class="me-3"
                                icon="mdi-file-document-edit-outline"
                              />
                              Task
                            </VListItemTitle>
                          </VListItem>
                          <VDivider />
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
                <td>
                  <VProgressLinear
                    :model-value="parseInt(data.completion_percentage.percentage)"
                    color="success"
                    height="20"
                    rounded
                  >
                    <template #default>
                      <span
                        class="text-black"
                        style="font-weight: bold;"
                      >{{ data.completion_percentage.percentage }}%</span>
                    </template>
                  </VProgressLinear>
                </td>
                <td class="text-no-wrap">
                  <VChip
                    variant="none"
                  >
                    {{ prioritycolor(data.project_priority?.description).text }}
                    <VIcon 
                      :icon="prioritycolor(data.project_priority?.description).icon"
                      :color="prioritycolor(data.project_priority?.description).color"
                    />
                  </VChip>
                </td>

                <td>
                  {{ data.name || '' }}
                </td>
               
                <td style="white-space: nowrap;">
                  {{ data.description }}
                </td>

                <td style="white-space: nowrap;">
                  {{ data.person?.name || '' }}
                </td> 
                <td class="text-no-wrap">
                  {{ data.team?.name || '' }}
                </td> 
                <td class="text-no-wrap">
                  {{ data.project_department?.description || '' }}
                </td> 
                <td class="text-no-wrap">
                  {{ data.biu?.name || '' }}
                </td> 
                <td class="text-no-wrap">
                  {{ data.ticket?.document_number || '' }}
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
        :header-id="projectId"
        @saved="getSavedEditLine"
        @closed="getClosedDialog"
      />
      <!--
        <Start 
        v-if="isStart"
        :header-id="projectId"
        @saved="getStart" 
        @closed="getClosedDialog"
        /> 
      -->
    </VCol>
  </VRow>
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
    subject: Project
    redirectIfLoggedIn: false
</route>
