<script setup>
import axiosIns from '@/plugins/axios';
import Swal from 'sweetalert2';

const isVisible = ref(false)
const customers = ref([])
const totalCustomers = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(true)

const emits = defineEmits(['customer', 'customerLoading'])

const sendData = val => {
  emits('customer', val)
  isVisible.value = false
}

const sendStatus = val => {
  emits('customerLoading', val)
}

const fetchCustomers = async (page, perPage, find) => {
  sendStatus(isLoading.value)
  try {
    const response = await axiosIns.get('/datawarehouse/sales/customers', {
      params: {
        page: page,
        perPage: perPage,
        find: find
      }
    })
    customers.value = response.data.data
    totalCustomers.value = response.data.meta.total
    last.value = response.data.meta.last
    isLoading.value = false
    sendStatus(false)
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Customers',
      icon: 'error'
    })
    console.log(error);
    sendStatus(isLoading.value)
  }
}

const findCustomer = async () => {
    page.value = 1
    perPage.value = 10
    find.value = findText.value
}

watchEffect(() => {
  fetchCustomers(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  return `Showing ${firstIndex} to ${lastIndex} of ${totalCustomers.value}`
})
</script>

<template>
  <VDialog v-model="isVisible" width="1024" transition="dialog-bottom-transition" persistent>
    <template #activator="{props}">
      <VBtn v-bind="props" :loading="isLoading" :disabled="isLoading">Find</VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible"/>

    <VCard title="Find Customer">
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
              <VTextField placeholder="Search Customer" v-model="findText" @keydown.enter="findCustomer"/>
              
              <div class="d-flex justify-end gap-4">
                <VBtn icon="tabler-search" :size="40" variant="outlined" color="warning" @click="findCustomer"/>
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Customer Account</th>
              <th scope="col">Name</th>
              <th scope="col">Area</th>
              <th scope="col">Theritory</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.CustAccount">
              <td>
                <div class="d-flex flex-column">
                  <p>{{ customer.CustAccount }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p >{{ customer.CustName }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ customer.Area }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p>{{ customer.Territory }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(customer)"
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
  subject: Person
  redirectIfLoggedIn: false
</route>
