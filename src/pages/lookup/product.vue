<script setup>
import axiosIns from "@/plugins/axios";
import Swal from "sweetalert2";

const soItem = ref()
const isVisible = ref(false)
const isLoading = ref(true)
const totalItem = ref(0)
const last =  ref(0)
const page = ref(1)
const perPage = ref(10)
const find = ref('')
const findText = ref('')

const props = defineProps({
  sales: {
    type: String,
    required: true
  }
})

const emits = defineEmits(['product'])

const sendData = val => {
  emits('product', val)
  isVisible.value = false
}

const fetchProduct = async (page, perPage, find) => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get(`/datawarehouse/product`, {
      params: {
        page: page,
        perPage: perPage,
        find: find
      }
    })

    soItem.value = ret.data.data
    totalItem.value = ret.data.meta.total 
    last.value = ret.data.meta.last  
    isLoading.value = false
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Get Item Failed!',
      icon: 'error',
    })
    console.log(error)
    isLoading.value = false
  }
}

watchEffect(() => {
  fetchProduct(page.value, perPage.value, find.value)
})

const findItem = async() => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  return `Showing ${firstIndex} to ${lastIndex} of ${totalItem.value}`
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
      <VBtn v-bind="props">Find</VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible"/>
    
    <VCard title="Find Product">
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
              <VTextField placeholder="Search Item" v-model="findText" @keydown.enter="findItem"/>
              
              <div class="d-flex justify-end gap-4">
                <VBtn icon="tabler-search" :size="40" variant="outlined" color="warning" @click="findItem"/>
              </div>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
              <th scope="col">Item Code</th>
              <th scope="col">Name</th>
              <th scope="col">Family Product</th>
              <th scope="col">Size</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in soItem" :key="product.itemId">
              <td class="text-no-wrap">
                <div class="d-flex flex-column">
                  <p>{{ product.ItemNumber }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p >{{ product.ProductName }}</p>
                </div>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <p >{{ product.ProductCategory }}</p>
                </div>
              </td>
              <td class="text-no-wrap">
                <div class="d-flex flex-column">
                  <p >{{ product.Size }}</p>
                </div>
              </td>
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(product)"
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
