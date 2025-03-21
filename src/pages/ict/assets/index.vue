<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useAssetsStore } from "./useAssetsStore"

const assetsStore = useAssetsStore()
const perPage = ref(10)
const page = ref(1)
const totalAssets = ref(0)
const last = ref(0)
const find = ref(assetsStore.find)
const findText = ref("")

const showLoading = ref(true)
const assets = ref("")

const fetchAssets = async() => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/ict/assets', {
     
      // params: {
      //   page: page,
      //   perPage: perPage,
      //   find: find
      // }
    })

    assets.value = ret.data.data
    totalAssets.value = ret.data.meta.total 
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
  fetchAssets(page.value, perPage.value, find.value)
})

const findAsset = async() => {
  page.value = 1,
  perPage.value = 10
  find.value = assetsStore.find
  fetchAssets(page.value, perPage.value, find.value)
}

const deleteData = async id => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/ict/assets/${id}` )

    fetchAssets()
    Swal.fire({
      title: 'LBG',
      text: 'Delete Success',
      icon: 'success',
    })
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
  const firstIndex = totalAssets.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalAssets.value ? totalAssets.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalAssets.value} entries`
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
            v-model="assetsStore.find"
            placeholder="Search item"
            @keydown.enter="findAsset"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findAsset"
            />
            <VBtn
              :to="{ name: 'ict-assets-add' }"
              prepend-icon="tabler-plus"
            >
              Add Assets
            </VBtn>
          </div>
        </VCardText>
        <VDivider />

        <VCardText>
          <VTable>
            <thead class="text-uppercase">
              <tr>
                <th scope="col">
                  Asset Number
                </th>
                <th scope="col">
                  Serial Number
                </th>
                <th scope="col">
                  Item
                </th>
                <th scope="col">
                  Condition
                </th>
                <th scope="col">
                  Description
                </th>
                <th scope="col">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in assets"
                :key="data.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.asset_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.serial_number }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.item.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ data.item_condition }}</p>
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
                          <VListItem :to="{ name: 'ict-assets-id', params: { id: data.id } }">
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
            v-if="totalAssets != 0"
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
