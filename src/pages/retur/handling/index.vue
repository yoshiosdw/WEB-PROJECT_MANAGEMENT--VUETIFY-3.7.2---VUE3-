<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'

const handlings = ref()
const totalHandlings = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const loading = ref(true)

const fetchReturnHandlings = async (page, perPage, find) => {
  loading.value = true
  try {
    const response = await axiosIns.get('/return/handlings', {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    handlings.value = response.data.data
    totalHandlings.value = response.data.meta.total
    last.value = response.data.meta.last
    loading.value = false
    console.log(response)
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Get Retur Handling failed!',
      icon: 'error',
    })
    loading.value = false
    console.log(error)
  }
}

const findHandling = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}


watchEffect(() => {
  fetchReturnHandlings(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalHandlings.value}`
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
            placeholder="Search Handling"
            @keydown.enter="findHandling"
          />
          
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="outlined"
              color="warning"
              @click="findHandling"
            />
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
                  Department In Charge
                </th>
                <th scope="col">
                  Task Sequence
                </th>
                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="handling in handlings"
                :key="handling.id"
              >
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ handling.name }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ handling.department_in_charge }}</p>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <p>{{ handling.sequence }}</p>
                  </div>
                </td>

                <td style="width: 8rem;">
                  <div class="d-flex gap-2">
                    <VBtn
                      variant="none"
                      color="secondary"
                      size="24"
                      icon="tabler-pencil"
                      :to="{ name: 'retur-handling-id', params: { id:handling.id}}"
                    />
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
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
