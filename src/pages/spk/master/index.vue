<script setup>
import axiosIns from "@/plugins/axios"
import ability from "@/plugins/casl/ability"
import Swal from "sweetalert2"
import { useItemStore } from './useItemStore'

const itemStore = useItemStore()
const items = ref(null)
const parentId = ref()
const totalItem = ref(0)
const last = ref(0)
const perPage = ref(10)
const currentPage = ref(1)
const findText = ref('')
const showLoading = ref(false)

const fetchMaster = async(page, perPage, find) => {
  try {
    showLoading.value = true

    const ret = await axiosIns.get(`production/item`, {
      params: {
        page: page,
        perPage: perPage,
        find: find,
        parent_id: 0,
      },
    })

    showLoading.value = false
    items.value = ret.data.data
    itemStore.item = ret.data.data
    totalItem.value = ret.data.meta.total 
    last.value = ret.data.meta.last
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      icon: 'error',
      text: 'Get data failed.',
    })
  }
}

// onMounted(() => {
//   fetchMaster(currentPage.value, perPage.value, itemStore.find)
// })

watchEffect(() => {
  fetchMaster(currentPage.value, perPage.value, itemStore.find)
})

const findSpk = async() => {
  currentPage.value = 1
  perPage.value = 10
  itemStore.find = findText.value
}

const paginationData = computed(() => {
  const firstIndex = currentPage.value == 1 ? 1 : perPage.value * currentPage.value + 1
  const lastIndex = currentPage.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItem.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard>
        <VCardTitle>Master Item</VCardTitle>
        <VCardText class="d-flex flex-wrap py-4 gap-2">
          <VTextField
            v-model="findText"
            placeholder="Search by Item Code .."
            @keydown.enter="findSpk"
          />
          <div class="d-flex flex-wrap gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findSpk"
            />
            <VBtn
              :to="{ name: 'spk-master-add' }"
              prepend-icon="tabler:plus"
            >
              Add New
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th
                scope="col"
                style="width: 20px;"
              />
              <th scope="col">
                Item Code
              </th>
              <th scope="col">
                Item Name
              </th>
              <th scope="col">
                Item Brand
              </th>
              <th scope="col">
                Item Description
              </th>
              <th scope="col">
                Item Instruction
              </th>
              <th scope="col">
                Item Size
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in items"
              :key="data.id"
            >
              <td class="d-flex justify-center">
                <VBtn
                  v-if="ability.can('Manage', 'SPK Master Item')"
                  :to="{ name: 'spk-master-id', params: {id: data.id} }"
                  icon
                  variant="none"
                  color="success"
                  density="compact"
                >
                  <div style="text-center">
                    <VIcon 
                      color="success"
                      size="21"
                      class="me-3"
                      icon="tabler-plus"
                    />
                  </div>
                </VBtn>
              </td>
              <td>
                <p>{{ data.item_code }}</p>
              </td>
              <td>
                <p>{{ data.item_name }}</p>
              </td>
              <td>
                <p>{{ data.item_brand }}</p>
              </td>
              <td>
                <p>{{ data.item_description }}</p>
              </td>
              <td>
                <p>{{ data.item_instruction }}</p>
              </td>
              <td>
                <p>{{ data.item_size }}</p>
              </td>
              <!--
                <td style="width: 7rem;">
                <div class="d-flex justify-start">
                <VBtn icon variant="text" color="default" size="x-small">
                <VIcon 
                :size="22"
                icon="tabler-dots-vertical"
                />
                <VMenu activator="parent">
                <VList>
                <VListItem :to="{ name: 'spk-master-id', params: {id: data.id} }">
                <template #prepend>
                <VIcon 
                color="success"
                size="24"
                class="me-3"
                icon="tabler:plus"
                />
                Add Item
                </template>
                </VListItem>
                </VList>
                </VMenu>
                </VBtn>
                </div>
                </td> 
              -->
            </tr>
          </tbody>
        </VTable>

        <VDivider />
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>
          <VPagination 
            v-model="currentPage"
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
    subject: SPK Master Item
    redirectIfLoggedIn: false
</route>
