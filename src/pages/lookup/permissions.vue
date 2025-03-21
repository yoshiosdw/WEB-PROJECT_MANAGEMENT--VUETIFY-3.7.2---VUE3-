<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'

const emits = defineEmits(['permission'])
const isVisible = ref(false)
const permissions = ref()
const totalPermissions = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')
const isLoading = ref(true)

const sendData = val => {
  emits('permission', val)
  isVisible.value = false
}

const fetchPermission = async (page, perPage, find) => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/permissions', {
     
      params: {
        page: page,
        perPage: perPage, 
        find: find,
      },
    })

    permissions.value = ret.data.data
    isLoading.value = false
  } catch (error) {
    isLoading.value = false
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Load permission data failed!',
      icon: 'error',
    })
    
    console.log(error)
  }
}

const findPermission = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchPermission(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalPermissions.value}`
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

    <VCard title="Permissions List">
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
                placeholder="Search Customer"
                @keydown.enter="findPermission"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findPermission"
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
                Name
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="permission in permissions"
              :key="permission.id"
            >
              <td>
                <div class="d-flex flex-column">
                  <p>{{ permission.name }}</p>
                </div>
              </td>
              
              <td>
                <VBtn
                  variant="none"
                  color="default"
                  icon
                  size="small"
                  @click="sendData(permission)"
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
