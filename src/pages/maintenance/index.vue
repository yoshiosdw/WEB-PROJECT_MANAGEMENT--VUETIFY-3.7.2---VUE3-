<script setup>
import { formatDateTimeMySql } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import * as XLSX from 'xlsx'
import { useMaintenanceStore } from "./useMaintenanceStore"

const maintenanceStore = useMaintenanceStore()
const perPage = ref(10)
const page = ref(1)
const totalMaintenance = ref(0)
const last = ref(0)
const find = ref(maintenanceStore.find)
const findText = ref("")

const selectedStatus = ref()
const status = ref()

const selectedLocation = ref()
const locations = ref ()

const selectedOrganization = ref(null)
const organization = ref ()

const loading = ref(true)

// const Maintenance = ref("")
const Maintenance = ref()

const fetchMaintenance = async(page, perPage, find) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }


    const ret = await axiosIns.get('/maintenances', {
      params: params,
    })

    Maintenance.value = ret.data.data
    totalMaintenance.value = ret.data.meta.total 
    last.value = ret.data.meta.last
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const fetchLocation = async(page, perPage, find) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }

    const ret = await axiosIns.get('/locations', {
      params: params,
    })

    locations.value =  ret.data.data.filter(org => org.parent_id !== null)
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const fetchOrganization = async () => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/organizations/by/parent' )

    organization.value =  ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const statusOptions = [
  { text: 'Created', value: 0 },
  { text: 'Actived', value: 1 },
  { text: 'Deployed', value: 2 },
  { text: 'On Maintenance', value: 3 },
  { text: 'Received', value: 4 },
  { text: 'Disposed', value: 9 },
]

watchEffect(() => {
  // fetchLocation(),
  fetchOrganization(),
  fetchMaintenance(page.value, perPage.value, find.value)
})

const findAsset = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = maintenanceStore.find
  fetchMaintenance(page.value, perPage.value, find.value)
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/Maintenance/${id}` )

    fetchMaintenance(page.value, perPage.value, find.value)

    Swal.fire({
      title: 'LBG',
      text: 'Delete Success',
      icon: 'success',
    })
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
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
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const resolveStatusVariant = status_name => {
  if (status_name === 'On Process') 
    return {
      text: 'On Process',
      color: 'warning',
    }
  else if (status_name === 'Done')
    return {
      text: 'Done',
      color: 'success',
    }
  else 
    return {
      text: 'Uknow',
      color: 'error',
    }
}

const exportClickHandler = async () => {
  loading.value = true
  try {
    await fetchMaintenance(1, totalMaintenance.value, find.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Document Number',
        'Status',
        'Due Date',
        'Maintain By',
        'Description',
        'cost',
        'Complete Date',
      ],
    ]

    // Filter data yang akan di-export berdasarkan filter yang aktif
    const filteredData = Maintenance.value.map(data => [
      data.document_number,
      data.status_name,
      data.due_date,
      data.people ? data.people.name : '-',
      data.description,
      data.cost ? data.cost : '-',
      formatDateTimeMySql(data.complete_date),
    ])

    const worksheetData = [...headerData, ...filteredData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 13 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance')
    XLSX.writeFile(workbook, 'Maintenance.xlsx')

    fetchMaintenance(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: error,
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}


const paginationData = computed(() => {
  const firstIndex = totalMaintenance.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalMaintenance.value ? totalMaintenance.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalMaintenance.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
         
          <VTextField
            v-model="maintenanceStore.find"
            placeholder="Search asset"
            clearable
            @keydown.enter="findAsset"
          />
          <VBtn
            icon="tabler-search"
            :size="40"
            variant="outlined"
            color="warning"
            @click="findAsset"
          />
          <VBtn
            :to="{ name: 'maintenance-add' }"
            prepend-icon="tabler-plus"
          >
            Add New
          </VBtn>
          <VBtn
            prepend-icon="ri:file-excel-2-line"
            @click="exportClickHandler"
          >
            Export
          </VBtn>
          <!-- <DialogCheckboxAsset /> -->
        </VCardText>
        
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th scope="col">
                  Action
                </th>
                <th scope="col">
                  Document Number
                </th>
                <th scope="col">
                  Status
                </th>
                <th scope="col">
                  Due Date
                </th>
                <th scope="col">
                  Maintain By
                </th>
                <th scope="col">
                  Description
                </th>
                <th scope="col">
                  Cost
                </th>
                <th scope="col">
                  Complete Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in Maintenance"
                :key="data.id"
              >
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
                    <!--
                      <VBtn
                      v-if="data.status === 0"
                      icon
                      variant="none"
                      title="Post"
                      size="25"
                      :to="{ name: 'maintenance-edit-id', params: {id: data.id}}"
                      >
                      <VIcon
                      icon="tabler-edit" 
                      variant="primary" 
                      density="compact"
                      color="warning"
                      size="25"
                      />
                      </VBtn>
                    -->
                    <!--
                      <VBtn
                      v-if="data.status === 0"
                      icon
                      variant="none"
                      size="25"
                      title="Done"
                      :to="{ name: 'maintenance-id', params: {id: data.id}}"
                      >
                      <VIcon
                      icon="tabler-rosette-discount-check" 
                      variant="primary" 
                      density="compact"
                      color="success"
                      size="25"
                      />
                      </VBtn>
                    -->

                    <!--
                      <VBtn
                      v-if="data.status === 1"
                      icon
                      variant="none"
                      size="30"
                      title="View"
                      >
                      <VIcon
                      icon="tabler-eye" 
                      variant="primary" 
                      density="compact"
                      color="default"
                      size="25"
                      />
                      </VBtn>
                    -->

                    
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
                            v-if="data.status === 0"
                            :to="{ name: 'maintenance-id', params: {id: data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-rosette-discount-check" 
                                variant="primary" 
                                density="compact"
                                color="success"
                                size="25"
                              />
                              Done Maintenance
                            </VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status === 0"
                            :to="{ name: 'maintenance-edit-id', params: {id: data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-edit" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                                size="25"
                              />
                              Edit
                            </VListItemTitle>
                          </VListItem>


                          <VListItem
                            v-if="data.status === 1"
                            :to="{ name: 'maintenance-view-id', params: {id:data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-eye" 
                                variant="primary" 
                                density="compact"
                                color="default"
                                size="25"
                              />
                              View
                            </VListItemTitle>
                          </VListItem>
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
                <td class="mt-5">
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.document_number }}
                    </p>
                  </div>
                </td>
                <td>
                  <VChip
                    :color="resolveStatusVariant(data.status_name).color"
                    size="small"
                  >
                    {{ resolveStatusVariant(data.status_name).text }}
                  </VChip>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.due_date }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.people ? data.people.name : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.description }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.cost ? data.cost : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ formatDateTimeMySql(data.complete_date) }}
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>

        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalMaintenance != 0"
            class="text-sm text-disabled"
          >
            {{ paginationData }}
          </span>
          <span
            v-else
            class="text-sm text-disabled"
          >No Data Found!</span>
          <VPagination
            v-model="page"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
