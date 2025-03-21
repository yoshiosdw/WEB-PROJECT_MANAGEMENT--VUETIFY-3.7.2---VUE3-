<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'

const isVisible = ref(false)
const salesTerritory = ref([])
const totalSalesTerritory = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(true)

const emits = defineEmits(['salesTerritory', 'salesTerritoryLoading'])

const sendData = val => {
  emits('salesTerritory', val)
  isVisible.value = false
}

const sendStatus = val => {
  emits('salesTerritoryLoading', val)
}

const fetchSalesTerritory = async (page, perPage, find) => {
  sendStatus(isLoading.value)
  try {
    const response = await axiosIns.get('/datawarehouse/sales/territories', {
      params: {
        page: page,
        perPage: perPage,
        find: find
      }
    })
    salesTerritory.value = response.data.data
    totalSalesTerritory.value = response.data.meta.total
    last.value = response.data.meta.last
    isLoading.value = false
    sendStatus(false)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load data',
      icon: 'error'
    })
    console.log(error);
    sendStatus(isLoading.value)
  }
}

const findSalesTerritory = async () => {
    page.value = 1
    perPage.value = 10
    find.value = findText.value
}

watchEffect(() => {
  fetchSalesTerritory(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  return `Showing ${firstIndex} to ${lastIndex} of ${totalSalesTerritory.value}`
})
</script>

<template>
  <VDialog v-model="isVisible" width="1024" transition="dialog-bottom-transition" persistent>
    <template #activator="{props}">
      <VBtn icon v-bind="props" :loading="isLoading" :disabled="isLoading" variant="none">
        <VIcon icon="tabler-search" />
      </VBtn>
      <!-- <VBtn v-bind="props" :loading="isLoading" :disabled="isLoading">Find</VBtn> -->
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible"/>

    <VCard title="Find Territory">
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
              <VTextField placeholder="Search Territory" v-model="findText" @keydown.enter="findSalesTerritory"/>
              
              <div class="d-flex justify-end gap-4">
                <VBtn icon="tabler-search" :size="40" variant="outlined" color="warning" @click="findSalesTerritory"/>
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in salesTerritory" :key="data.territory">
              <td>
                <div class="d-flex flex-column">
                  <p>{{ data.territory }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(data)"
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

        <VPagination v-model="page"
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
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
