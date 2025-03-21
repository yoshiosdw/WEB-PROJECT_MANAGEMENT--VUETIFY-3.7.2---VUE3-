<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { computed } from "vue"
import AddDialog from "./addDialog.vue"
import { useCategoryStore } from './useCategoryStore'

const categoryStore = useCategoryStore()
const page = ref(1)
const perPage = ref(10)
const totalCategory = ref(0)
const find = ref(categoryStore.find)
const findText = ref("")

const categories = ref()
const loading = ref(false)

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

    categories.value = ret.data.data
    totalCategory.value = ret.data.meta.total 
    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchCategory(page.value, perPage.value, find.value)
})

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/item/categories/${id}` )

    fetchCategory(page.value, perPage.value, find.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
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

const findCategory = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = categoryStore.find
  fetchCategory(page.value, perPage.value, find.value)
}

const paginationData = computed(() => {
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value

  return `Showing ${firstIndex} to ${lastIndex} of ${totalCategory.value} entries`
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
            v-model="categoryStore.find"
            placeholder="Search category"
            @keydown.enter="findCategory"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findCategory"
            />
            
            <AddDialog @saved="fetchCategory(page.value, perPage.value, find.value)" />
          </div>
        </VCardText>
        <VDivider />

        <VTable>
          <thead
            class="text-uppercase"
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                CODE
              </th>
              <th scope="col">
                NAME
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in categories"
              :key="data.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.code }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.name }}</p>
                </div>
              </td>
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
                      <VList width="10rem">
                        <VListItem :to="{ name: 'configuration-categories-id', params: { id: data.id } }">
                          <VListItemTitle>
                            <VIcon
                              icon="tabler-pencil" 
                              variant="primary" 
                              density="compact"
                              color="success"
                            />
                            Edit
                          </VListItemTitle>
                        </VListItem>
                        <VDivider />
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
            </tr>
          </tbody>
        </VTable>

        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm">
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
    subject: Person
    redirectIfLoggedIn: false
</route>
