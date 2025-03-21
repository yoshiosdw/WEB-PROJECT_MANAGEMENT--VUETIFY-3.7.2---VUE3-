<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useVendorStore } from './useVendorStore'
import VendorDialog from "./vendorDialog.vue"

const vendorStore = useVendorStore()
const perPage = ref(10)
const page = ref(1)
const totalVendor = ref(0)
const last = ref(0)
const find = ref(vendorStore.find)

const showLoading = ref(true)
const vendors = ref("")

const fetchVendor = async(page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/vendors', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    vendors.value = ret.data.data
    totalVendor.value = ret.data.meta.total
    last.value = ret.data.meta.last
    showLoading.value = false
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchVendor(page.value, perPage.value, find.value)
})

// const findVendor = async() => {
//   page.value = 1,
//   perPage.value = 10
//   find.value = vendorStore.find

//   // vendorStore.find = findText.value
//   fetchVendor(page.value, perPage.value)
// }

const deleteData = async vendorId => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/vendor/${vendorId}` )

    fetchVendor(page.value, perPage.value, find.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    showLoading.value = false
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

// const paginationData = computed(() => {
//   const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
//   const lastIndex = page.value * perPage.value

//   return `Showing ${firstIndex} to ${lastIndex} of ${totalVendor.value} entries`
// })

const findText = ref()

const search = () => {
  find.value = findText.value
}

const paginationData = computed(() => {
  const firstIndex = totalVendor.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalVendor.value ? totalVendor.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalVendor.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="findText"
            clearable
            placeholder="Search vendor"
            @keydown.enter="search"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @keydown.enter="search"
            />
            
            <VendorDialog @saved=" fetchVendor(page.value, perPage.value, find.value)" />
          </div>
        </VCardText>
        <VDivider />

        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  CODE
                </th>
                <th scope="col">
                  NAME
                </th>
                <th scope="col">
                  ADDRESS
                </th>
                <th scope="col">
                  CITY
                </th>
                <th scope="col">
                  PHONE NUMBER
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in vendors"
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
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.address }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.city }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.phone_number }}</p>
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
                        <VList width="15rem">
                          <VListItem :to="{ name: 'configuration-vendor-id', params: { id: data.id } }">
                            <VListItemTitle>
                              <VIcon
                                icon="tabler-edit" 
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
        </VCardText>

        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
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
    subject: Dashboard
    redirectIfLoggedIn: false
</route>
