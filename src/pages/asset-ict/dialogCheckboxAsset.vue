<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const props = defineProps({
  asset: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['asset', 'idSelectedData'])
const router = useRouter()
const isVisible = ref(false)
const assets = ref([])
const totalAssets = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(false)
const selectedData = ref()


const sendData = val => {
  emits('asset', val)
  isVisible.value = false
}

const fetchAsset = async (page, perPage, find) => {
  isLoading.value = true
  try {
    const response = await axiosIns.get('/assets/active', {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
     
    })

    assets.value = response.data.data
    totalAssets.value = response.data.meta.total
    last.value = response.data.meta.last
    isLoading.value = false

    // selectedData.value = assets.value.map(assets => assets.id)

  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: error,
      icon: 'error',
    })
    console.log(error)
    isLoading.value = false
  }
}

const postingData = async () => {
  const idSelectedData = selectedData.value

  emits('idSelectedData', idSelectedData)

  router.push({
    name: 'checkout-byAsset-id',
    query: { ids: idSelectedData.join(',') },
  })
}

const findAsset = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchAsset(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalAssets.value}`
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
        prepend-icon="tabler-upload"
      >
        Checkout
      </VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible" />
    <VCard
      title="Find Asset"
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
                placeholder="Search Asset Number"
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
              </div>

              <VBtn
                prepend-icon="tabler-upload"
                @click="postingData"
              >
                Checkout
              </VBtn>
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead
            class="text-uppercase"
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                Action
              </th>
              <th scope="col">
                Asset Number
              </th>
              <th scope="col">
                Item
              </th>
              <th scope="col">
                Description
              </th>
              <th scope="col">
                Location
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in assets"
              :key="data.id"
            >
              <!--
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
              -->

              <td>
                <VCheckbox
                  :id="data.id"
                  v-model="selectedData"
                  :value="data.id"
                />
              </td>

              <td>{{ data.asset_number }}</td>
              <td>{{ data.item && data.item.name ? data.item.name : '' }}</td>
              <td>{{ data.description }}</td>
              <td>{{ data.location && data.location.name ? data.location.name : '' }}</td>
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
  