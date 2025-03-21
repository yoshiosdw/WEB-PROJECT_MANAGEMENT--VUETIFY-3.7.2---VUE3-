<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useUomStore } from './useUomStore'

const uomStore = useUomStore()
const perPage = ref(10)
const page = ref(1)
const totalUom = ref(0)
const last = ref(0)
const find = ref(uomStore.find)
const findText = ref("")

const showLoading = ref(true)
const uoms = ref("")

const fetchUom = async(page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/uoms', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    uoms.value = ret.data.data
    totalUom.value = ret.data.meta.total 
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
  fetchUom(page.value, perPage.value, find.value)
})

const findItem = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = uomStore.find
  fetchUom(page.value, perPage.value, find.value)
}

const deleteData = async uomId => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/uoms/${uomId}` )

    fetchUom(page.value, perPage.value, find.value)
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
  const firstIndex = totalUom.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalUom.value ? totalUom.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalUom.value} entries`
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
            v-model="uomStore.find"
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
              :to="{ name: 'ict-uom-add' }"
              prepend-icon="tabler-plus"
            >
              Add Item
            </VBtn>
          </div>
        </VCardText>

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
              v-for="data in uoms"
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
                      <VList width="8rem">
                        <VListItem :to="{ name: 'ict-uom-id', params: { id: data.id } }">
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

        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalUom != 0"
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
