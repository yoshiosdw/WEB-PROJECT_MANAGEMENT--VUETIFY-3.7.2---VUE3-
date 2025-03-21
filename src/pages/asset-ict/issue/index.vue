<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import * as XLSX from 'xlsx'
import { useIssueStore } from "./useIssueStore"

const IssueStore = useIssueStore()
const perPage = ref(10)
const page = ref(1)
const totalIssue = ref(0)
const last = ref(0)
const find = ref(IssueStore.find)
const findText = ref("")

const loading = ref(true)

// const Issue = ref("")
const Issue = ref()

const fetchIssue= async(page, perPage, find) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      find: find,
    }


    const ret = await axiosIns.get('/issues', {
     params: params,
    })

    Issue.value = ret.data.data
    totalIssue.value = ret.data.meta.total 
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

watchEffect(() => {
  fetchIssue(page.value, perPage.value, find.value)
})

const findIssue = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = IssueStore.find
  fetchIssue(page.value, perPage.value, find.value)
}

const resolveStatusVariant = status_name => {
  if (status_name === 'Submitted') 
    return {
      text: 'Submitted',
      color: 'info',
    }
  else if (status_name === 'Posted')
    return {
      text: 'Posted',
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
    await fetchIssue(1, totalIssue.value, find.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [
      [
        'Document Number',
        'Status',
        'Document Date',
        'Item Name',
        'Quantity',
        'Location',
        'Description',
      ],
    ]

    // Filter data yang akan di-export berdasarkan filter yang aktif
    const filteredData = Issue.value.map(data => [
      data.document_number,
      data.status_name,
      data.document_date,
      data.line && data.line.length > 0 ? data.line[0].item.name : '-',
      data.line && data.line.length > 0 ? data.line[0].quantity : '-',
      data.location.name,
      data.description,
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

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Issue')
    XLSX.writeFile(workbook, 'Issue.xlsx')

    fetchIssue(page.value, perPage.value, find.value)
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
  const firstIndex = totalIssue.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalIssue.value ? totalIssue.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalIssue.value} entries`
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
            v-model="IssueStore.find"
            placeholder="Search asset"
            clearable
            @keydown.enter="findIssue"
          />
          <VBtn
            icon="tabler-search"
            :size="40"
            variant="outlined"
            color="warning"
            @click="findIssue"
          />
          <VBtn
            :to="{ name: 'asset-ict-issue-add' }"
            prepend-icon="tabler-plus"
          >
            Issue
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
                  Document Date
                </th>
                <th scope="col">
                  Item Name
                </th>
                <th scope="col">
                  Quantity
                </th>
                <th scope="col">
                  Location
                </th>
                <th scope="col">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in Issue"
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
                            :to="{ name: 'asset-ict-issue-edit-id', params: {id: data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-upload" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                                size="25"
                              />
                              Posting
                            </VListItemTitle>
                          </VListItem>

                          <VListItem
                            v-if="data.status === 1"
                            :to="{ name: 'asset-ict-issue-view-id', params: {id: data.id}}"
                          >
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-eye" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                                size="25"
                              />
                              View
                            </VListItemTitle>
                          </VListItem>


                          <!--
                            <VListItem
                            v-if="data.status === 1"
                            :to="{ name: 'Issue-view-id', params: {id:data.id}}"
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
                          -->
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
                      {{ data.document_date }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.line[0] && data.line[0] ? data.line[0].item.name : '-' }}
                    </p>
                  </div>
                </td>

                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.line[0] && data.line[0] ? data.line[0].quantity : '-' }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.location.name }}
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
            v-if="totalIssue != 0"
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
