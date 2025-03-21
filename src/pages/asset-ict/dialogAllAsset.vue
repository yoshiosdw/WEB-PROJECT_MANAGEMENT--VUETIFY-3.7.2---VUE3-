<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'

const props = defineProps({
  asset: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['asset'])
const isVisible = ref(false)
const assets = ref([])
const totalAssets = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(false)

const sendData = val => {
  emits('asset', val)
  isVisible.value = false
}

const fetchAsset = async (page, perPage, find) => {
  isLoading.value = true
  try {
    const response = await axiosIns.get('/assets', {
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

const findAsset = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchAsset(page.value, perPage.value, find.value)
})

const resolveStatusVariant = status_name => {
  if (status_name === 'Created') 
    return {
      text: 'Created',
      color: 'secondary',
    }
  else if (status_name === 'Actived')
    return {
      text: 'Actived',
      color: 'info',
    }
  else if (status_name === 'Deployed')
    return {
      text: 'Deployed',
      color: 'success',
    }
  else if (status_name === 'On Maintenance')
    return {
      text: 'On Maintenance',
      color: 'warning',
    }
  else if (status_name === 'Received')
    return {
      text: 'Received',
      color: 'error',
    }
  else if (status_name === 'Disposed')
    return {
      text: 'Disposed',
      color: 'error',
    }
  else 
    return {
      text: 'Uknow',
      color: 'error',
    }
}

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
      <VBtn v-bind="props">
        Find
      </VBtn>
    </template>

    <DialogCloseBtn @click="isVisible = !isVisible" />
    <VCard
      title="Find Asset Active"
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
            </div>     
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
        <VTable>
          <thead class="text-uppercase">
            <tr>
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
              <th scope="col">
                Status
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in assets"
              :key="data.id"
            >
              <td>{{ data.asset_number }}</td>
              <td>{{ data.item && data.item.name ? data.item.name : '' }}</td>
              <td>{{ data.description }}</td>
              <td>{{ data.location && data.location.name ? data.location.name : '' }}</td>
              <td>
                <VChip
                  :color="resolveStatusVariant(data.status_name).color"
                  size="small"
                >
                  {{ resolveStatusVariant(data.status_name).text }}
                </VChip>
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
  