<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import * as XLSX from 'xlsx'
import Edit from "./edit.vue"
import { useAssetsStore } from "./useAssetsStore"

const assetsStore = useAssetsStore()
const perPage = ref(10)
const page = ref(1)
const totalAssets = ref(0)
const last = ref(0)
const find = ref(assetsStore.find)
const findText = ref("")

const selectedStatus = ref()
const status = ref()

const selectedLocation = ref()
const locations = ref ()

const selectedOrganization = ref(null)
const organization = ref ()

const loading = ref(true)
const assets = ref("")

const fetchAssets = async(page, perPage, find, selectedOrganization, status) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
      organization: selectedOrganization,
    }

    if (status !== null) {
      params.status = status
    }

    const ret = await axiosIns.get('/assets', {
      params: params,
    })

    assets.value = ret.data.data
    totalAssets.value = ret.data.meta.total 
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
  fetchAssets(page.value, perPage.value, find.value, selectedOrganization.value, selectedStatus.value)
})

const findAsset = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = assetsStore.find
  fetchAssets(page.value, perPage.value, find.value, selectedOrganization.value, selectedStatus.value)
}

const Activate = async id => {
  loading.value = true
  try {

    const ret = await axiosIns.post(`/assets/post/${id}`, null )

    fetchAssets(page.value, perPage.value, find.value, selectedOrganization.value, selectedStatus.value)
    
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }finally{loading.value = false}
}

const btnActivatedHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure Actived this Asset?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, Actived it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      Activate(id)
    }
  })
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/ict/assets/${id}` )

    fetchAssets(page.value, perPage.value, find.value, selectedOrganization.value, selectedStatus.value)

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
  if (status_name === 'Created') 
    return {
      text: 'Created',
      color: 'secondary',
    }
  else if (status_name === 'Actived')
    return {
      text: 'Actived',
      color: 'info',
    }
  else if (status_name === 'Deployed')
    return {
      text: 'Deployed',
      color: 'success',
    }
  else if (status_name === 'On Maintenance')
    return {
      text: 'On Maintenance',
      color: 'warning',
    }
  else if (status_name === 'Received')
    return {
      text: 'Received',
      color: 'error',
    }
  else if (status_name === 'Disposed')
    return {
      text: 'Disposed',
      color: 'error',
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
    // Memastikan data yang diambil sudah sesuai dengan filter yang aktif
    await fetchAssets(page.value, totalAssets.value, find.value, selectedOrganization.value, selectedStatus.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Asset Number',
        'Status',
        'Serial Number',
        'Item',
        'Brand',
        'Organization',
        'Location',
        'Condition',
        'Description',
      ],
    ]

    // Filter data yang akan di-export berdasarkan filter yang aktif
    const filteredData = assets.value.map(data => [
      data.asset_number,
      data.status_name,
      data.serial_number,
      data.item ? data.item.name : '',
      data.brand ? data.brand : '-',
      data.organization ? data.organization.code : '-',
      data.location ? data.location.name : '-',
      data.item_condition,
      data.description,
    ])

    const worksheetData = [...headerData, ...filteredData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets')
    XLSX.writeFile(workbook, 'Assets.xlsx')
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
  const firstIndex = totalAssets.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalAssets.value ? totalAssets.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalAssets.value} entries`
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
          <div
            class="d-flex gap-2"
            style="width: 12rem;"
          >
            <VSelect
              v-model="selectedStatus"
              label="Status" 
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 12rem;"
          >
            <VSelect 
              v-model="selectedOrganization"
              label="Organization"
              :items="organization"
              item-title="code"
              item-text="name"
              :menu-props="{ maxHeight: '300px'}"
              clearable
            />
          </div>
          <VTextField
            v-model="assetsStore.find"
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
            :to="{ name: 'receive-add' }"
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
                  Asset Number
                </th>
                <th scope="col">
                  Status
                </th>
                <th scope="col">
                  Serial Number
                </th>
                <th scope="col">
                  Item
                </th>
                <th scope="col">
                  Brand
                </th>
                <th scope="col">
                  Organization
                </th>
                <th scope="col">
                  Location
                </th>
                <th scope="col">
                  Condition
                </th>
                <th scope="col">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in assets"
                :key="data.id"
              >
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
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
                            @click="() => btnActivatedHandler(data.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-check" 
                                variant="primary" 
                                density="compact"
                                color="success"
                              />
                              Activate
                            </VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status !== 0 && data.status !== 9 && data.status !== 2"
                            :to="{ name: 'checkout-byAsset-id', params: { id: data.id } }"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-arrow-bar-to-right" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                              />
                              Check Out
                            </VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status === 1"
                            :to="{ name: 'asset-ict-dispose-id', params: { id: data.id } }"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-transition-bottom" 
                                variant="primary" 
                                density="compact"
                                color="error"
                              />
                              Dispose
                            </VListItemTitle>
                          </VListItem>
                         
                          <VListItem :to="{ name: 'asset-ict-specification-id', params: { id: data.id } }">
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-clipboard-text" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                              />
                              Specification
                            </VListItemTitle>
                          </VListItem>
                          <VListItem
                            v-if="data.status === 0"
                            @click="showEditDialog(data.id)"
                          >
                            <Edit :asset-id="data.id" />
                          </VListItem>
                          <!--
                            <VListItem>
                            <VListItemTitle>
                            <VIcon
                            icon="tabler-eye" 
                            variant="primary" 
                            density="compact"
                            color="warning"
                            />
                            License
                            </VListItemTitle>
                            </VListItem>
                          -->
                          <VDivider />
                          <VListItem
                            v-if="data.status === 0"
                            @click="btnDeleteClickHandler(data.id)"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-trash" 
                                variant="primary" 
                                density="compact"
                                color="error"
                              />
                              Delete
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
                      {{ data.asset_number }}
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
                      {{ data.serial_number }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.item ? data.item.name : '' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.brand ? data.brand : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column text-center">
                    <p class="mt-5">
                      {{ data.organization ? data.organization.code : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.location ? data.location.name : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.item_condition }}
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
              </tr>
            </tbody>
          </VTable>
        </VCardText>

        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalAssets != 0"
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
