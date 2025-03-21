<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { useCheckinStore } from './useCheckinStore'

const checkinStore = useCheckinStore()
const checkin = ref()
const perPage = ref(10)
const find = ref()
const page = ref(1)
const totalCheckin = ref(0)
const last = ref(0)
const loading = ref(false)

const fetchCheckin = async(page, perPage, find) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }

    const ret = await axiosIns.get('/checkins', {
      params: params,
    })

    loading.value = false
    checkin.value = ret.data.data
    totalCheckin.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    console.log(error)
    loading.value = false
  }
}

watchEffect(() => {
  fetchCheckin(page.value, perPage.value, find.value)
})

const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`/checkin/${id}` )

    fetchCheckin(page.value, perPage.value)
  } catch(error) {
    console.log(error)
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed){
      deleteData(id)
    }
  })
}

const findText = ref()

const search = () => {
  find.value = findText.value
}

const exportClickHandler = async () => {
  loading.value = true
  try {
    // Memastikan data yang diambil sudah sesuai dengan filter yang aktif
    await fetchCheckin(1, totalCheckin.value, find.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Document Number',
        'Checkin Date',
        'Checkin From',
        'Refrence',
        'Note',
      ],
    ]

    // Filter data yang akan di-export berdasarkan filter yang aktif
    const filteredData = checkin.value.map(data => {
      let reference = '-'

      if (data.checkin_from === 'Employee') {
        reference = data.employee && data.employee.person ? data.employee.person.name : '-'
      } else if (data.checkin_from === 'Location') {
        reference = data.location ? data.location.name : '-'
      } else if (data.checkin_from === 'Item') {
        reference = data.checkin_from ? data.checkin_from : '-'
      }

      return[
        data.document_number,
        data.checkin_date,
        data.checkin_from,
        reference,
        data.note,
      ]
    })

    const worksheetData = [...headerData, ...filteredData]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Checkin')
    XLSX.writeFile(workbook, 'Checkin.xlsx')

    fetchCheckin(page.value, perPage.value, find.value)

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

const resolveStatusVariant = status_name => {
  if (status_name === 'Non Active') 
    return {
      text: 'Non Active',
      color: 'error',
    }
  else if (status_name === 'Posted')
    return {
      text: 'Posted',
      color: 'success',
    }
  else 
    return {
      text: 'Uknown',
      color: 'error',
    }
}

const paginationData = computed(() => {
  const firstIndex = totalCheckin.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalCheckin.value ? totalCheckin.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalCheckin.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField 
            v-model="findText"
            label="Search By Document Number"
            clearable
            @keydown.enter="search"
          />
          <VBtn
            prepend-icon="tabler-plus"
            :to="{name: 'checkin-add'}"
          >
            Add New
          </VBtn>
          <VBtn
            prepend-icon="ri:file-excel-2-line"
            @click="exportClickHandler"
          >
            Export
          </VBtn>
        </VCardText>
        <VCardText>
          <VTable>
            <thead>
              <tr
                class="text-uppercase"
                style="background-color: #efefef;"
              >
                <th>Action</th>
                <th class="text-no-wrap">
                  Document Number
                </th>
                <th>Status</th>
                <th>Checkin Date</th>
                <th>Checkin From </th>
                <th>Reference</th>
                <th>Item Name</th>
                <th>Brand</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in checkin"
                :key="data.id"
              >
                <td style="width: 8 rem;">
                  <div class="d-flex justify-center mt-2 gap-2">
                    <VBtn
                      v-if="data.status === 0"
                      icons
                      variant="none"
                      title="Post"
                      size="25"
                      :to="{ name:'checkin-posting-id', params: {id: data.id} }"
                    >
                      <VIcon
                        icon="tabler-upload"
                        color="success"
                        size="25"
                      />
                    </VBtn>
                    <VBtn
                      v-if="data.status === 1"
                      icons
                      variant="none"
                      title="View"
                      size="25"
                      :to="{ name:'checkin-view-id', params: {id: data.id} }"
                    >
                      <VIcon
                        icon="tabler-eye"
                        color="error"
                        size="25"
                      />
                    </VBtn>
                    <VBtn
                      icon
                      variant="none"
                      size="22"
                      title="Delete"
                      @click="btnDeleteClickHandler(data.id)"
                    >
                      <VIcon
                        icon="tabler-trash"
                        color="secondary"
                        size="25"
                      />
                    </VBtn>
                  </div>
                </td>
                <td>{{ data.document_number }}</td>
                <td>
                  <VChip
                    :color="resolveStatusVariant(data.status_name).color"
                    size="small"
                  >
                    {{ resolveStatusVariant(data.status_name).text }}
                  </VChip>
                </td>
                <td>{{ data.checkin_date }}</td>
                <td>{{ data.checkin_from }}</td>
                <td>
                  <template v-if="data.checkin_from === 'Employee'">
                    {{ data.employee && data.employee.person ? data.employee.person.name : '-' }}
                  </template>
                  <template v-if="data.checkin_from === 'Location'">
                    {{ data.location ? data.location.name : '-' }}
                  </template>
                  <template v-if="data.checkin_from === 'Item'">
                    {{ data.item.name }}
                  </template>
                </td>
                <td>{{ data.line[0] && data.line[0].asset[0] ? data.line[0].asset[0].item.name: '-' }}</td>
                <td>{{ data.line[0] && data.line[0].asset[0] ? data.line[0].asset[0].brand: '-' }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            class="text-sm text-disabled"
          >
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
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Ticket
    redirectIfLoggedIn: false
</route>
