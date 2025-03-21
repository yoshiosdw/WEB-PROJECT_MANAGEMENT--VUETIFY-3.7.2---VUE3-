<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Add from './add.vue'
import Edit from './edit.vue'

const route = useRoute()
const toast = useToast()
const perPage = ref(10)
const page = ref(1)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)

const type = ref()

const find = ref('')
const findText = ref('')
const showLoading = ref(false)


const fetchType = async (page, perPage, find) => {
  showLoading.value = true
  try {
    const ret = await axiosIns.get('/projectType', {
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    showLoading.value = false

    type.value = ret.data.data
    
    total.value = ret.data.meta.total
    last.value = ret.data.meta.last
    to.value = ret.data.meta.from
    from.value = ret.data.meta.to
  } catch (error) {
    console.log(error)
    toast.error('Failed Load Data')
  } finally {
    showLoading.value = false
  }
}

const deleteData = async id => {
  showLoading.value = true

  try {
    const ret = await axiosIns.delete(`/projectType/${id}` )

    fetchType(page.value, perPage.value, find.value),

    showLoading.value = false

  } catch(error) {
    Swal.fire({
      title: 'LBG',
      icon: 'error',
      text: error,
    })
  }
  finally{showLoading.value = false}
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const search = () => {
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() => {
  fetchType(page.value, perPage.value, find.value)
})

const getClosed = closed => {
  if(closed){

    fetchType(page.value, perPage.value, find.value)
  }
}

const paginationData = computed(()=>{
  const firstIndex = page.value == 1 ? 1 : perPage.value * page.value + 1
  const lastIndex = page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${total.value}`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <VCard :loading="showLoading">
        <VRow>
          <VCol cols="12">
            <VCardText class="d-flex gap-4">
              <div style="min-width: 80px;">
                <VSelect 
                  v-model="perPage"
                  :items="[10,20,30,50]"
                />
              </div>
              <VTextField 
                v-model="findText"
                label="Search"
                @keydown.enter="search"
              />
              <Add
                @closed="getClosed"
                @saved="fetchType(page.value, perPage.value, find.value)"
              />
            </VCardText>
          </VCol>
        </VRow>

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
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Code
                </th>
                <th
                  scope="col"
                  class="text-no-wrap"
                >
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in type"
                :key="index"
              >
                <td class="text-no-wrap">
                  <VBtn
                    icon
                    variant="none"
                    color="error"
                    title="Delete"
                    size="22"
                    @click="btnDeleteClickHandler(data.id)"
                  >
                    <VIcon
                      icon="tabler-trash"
                    />
                  </VBtn>
                  <VBtn
                    icon
                    variant="none"
                    color="info"
                    title="Delete"
                    size="22"
                  >
                    <Edit
                      :header-id="data.id"
                      @closed="getClosed"
                      @saved="fetchType(page.value, perPage.value, find.value)"
                    />
                  </VBtn>
                </td>
                <td style="white-space: nowrap;">
                  {{ data.code }}
                </td>

                <td style="white-space: nowrap;">
                  {{ data.description }}
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
