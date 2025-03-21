<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"

const locations = ref()
const page = ref(1)
const perPage = ref(10)
const totalLocation = ref(0)
const lastLocation = ref(0)
const loading = ref(false)

const find = ref('')
const findText = ref('')
const selectedCategory = ref(null)

const fetchLocation = async(page, perPage, find, category) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/locations', {
     
      params:{
        page: page,
        perPage: perPage,
        find: find,
        category: category,
      },
    })

    locations.value = ret.data.data
    totalLocation.value = ret.data.meta.total
    lastLocation.value = ret.data.meta.last

    loading.value = false
  } catch(error) {
    Swal.fire({
      title: 'SJB',
      text: error,
      icon: 'error',
    })
  }
}

const locationCategories = [
  { id: 1, name: 'SITE' },
  { id: 2, name: 'BUILDING' },
  { id: 3, name: 'FLOOR' },
]

watchEffect(() => {
  fetchLocation(page.value, perPage.value, find.value, selectedCategory.value)
})

const deleteData = async id => {
  loading.value = true
  try {
    const ret = await axiosIns.delete(`/locations/${id}` )

    fetchLocation(page.value, perPage.value, find.value, selectedCategory.value)

  } catch (error) {
    Swal.fire({
      title: 'SJB',
      text: 'Delete data failed',
      icon: 'error',
    })
    console.log(error)
    loading.value = false
  } finally { loading.value = false }
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


const findLocation = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const paginationData = computed(() => {
  const firstIndex = totalLocation.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalLocation.value ? totalLocation.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalLocation.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay :loading="loading" />
      <div>
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 13rem;"
          >
            <VSelect 
              v-model="selectedCategory"
              :items="locationCategories"
              item-value="name"
              item-title="name"
              label="Select Category"
              clearable
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search Location"
            clearable
            @keydown.enter="findLocation"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findLocation"
            />
            <VBtn
              :to="{ name: 'location-add' }"
              prepend-icon="tabler-plus"
            >
              Add New
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
                  Code
                </th>
                <th scope="col">
                  Name
                </th> <th scope="col">
                  Description
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in locations"
                :key="data.id"
              >
                <td class="text-no-wrap">
                  <p>{{ data.code }}</p>
                </td>
                <td class="text-no-wrap">
                  <p>{{ data.name }}</p>
                </td>
                <td class="text-no-wrap">
                  <p>{{ data.keterangan }}</p>
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
                          <VListItem
                            value="duplicate"
                            :to="{ name: 'location-id', params: {id : data.id}}"
                          >
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
                          
                          <VListItem
                            value="duplicate"
                            @click="btnDeleteClickHandler(data.id)"
                          >
                            <template #prepend>
                              <VIcon
                                color="error"
                                size="24"
                                class="me-3"
                                icon="tabler-trash"
                              />
                            </template>
  
                            <VListItemTitle>Delete</VListItemTitle>
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
            :length="lastLocation"
          />
        </VCardText>
      </div>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: Person
    redirectIfLoggedIn: false
</route>
