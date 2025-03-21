<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import * as XLSX from 'xlsx'
import { useItemStore } from './useItemStore'

const itemStore = useItemStore()
const perPage = ref(10)
const page = ref(1)
const totalItem = ref(0)
const last = ref(0)
const find = ref(itemStore.find)
const findText = ref("")

const selectedCategory = ref ()
const category = ref ()

const selectedType = ref ()
const type = ref ()

const loading = ref(false)
const items = ref("")

const fetchItem = async(page, perPage, find, selectedCategory, selectedType) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/items', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
        category: selectedCategory,
        item_type: selectedType,
      },
    })

    items.value = ret.data.data
    totalItem.value = ret.data.meta.total 
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

const fetchCategory = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/item/categories', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    category.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const fetchType = async(page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/item/types', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    type.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchCategory(),
  fetchType(),
  fetchItem(page.value, perPage.value, find.value, selectedCategory.value, selectedType.value)
})

const findItem = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = itemStore.find
  fetchItem(page.value, perPage.value, find.value, selectedCategory.value, selectedType.value)
}

const deleteData = async itemId => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/items/${itemId}` )

    fetchItem(page.value, perPage.value, find.value, selectedCategory.value, selectedType.value)
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

const exportClickHandler = async() => {
  loading.value = true
  try{
    await fetchItem(page.value, perPage.value, find.value, selectedCategory.value, selectedType.value)

    const workbook = XLSX.utils.book_new()

    const headerData = [[
      'Code',
      'Name',
      'description',
      'type',
      'categories',
    ]]

    const data = items.value.map((data, index) => [
      data.code,
      data.name,
      data.description,
      data.item_type.name,
      data.item_category.name,
    ])

    const worksheetData = [...headerData, ...data]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    const columnWidth = [
      { wch: 8 },
      { wch: 13 },
      { wch: 15 },
      { wch: 13 },
      { wch: 8 },
     
    ]

    worksheet['!cols'] = columnWidth

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Item')
    XLSX.writeFile(workbook, 'Item.xlsx')
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  } finally{loading.value = false}
}

const paginationData = computed(() => {
  const firstIndex = totalItem.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalItem.value ? totalItem.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItem.value} entries`
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
            style="width: 14rem;"
          >
            <VSelect 
              v-model="selectedType"
              label="Select Type"
              :items="type" 
              item-text="name" 
              item-title="name"
              clearable
              :menu-props="{ maxHeight: '250px' }"
            />
          </div>

          <div
            class="d-flex gap-2"
            style="width: 14rem;"
          >
            <VSelect 
              v-model="selectedCategory"
              label="Select Category"
              :items="category" 
              item-text="name" 
              item-title="name"
              clearable
              :menu-props="{ maxHeight: '250px' }"
            />
          </div>
        
          <VTextField
            v-model="itemStore.find"
            placeholder="Search item"
            clearable
            @keydown.enter="findItem"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findItem"
            />
            
            <VBtn
              :to="{ name: 'item-add' }"
              prepend-icon="tabler-plus"
            >
              Add Item
            </VBtn>
            <VBtn
              prepend-icon="ri:file-excel-2-line"
              @click="exportClickHandler"
            >
              Export
            </VBtn>
          </div>
        </VCardText>
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
                <th scope="col">
                  CODE
                </th>
                <th scope="col">
                  NAME
                </th>
                <th scope="col">
                  DESCRIPTION
                </th>
                <th scope="col">
                  TYPE
                </th>
                <th scope="col">
                  CATEGORIES
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in items"
                :key="data.id"
              >
                <td>
                  <div class="d-flex">
                    <VBtn
                      icon
                      variant="none"
                      color="default"
                      size="x-small"
                    >
                      <VIcon 
                        :size="22"
                        icon="tabler-dots-vertical"
                      />
  
                      <VMenu activator="parent">
                        <VList>
                          <!--
                            <VListItem>
                            <VListItemTitle>
                            <VIcon
                            icon="tabler-clipboard-check" 
                            variant="primary" 
                            density="compact"
                            color="success"
                            />
                            Create to Asset
                            </VListItemTitle>
                            </VListItem>
                          -->
                          <!--
                            <VListItem>
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
                          -->
                          <VListItem :to="{ name: 'item-id', params: { id: data.id } }">
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-pencil" 
                                variant="primary" 
                                density="compact"
                                color="warning"
                              />
                              Edit
                            </VListItemTitle>
                          </VListItem>
                          <!-- <VDivider /> -->
                          <VListItem @click="btnDeleteClickHandler(data.id)">
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
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.code }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.name }}
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
                      {{ data.item_type.name }}
                    </p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p class="mt-5">
                      {{ data.item_category.name }}
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
            v-if="totalItem != 0"
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
    subject: Person
    redirectIfLoggedIn: false
</route>
