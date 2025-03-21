<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { defineProps } from 'vue'

const props = defineProps({
  ticket:{
    type: String,
    default: null,
  },
})

const emits = defineEmits(['qcc'])
const isVisible = ref(false)
const qcc = ref([])
const total = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const sendData = val => {
  emits('qcc', val)
  isVisible.value = false
}

const fetchQcc = async (page, perPage, find) => {
  try {
   
    const response = await axiosIns.get(`/qcc/qccs`, {
     
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    qcc.value = response.data.data
    total.value = response.data.meta.total
    last.value = response.data.meta.last

    
  } catch (error) {
    Swal.fire({
      title: 'LBG',
      text: 'Failed to load Qcc',
      icon: 'error',
    })
    console.log(error)
  }
}

const findData = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchQcc(page.value, perPage.value, find.value)
})

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${total.value}`
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

    <VCard title="Find Qcc">
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
                placeholder="Search Qcc"
                @keydown.enter="findData"
              />
              
              <div class="d-flex justify-end gap-4">
                <VBtn
                  icon="tabler-search"
                  :size="40"
                  variant="outlined"
                  color="warning"
                  @click="findData"
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
                Action
              </th>
              <th scope="col">
                Theme
              </th>
              <th scope="col">
                Work Area
              </th>
              <th scope="col">
                Circle
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in qcc"
              :key="data.id"
            >
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
              <td>
                <div>
                  {{ data.theme }}
                </div>
              </td>
              <td>
                <div>
                  {{ data.work_area }}
                </div>
              </td>
              <td>
                <div>
                  {{ data.circle?.name }}
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
  </VDialog>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Dashboard
  redirectIfLoggedIn: false
</route>
