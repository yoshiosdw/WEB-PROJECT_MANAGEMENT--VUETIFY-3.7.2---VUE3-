<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"

const types = ref()
const showLoading = ref(false)
const page = ref(1)
const perPage = ref(10)
const totalTypes = ref(0)
const lastTypes = ref(0)
const find = ref()
const findText = ref()

const fetchTypes = async(page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/item/types', {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    showLoading.value = false
    types.value = ret.data.data
    totalTypes.value = ret.data.meta.total 
    lastTypes.value = ret.data.meta.last
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
  }showLoading.value = false
}

watchEffect(() => {
  fetchTypes(page.value, perPage.value, find.value)
})


const deleteData = async id => {
  try {
    const ret = await axiosIns.delete(`/item/types/${id}` )

    fetchTypes(totalTypes.value, perPage.value, find.value)
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      icon: 'error',
      text: 'Delete data failed',
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

const paginationData = computed(() => {
  const firstIndex = totalTypes.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalTypes.value ? totalTypes.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTypes.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard :loading="showLoading">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VSpacer />
          <div class="d-flex justify-end gap-4">
            <VBtn
              :to="{ name: 'configuration-types-add' }"
              prepend-icon="tabler-plus"
            >
              Add New
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
                Name
              </th>
              <th scope="col">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in types"
              :key="data.id"
            >
              <td>{{ data.name }}</td>
              <td style="width: 18rem;">
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
            :length="lastTypes"
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
