<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useReceiveStore } from "./useReceiveStore"

const receiveStore = useReceiveStore()
const perPage = ref(10)
const page = ref(1)
const totalReceive = ref(0)
const last = ref(0)
const find = ref(receiveStore.find)
const findText = ref("")

const showLoading = ref(true)
const receives = ref("")

const fetchReceive = async(page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/ict/receive/', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    receives.value = ret.data.data
    totalReceive.value = ret.data.meta.total 
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
  fetchReceive(page.value, perPage.value, find.value)
})

const findItem = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = receiveStore.find
  fetchReceive(page.value, perPage.value, find.value)
}

const deleteData = async receiveId => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/ict/receive/${receiveId}` )

    fetchReceive(page.value, perPage.value, find.value)
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

const paginationData = computed(() => {
  const firstIndex = totalReceive.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalReceive.value ? totalReceive.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalReceive.value} entries`
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
            v-model="receiveStore.find"
            placeholder="Search item"
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
              :to="{ name: 'ict-receive-add' }"
              prepend-icon="tabler-plus"
            >
              Add Item
            </VBtn>
          </div>
        </VCardText>
        <VDivider />

        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  DOCUMENT NUMBER
                </th>
                <th scope="col">
                  DOCUMENT DATE
                </th>
                <th scope="col">
                  LOCATION
                </th>
                <th scope="col">
                  VENDOR
                </th>
                <th scope="col">
                  PHONE NUMBER
                </th>
                <th scope="col">
                  DESCRIPTION
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in receives"
                :key="data.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.document_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.document_date }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.location.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.vendor.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.po_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.description }}</p>
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
                          <VListItem :to="{ name: 'ict-receive-id', params: { id: data.id } }">
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
                          <VListItem>
                            <VListItemTitle @click="btnDeleteClickHandler(data.id)">
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

        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalReceive != 0"
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
