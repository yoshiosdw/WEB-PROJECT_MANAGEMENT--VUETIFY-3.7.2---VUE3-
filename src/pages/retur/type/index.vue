<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const returType = ref([])
const totalReturType = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const loading = ref(true)

const fetchReturType = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/return/type/', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    returType.value = response.data.data
    totalReturType.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
    console.log(response)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Data Retur Type',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const findReturType = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/return/return/type/delete/${id}` )

    fetchReturType(page.value, perPage.value, find.value)
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
  fetchReturType(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalReturType.value}`
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
            placeholder="Search Type"
            @keydown.enter="findReturType"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findReturType"
            />
            
            <VBtn prepend-icon="tabler-plus">
              Add Record
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="type in returType"
                :key="type.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ type.name }}</p>
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
                        <VList>
                          <VListItem value="duplicate">
                            <template #prepend>
                              <VIcon
                                color="warning"
                                size="24"
                                class="me-3"
                                icon="tabler-pencil"
                              />
                            </template>
  
                            <VListItemTitle>Edit</VListItemTitle>
                          </VListItem>
                          
                          <VListItem value="duplicate">
                            <template #prepend>
                              <VIcon
                                color="error"
                                size="24"
                                class="me-3"
                                icon="tabler-trash"
                              />
                            </template>
  
                            <VListItemTitle @click="btnDeleteClickHandler(type.id)">
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
  subject: Person
  redirectIfLoggedIn: false
</route>
