<script setup>
import { formatDateMySql, formatRibuan } from '@/@core/utils/formatters'
import axiosIns from '@/plugins/axios'
import ability from '@/plugins/casl/ability'
import Swal from 'sweetalert2'
import { useRoute } from 'vue-router'
import CaseDialog from './caseDialog.vue'
import OutStanding from './dashboard/outstanding/outStanding.vue'
import { useJobOrder } from './useJobOrderStore'

const jobOrderStore = useJobOrder()
const route = useRoute()
const outstandings = computed(()=> route.query.outstanding)
const sat = ref([])
const allSat = ref()
const totalSat = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const selectedPic = ref()
const selectedPicData = ref()
const selectedStatus = ref()
const satExc = ref()

const loading = ref(true)

const fetchJoborder = async (page, perPage, find, status, pic, task) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,        
      pic: pic,
      next_task: task,
    }

    if (status !== null) {
      params.status = status
    }
    
    // if (pic !== null) {
    //   pic = selectedPic.value;
    // }
    // if (pic !== null) {
    //   params.pic = pic;
    // }
    const response = await axiosIns.get('/job/orders', {
     
      params: params,
    })

    sat.value = response.data.data
    jobOrderStore.orders = response.data.data
    jobOrderStore.from = response.data.meta.from
    jobOrderStore.to = response.data.meta.to
    jobOrderStore.total = response.data.meta.total
    jobOrderStore.last = response.data.meta.last
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const fetchAllJobOrder = async() => {
  try{
    const ret = await axiosIns.get('/job/orders' )

    allSat.value = ret.data.data
  } catch(error) {
    console.log(error)
  }
}

watchEffect(() => {
  // fetchAllJobOrder(),
  fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)

  // fetchJoborder(page.value, perPage.value, find.value, selectedStatus.value, selectedPic.value)
})


const findSat = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
  jobOrderStore.find = find.value

  // jobOrderStore.pic = selectedPic.value
  jobOrderStore.pic = route.query.pic
  jobOrderStore.task = route.query.task
}

const statusOptions = [
  { text: 'Open', value: 0 },
  { text: 'On Process', value: 1 },
  { text: 'Revised', value: 2 },
  { text: 'Canceled', value: 3 },
  { text: 'Reject', value: 4 },
  { text: 'Revoked', value: 5 },
  { text: 'Closed', value: 9 },
]

const picOptions = [
  { text: 'BOA' },
  { text: 'RND' },
  { text: 'PPIC' },
]

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/job/orders/${id}` )

    fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Delete data failed',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
  }
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

const revisedData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.patch(`/job/orders/revised/${id}`, {} )

    fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: 'Revised data failed.',
      icon: 'error',
    })
    console.log(error)
  }
}

const btnRevisedClickHandler = id => {
  Swal.fire({
    title: 'SAT',
    text: 'Sure revised data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, revised!',
  }).then(ret => {
    if(ret.isConfirmed) {
      revisedData(id)
    }
  })
}

const cancelData = async id => {
  try {
    const ret = await axiosIns.patch(`/job/orders/cancel/${id}`, null )

    fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: 'Cancel data failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const btnCancelClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure cancel data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, canceled!',
  }).then(ret => {
    if(ret.isConfirmed) {
      cancelData(id)
    }
  })
}

const resolveStatusVariant = status => {
  if (status === 0) 
    return {
      text: 'Open',
      color: 'warning',
    }
  else if (status === 1)
    return {
      text: 'On Progress',
      color: 'info',
    }
  else if (status === 2)
    return {
      text: 'Revised',
      color: 'warning',
    }
  else if (status === 3)
    return {
      text: 'Canceled',
      color: 'secondary',
    }
  else if (status === 4)
    return {
      text: 'Reject',
      color: 'info',
    }
  else if (status === 5)
    return {
      text: 'Revoked',
      color: 'error',
    }
  else 
    return {
      text: 'Closed',
      color: 'success',
    }
}

const reloadSatData = () => {
  fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)
}

const handleCaseUpdated = isUpdated => {
  if (isUpdated) {
    reloadSatData()
  }
}

const downloadFile = async id => {
  loading.value = true
  try {
    const response = await axiosIns.get(`/job/order/download/${id}`, {
      responseType: 'blob',
      
    })

    loading.value = false
    saveAs(response.data, 'Job_Order')
  } catch(error) {
    Swal.fire({
      title: 'SAT',
      text: 'Download file failed',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const truncateText = text => {
  return `${text.substring(0, 6)}...`
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}

// const paginationData = computed(() => {
//   const firstIndex = totalSat.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
//   const lastIndex = page.value * perPage.value >= totalSat.value ? totalSat.value : page.value * perPage.value
  
//   return `Showing ${firstIndex} to ${lastIndex} of ${totalSat.value} entries`
// })

const paginationData = computed(() => {
  console.log('page', jobOrderStore.to)
  return `Showing ${jobOrderStore.from} to ${jobOrderStore.to} of ${jobOrderStore.total}`;
});

const exportClickHandler = async () => {
  loading.value = true
  try {
    // Mengambil file dari server
    const response = await axiosIns.get('job/order/export', {
      
      responseType: 'blob', // Mendapatkan respons sebagai blob
    })

    // Membuat Blob dari data respons
    const blob = new Blob([response.data], { type: 'application/pdf' })

    // Membuat URL untuk Blob
    const url = window.URL.createObjectURL(blob)

    // Membuat elemen <a> untuk mengunduh file
    const a = document.createElement('a')

    a.href = url
    a.download = 'job_orders.xlsx' // Nama file yang diunduh

    // Menambahkan elemen <a> ke DOM dan memicunya
    document.body.appendChild(a)
    a.click()

    // Menghapus elemen <a> dan URL setelah unduhan selesai
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url) // Bersihkan URL setelah selesai
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const revokedData = async id => {
  try {
    const ret = await axiosIns.patch(`job/orders/revoked/data/${id}`)

    fetchJoborder(jobOrderStore.page, jobOrderStore.perPage, find.value, selectedStatus.value, jobOrderStore.pic, jobOrderStore.task)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Revoke data failed',
      icon: 'error',
    })
    console.log(error)
  }
}

const btnRevokeClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure revoke data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, revoked!',
  }).then(ret => {
    if (ret.isConfirmed) {
      revokedData(id)      
    }
  })
}

const hasRevoked = tasks => {
  return tasks.some(task => task.task_sequence >= 4 && task.status === 1)
}

const handleOutStanding = val => {
  const task = val

  jobOrderStore.task= task
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <OutStanding @outstanding="handleOutStanding"/>
    </VCol>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <!-- {{ selectedPic }} -->
          <div style="min-width: 80px;">
            <VSelect 
              v-model="jobOrderStore.perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 20rem;"
          >
            <VSelect 
              v-model="selectedStatus"
              label="Status"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
            />
            <VSelect 
              v-model="jobOrderStore.pic"
              label="PIC"
              :items="picOptions"
              item-title="text"
              item-value="text"
              clearable
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search.."
            @keydown.enter="findSat"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findSat"
            />
            <!-- <VBtn icon="tabler:refresh" :size="40" variant="none" color="warning" @click="refresButton" /> -->
            
            <VBtn
              v-if="ability.can('Manage', 'SAT')"
              prepend-icon="tabler-plus"
              :to="{ name: 'sat-add' }"
            >
              Add Record
            </VBtn>
            <VBtn
              prepend-icon="ri:file-excel-2-line"
              @click="exportClickHandler"
            >
              Export
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef;"
            >
              <tr>
                <th scpe="col">
                  Action
                </th>
                <th scpe="col">
                  Doc. Number
                </th>
                <th scpe="col">
                  Next Task
                </th>
                <th scpe="col">
                  Status
                </th>
                <th scpe="col">
                  Aging
                </th>
                <!-- <th scpe="col">%</th> -->
                <th scpe="col">
                  Bill Number
                </th>
                <th scpe="col">
                  Received Date
                </th>
                <th scpe="col">
                  Customer
                </th>
                <th scpe="col">
                  Order Type
                </th>
                <th scpe="col">
                  Family Product
                </th>
                <th scpe="col">
                  Qty (Kg)
                </th>
                <th scpe="col">
                  Request Ship Date
                </th>
                <th scpe="col">
                  Delivery Date
                </th>
                <th
                  v-if="ability.can('Download', 'BOA SAT Task')"
                  scpe="col"
                >
                  Attachment
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in sat"
                :key="data.id"
              >
                <td style="width: 8rem;text-align: center;">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-dots-vertical"
                    />
                    <VMenu activator="parent">
                      <VList>
                        <VListItem
                          value="user"
                          :to="{name: 'sat-task-task', params: {task: data.id}}"
                        >
                          <template #prepend>
                            <VIcon
                              color="warning" 
                              size="24"
                              class="me-3"
                              icon="tabler:browser-check"
                            />
                          </template>
                          <VListItemTitle>Task</VListItemTitle>
                        </VListItem>
                        <VListItem
                          v-if="data.status_name === 'Revised'"
                          :to="{name: 'sat-history-id', params: {id: data.document_number}}"
                        >
                          <template #prepend>
                            <VIcon 
                              icon="tabler-history"
                              color="warning"
                              class="me-3"
                            />
                            <VListItemTitle>History</VListItemTitle>
                          </template>
                        </VListItem>
                        <!--
                          <VListItem value="user" @click="downloadFile(data.id)" v-if="ability.can('Download', 'BOA SAT Task')">
                          <template #prepend>
                          <VIcon color="secondary" 
                          size="24"
                          class="me-3"
                          icon="tabler-download"
                          />
                          </template>
                          <VListItemTitle>Download</VListItemTitle>
                          </VListItem> 
                        -->
                        <VListItem
                          v-if="ability.can('Closed', 'BOA SAT Task') && data.status_name === 'On Progress'"
                          value="user"
                          v
                        >
                          <CaseDialog
                            :data="data"
                            @case-updated="handleCaseUpdated"
                          />
                        </VListItem>
                        <VListItem
                          v-if="ability.can('Revised', 'BOA SAT Task') && data.status_name === 'On Progress'"
                          value="user"
                          @click="btnRevisedClickHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="info" 
                              icon="tabler-file-off"
                              size="24"
                              class="me-3"
                            />
                            Revised
                          </template>
                        </VListItem>
                        <VListItem
                          v-if="data.status_name === 'On Progress' && ability.can('Cancel', 'BOA SAT Task')"
                          value="user"
                          @click="btnCancelClickHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="error" 
                              icon="tabler-circle-half-vertical"
                              size="24"
                              class="me-3"
                            />
                            Cancel
                          </template>
                        </VListItem>
                        <VListItem
                          v-if="data.status_name === 'On Progress' && ability.can('Revoked', 'PPIC SAT Task') && hasRevoked(data.sat_job_order_task)"
                          value="user"
                          @click="btnRevokeClickHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon
                              color="error" 
                              icon="tabler-copy-x"
                              size="24"
                              class="me-3"
                            />
                            Revoked
                          </template>
                        </VListItem>
                        <!-- <VDivider /> -->
                        <VListItem
                          v-if="data.status_name === 'Open' && ability.can('Manage', 'SAT')"
                          value="duplicate"
                          @click="btnDeleteClickHandler(data.id)"
                        >
                          <template #prepend>
                            <VIcon 
                              color="error"
                              class="me-3"
                              size="24"
                              icon="tabler-trash"
                            />
                          </template>
                          <VListItemTitle>Delete</VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </td>
                <td>
                  <div class="text-no-wrap d-flex flex-column">
                    <RouterLink
                      v-if="data.status_name === 'Open'"
                      :to="{
                        name: 'sat-id',
                        params: { id: data.id },
                      }"
                    >
                      <VText
                        class="font-weight-semibold"
                        style="color: #65b741;"
                      >
                        {{ data.document_number }}
                      </VText> 
                    </RouterLink>
                    <VText
                      v-if="data.status_name !== 'Open' && data.status_name !== 'Revised'"
                      class="font-weight-semibold"
                    >
                      {{ data.document_number }}
                    </VText>
                    <VText
                      v-if="data.status_name === 'Revised'"
                      class="font-weight-semibold"
                      style="color: #c51605;"
                    >
                      {{ data.document_number }}
                    </VText>
                    <span>{{ data.rev_number }}</span>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap d-flex flex-column">
                    <VText class="font-weight-semibold">
                      {{ data.task_name[0].department_in_charge }}
                    </VText>
                    <span>{{ data.task_name[0].task_name }}</span>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap d-flex flex-column">
                    <VChip
                      :color="resolveStatusVariant(data.status).color"
                      size="small"
                    >
                      {{ resolveStatusVariant(data.status).text }}
                    </VChip>
                    <span>{{ data.completion_percentage[0].percentage }} %</span>
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px;text-align: end;"
                  >
                    <p>{{ data.aging }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap d-flex flex-column">
                    <VText class="font-weight-semibold">
                      {{ data.bill_number }}
                    </VText>
                    <span>{{ formatDateMySql(data.bill_date) }}</span>
                  </div>
                </td>
                <td>
                  <div
                    class="text-no-wrap"
                    style="margin-top: 15px;"
                  >
                    <p>{{ formatDateMySql(data.received_date) }}</p>
                  </div>
                </td>
                <td>
                  <div class="text-no-wrap d-flex flex-column">
                    <VText class="font-weight-semibold">
                      {{ data.customer_code }}
                    </VText>
                    <span>{{ data.customer_name }}</span>
                  </div>
                </td>
                <td>
                  <p style="margin-top: 15px;">
                    {{ data.status_order_name }}
                  </p>
                </td>
                <td>
                  <p style="margin-top: 15px;">
                    {{ data.family_product }}
                  </p>
                </td>
                <td>
                  <p style="margin-top: 15px;text-align: end;">
                    {{ formatRibuan(data.qty) }}
                  </p>
                </td>
                <td>
                  <p style="margin-top: 15px;">
                    {{ formatDateMySql(data.request_ship_date) }}
                  </p>
                </td>
                <td>
                  <p style="margin-top: 15px;">
                    {{ formatDateMySql(data.delivery_date) }}
                  </p>
                </td>
                <td
                  v-if="ability.can('Download', 'BOA SAT Task')"
                  style="word-wrap: break-word;"
                  class="text-wrap"
                >
                  <div
                    class="d-flex flex-column text-wrap"
                    @click="downloadFile(data.id)"
                  >
                    <VChip 
                      v-if="data.attachment !== null"
                      :color="resolveAttachVariant(data.attachment).color"
                      size="small"
                    >
                      {{ truncateText(data.attachment) }}
                    </VChip>
                    <template v-else>
                      {{ data.attachment }}
                    </template>
                  </div>
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
            v-model="jobOrderStore.page"
            size="small"
            :total-visible="5"
            :length="jobOrderStore.last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: SAT
  redirectIfLoggedIn: false
</route>
