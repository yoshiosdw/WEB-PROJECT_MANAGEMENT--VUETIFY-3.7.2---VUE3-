<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const emits = defineEmits(['item', 'itemLoading'])
const isVisible = ref(false)
const items = ref([])
const totalItems = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(true)

const sendData = val => {
  emits('item', val)
  isVisible.value = false
}

const sendStatus = val => {
  emits('itemLoading', val)
}

const fetchItems = async (page, perPage, find) => {
  isLoading.value = true
  sendStatus(true)
  try {
    const response = await axiosIns.get('/items/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    items.value = response.data.data
    totalItems.value = response.data.meta.total
    last.value = response.data.meta.last
    isLoading.value = false
    sendStatus(false)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Item',
      icon: 'error',
    })
    isLoading.value = false
    console.log(error)
    sendStatus(isLoading.value)
  }
}

const findItem = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchItems(page.value, perPage.value, find.value)
  
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItems.value}`
})
</script>

<template>
  <VDialog
    v-model="isVisible"
    width="1024"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{props}">
      <VBtn
        v-bind="props"
        :loading="isLoading"
        :disabled="isLoading"
      >
        Find
      </VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible" />

    <VCard
      title="Find Item"
      :loading="isLoading"
    >
      <VCardText>
        <VRow>
          <VCol cols="12">
            <div class="d-flex gap-3">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10, 20, 30, 50]"
                />
              </div>
              <VTextField
                v-model="findText"
                placeholder="Search Item"
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
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VOverlay v-model="isLoading" />
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Code
              </th>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Category
              </th>
              <th scope="col">
                Description
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in items"
              :key="item.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.code }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.name }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.item_category.name }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ item.description }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(item)"
                >
                  <VIcon
                    size="24"
                    icon="tabler-check"
                  />
                </VBtn>
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
  </VDialog>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
