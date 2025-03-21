<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import Swal from 'sweetalert2'

const rowPerPage = ref(10)
const currentPage = ref(1)
const totalPage = ref(1)
const totalTicketCategories = ref(0)
const ticketCategory = ref([])
const isDialogVisible = ref(false)
const searchQuery = ref('')

const fetchTicketCategory = async (page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/ticket/categories', {
      headers: {
        'Authorization': 'Bearer ' +localStorage.getItem('sinarjoAccessToken'),
      },
      params:{
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    ticketCategory.value = ret.data.data
    totalTicketCategories.value = ret.data.meta.total
    totalPage.value = ret.data.meta.last
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to load ticket categories',
      icon: 'error',
    })
  }
}

const deleteTicketCategory = async id => {
  try {
    const ret = await axiosIns.delete(`/ticket/categories/${id}` )

    fetchTicketCategory(currentPage.value, rowPerPage.value, searchQuery.value)
  } catch (error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Failed to delete data',
      icon: 'error',
    })
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: themeConfig.app.title,
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteTicketCategory(id)
    }
  })
}

watchEffect( () => {
  fetchTicketCategory(currentPage.value, rowPerPage.value, searchQuery.value)
})

watchEffect(() => {
  if (currentPage.value > totalPage.value)
    currentPage.value = totalPage.value
})

const paginationData = computed(() => {
  const firstIndex = totalTicketCategories.value ? (currentPage.value - 1) * rowPerPage.value + 1 : 0
  const lastIndex = Math.min(rowPerPage.value * currentPage.value, totalTicketCategories.value)
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTicketCategories.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="TICKET CATEGORY">
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px;">
            <VSelect
              v-model="rowPerPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <VTextField
            v-model="searchQuery"
            placeholder="Search"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              :to="{ name: 'ticket-category-add' }"
              prepend-icon="tabler-plus"
            >
              ADD CATEGORIES
            </VBtn>
          </div>
        </VCardText>
        <VDivider />
        <VTable
          v-if="ticketCategory"
          class="text-no-wrap "
        >
          <thead>
            <tr>
              <th
                scope="col"
                style="width: 85%;"
              >
                NAME
              </th>
              <th
                scope="col"
                style="width: 15%;"
              >
                ACTION
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="ticketCategories in ticketCategory"
              :key="ticketCategories.id"
              style="height: 3.75rem;"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="Text-Button">
                      {{ ticketCategories.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td style="width: 8rem;">
                <div class="d-flex justify-start">
                  <VBtn
                    icon
                    variant="text"
                    color="default"
                    size="x-small"
                  >
                    <VIcon
                      :size="22"
                      icon="tabler-dots-vertical"
                    />
                    <VMenu activator="parent">
                      <VList>
                        <VDivider />
                        <VListItem value="">
                          <template #prepend>
                            <VIcon
                              color="warning"
                              size="24"
                              class="me-3"
                              icon="tabler-pencil"
                            />
                          </template>
                          <VListItemTitle @click="$router.push({ name: 'ticket-category-id', params: { id: ticketCategories.id } })">
                            Edit
                          </VListItemTitle>
                        </VListItem>
                        <VListItem value="">
                          <template #prepend>
                            <VIcon
                              color="error"
                              size="24"
                              class="me-3"
                              icon="tabler-trash"
                            />
                          </template>
                          <VListItemTitle @click="btnDeleteClickHandler(ticketCategories.id)">
                            Delete
                          </VListItemTitle>
                        </VListItem>
                      </VList>
                    </VMenu>
                  </VBtn>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
        <VDivider />
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">{{ paginationData }} </span>
          <VPagination
            v-model="currentPage"
            size="small"
            :total-visible="5"
            :length="totalPage"
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

