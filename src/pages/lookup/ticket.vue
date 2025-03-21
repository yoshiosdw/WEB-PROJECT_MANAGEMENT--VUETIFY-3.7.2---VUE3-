<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { defineProps } from 'vue'

// const props = defineProps({
//   ticket:{
//     type: String,
//     default: null,
//   },
// })

const emits = defineEmits(['ticket'])
const isVisible = ref(false)
const tickets = ref([])
const total = ref(0)
const perPage = ref(10)
const page = ref(1)
const last = ref(0)
const find = ref('')
const findText = ref('')

const loading = ref(false)

const sendData = val => {
  emits('ticket', val)
  isVisible.value = false
}

const fetchTicket = async (page, perPage, find) => {
  loading.value = true
  try {
    const ret = await axiosIns.get('/ticket/for/project', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
        status : 5, 
      },
    })

    loading.value = false
    tickets.value = ret.data.data
    total.value = ret.data.meta.total
    last.value = ret.data.meta.last
    
    // if (ret.data && ret.data.data && ret.data.data.length > 0) {
    //   const attachmentUrl = ret.data.data[0].attachment // Adjust this based on your API response structure
    //   const blob = await pdfCreate.createPdf({ content: [] }).getBlob()

    //   pdfUrl.value = URL.createObjectURL(blob)
    // } else {
    //   Swal.fire({
    //     title: 'Ticket',
    //     text: 'Attachment not found or empty data',
    //     icon: 'error',
    //   })
    // }
  } catch (error) {
    Swal.fire({
      title: 'ICT',
      text: error,
      icon: 'error',
    })
  }finally{
    loading.value = false
  }
}

const findData = async () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchTicket(page.value, perPage.value, find.value)
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

    <VCard title="Find ticket">
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
                placeholder="Search Person"
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
                Ticket Number
              </th>
              <th scope="col">
                Ticket Type
              </th>
              <th scope="col">
                Description
              </th>
              <th scope="col">
                Requestor
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="data in tickets"
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
              <td>{{ data.document_number }} </td>
              <td>{{ data.ticket_types?.name }}</td>
              <td>{{ data.description }} </td>
              <td>{{ data.user.person.name }} </td>
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
