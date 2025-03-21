<script setup>
import { ref, watchEffect } from "vue"
import Swal from "sweetalert2"
import axiosIns from "@/plugins/axios"

const perPage = ref(10)
const status = ref(0)
const reservationRoom = ref([])
const status_name = ref()

const statuses = ref([
  {
    id: 0,
    name: "Created",
  },
  {
    id: 1,
    name: "Sent",
  },
  {
    id: 9,
    name: "Reject",
  },
])

const find = ref()
const findText = ref()
const loading = ref(false)

const findTextHanlder = () => {
  find.value = findText.value
}

const fetchReservationRoom= async () => {
  loading.value = true
  try{
    const res = await axiosIns.get("/qcc/meeting/room/reservations" )

    reservationRoom.value = res.data.data
    loading.value = false
  }catch (error) {
    Swal.fire({
      title: "Can't Load Data",
      text: error.message,
      icon: "error",
    })
  }
}

const resolveStatusVariant = status_name => {
  if (status_name === 'Created') 
    return {
      text: 'Created',
      color: 'gray',
    }
  else if (status_name === 'Sent')
    return {
      text: 'Sent',
      color: 'info',
    }
  else 
    return {
      text: 'Rejected',
      color: 'error',
    }
}


watchEffect (()=>{
  fetchReservationRoom()
})

const sentBtnHandler = async id =>{
  Swal.fire({
    title: 'Reservation',
    text: 'Send data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes !',
  }).then(ret => {
    if(ret.isConfirmed){
      sentData(id)
    }
  })
}

const sentData = async id =>{
  loading.value = true
  try{
    const res = await axiosIns.post(`/qcc/meeting/room/reservations/sent/${id}`, null )

    fetchReservationRoom()
    loading.value = false
  }catch (error) {
    Swal.fire({
      title: "Submit data failed !",
      text: error.message,
      icon: "error",
    })
  }
}

const DeleteBtnHandler = async id =>{
  Swal.fire({
    title: 'Reservation',
    text: 'Delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    cancelButtonColor: 'primary',
    confirmButtonText: 'Yes, delete it!',
  }).then(ret => {
    if(ret.isConfirmed){
      deleteData(id)
    }
  })
}

// const deleteData = async id =>{
//   loading.value = true
//   try{
//     const res = await axiosIns.delete(`/qcc/meeting/room/reservations/${id}`, {
      
//   }
// }
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
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
              :to="{ name: 'qcc-meeting-reservation-add' }"
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
                <th>No</th>
                <th>Meeting Room</th>
                <th>Tanggal Pemesanan</th>
                <th>QCC</th>
                <th>Pemesan</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(data, index) in reservationRoom"
                :key="index"
              >
                <td>{{ index + 1 }}</td>
                <td>{{ data.room.name }}</td>
                <td>{{ data.transaction_date }}</td>
                <td>{{ data.qcc.name }}</td>
                <td>{{ data.employee[0].person.name }}</td>
                <td>
                  <div
                    class="text-no-wrap"
                  >
                    <VChip
                      :color="resolveStatusVariant(data.status_name).color"
                      size="small"
                    >
                      {{ resolveStatusVariant(data.status_name).text }}
                    </VChip>         
                  </div>               
                </td>
                <td style="width: 8rem;">
                  <div class="d-flex justify-start">
                    <VBtn
                      icon
                      variant="text"
                      color="default"
                      size="x-small"
                      :disabled="data.status !== 0"
                      @click="DeleteBtnHandler(data.id)"
                    >
                      <VIcon
                        :size="22"
                        icon="tabler-trash"
                      />
                    </VBtn>
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
                          <VListItem
                            :disabled="data.status !==0"
                            @click="sentBtnHandler(data.id)"
                          >
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                           
                                icon="tabler-check"
                              />
                            </template>
                            <VListItemTitle>Sent</VListItemTitle>
                          </VListItem> 
                          <VListItem
                            value="user"
                            :to="null"
                          >
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler:address-book-off"
                              />
                            </template>
                            <VListItemTitle>Reject</VListItemTitle>
                          </VListItem> 
                          <VListItem
                            value="user"
                            :to="null"
                          >
                            <template #prepend>
                              <VIcon
                                color="primary"
                                size="24"
                                class="me-3"
                                icon="tabler-pencil"
                              />
                            </template>
                            <VListItemTitle>Edit</VListItemTitle>
                          </VListItem> 
                        </VList>
                      </VMenu>
                    </VBtn>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
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
