<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const categories = ref([])
const totalCategories = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const loading = ref(true)

const fetchReturCategories = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/return/categories', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    categories.value = response.data.data
    totalCategories.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
    console.log(response)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Get Retur Type failed!',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const findCategory = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/return/category/${id}` )

    fetchReturCategories(page.value, perPage.value, find.value)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Error deleting data',
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

watchEffect(() => {
  fetchReturCategories(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalCategories.value}`
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
            v-model="findText"
            placeholder="Search Person"
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
            
            <VBtn
              v-if="true == false"
              :to="{ name: 'retur-category-add'}"
              prepend-icon="tabler-plus"
            >
              Add Category
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Name
                </th>
                <th scope="col">
                  Department In Charge
                </th>
                <th scope="col">
                  Permission
                </th>
                <th
                  v-if="true == false"
                  scope="col"
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="category in categories"
                :key="category.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ category.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ category.department_in_charge }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ category.permission }}</p>
                  </div>
                </td>

                <td
                  v-if="true == false"
                  style="width: 8rem;"
                >
                  <div
                    v-if="true == false"
                    class="d-flex gap-2"
                  >
                    <VBtn
                      v-if="true == false"
                      variant="none"
                      color="secondary"
                      size="24"
                      icon="tabler-pencil"
                      :to="{ name: 'retur-category-id', params:{ id: category.id}}"
                    />
                    <VBtn
                      v-if="true == false"
                      variant="none"
                      color="secondary"
                      size="24"
                      icon="tabler-trash"
                    />
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
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
