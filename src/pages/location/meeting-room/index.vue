<script setup>
import { ref, watchEffect } from "vue"
import Swal from "sweetalert2"
import axiosIns from "@/plugins/axios"

const perPage = ref(10)
const page = ref(1)
const lastRoom = ref(0)
const totalRoom = ref(0)
const status = ref(0)

const statuses = ref([
  {
    id: 1,
    name: "Aktive",
  },
  {
    id: 0,
    name: "Non Aktive",
  },
])

const find = ref()
const findText = ref()
const room = ref([])
const loading = ref(false)

const findTextHanlder = () => {
  find.value = findText.value
  page.value= 1
  perPage.value = 10

}

const paginationData = computed(() => {
  const firstIndex =
    totalRoom.value == 0 ? 0 : (page.value - 1) * perPage.value + 1

  const lastIndex =
    page.value * perPage.value >= totalRoom.value
      ? totalRoom.value
      : page.value * perPage.value

  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalRoom.value} entries`
})

const fetchRoom = async (page, perPage, find) => {
  loading.value = false
  try {
    const res = await axiosIns.get("/qcc/meeting/rooms", {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    room.value = res.data.data
    totalRoom.value = res.data.meta.total
    lastRoom.value = res.data.meta.last
    loading.value = false
  } catch (error) {
    Swal.fire({
      title: "Can't Load Room",
      text: error.message,
      icon: "error",
    })
  } finally {
    loading.value = false
  }
}

watchEffect(() => {
  fetchRoom(page.value, perPage.value, find.value)
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText class="d-flex gap-4">
          <div style="min-width: 80px">
            <VSelect
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <div
            class="d-flex gap-2"
            style="width: 15rem"
          >
            <VSelect
              v-model="status"
              label="Status"
              :items="statuses"
              item-title="name"
              item-value="id"
              clearable
            />
          </div>
          <VTextField
            v-model="findText"
            placeholder="Search.."
            @keydown.enter="findTextHanlder"
          />
          <div class="d-flex justify-end gap-4">
            <VBtn
              icon="tabler-search"
              :size="40"
              variant="none"
              color="warning"
              @click="findTextHanlder"
            />
            <VBtn
              prepend-icon="tabler-plus"
              :to="{ name: 'location-meeting-room-add' }"
            >
              Add Record
            </VBtn>
          </div>
        </VCardText>
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Lokasi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in room"
                :key="index"
              >
                <td>
                  {{ data.name }}
                </td>
                <td>
                  {{ data.name }}
                </td>
                <td>
                  {{ data.location.keterangan }}
                </td>
              </tr>
            </tbody>
          </VTable>
          <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
            <span class="text-sm text-disabled">
              {{ paginationData }}
            </span>

            <VPagination 
              v-model="page"
              size="small"
              :total-visible="5"
              :length="lastRoom"
            />
          </VCardText>
        </VCardText>    
      </VCard>
    </VCol>
  </VRow>
</template>

<route lang="yaml">
meta:
  action: Read
  subject: Person
  redirectIfLoggedIn: false
</route>
