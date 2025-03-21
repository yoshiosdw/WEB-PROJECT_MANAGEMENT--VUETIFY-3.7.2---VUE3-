<script setup>
import axiosIns from '@/plugins/axios'
import Swal from 'sweetalert2'
import { defineEmits, onMounted, ref } from 'vue'

const emit = defineEmits(['statusClicked'])
const Created = ref()
const Submitted = ref()
const Approved = ref()
const Started = ref()
const Ended = ref()
const Rejected = ref()
const isLoading = ref(false)
const data = ref()

const fetchCount = async () => {
  try {
    const ret = await axiosIns.get(`/tickets/count/statusGA` )

    data.value = ret.data.data

    // Created.value = ret.data.data.created
    // Submitted.value = ret.data.data.submitted
    // Started.value = ret.data.data.started
    // Ended.value = ret.data.data.ended
    // Approved.value = ret.data.data.approve
    // Rejected.value = ret.data.data.rejected

    isLoading.value = true
  }
  catch(error){
    Swal.fire({
      title: 'TICKET',
      text: error,
      icon: 'error',
    })
  }isLoading.value = false
}


onMounted(() => {
  fetchCount()
})

const clickedStatus = ref(null)
const isTotalTicketClicked = ref(false)

const handleStatusClick = status => {
  // Set semua status background ke false
  isTotalTicketClicked.value = false
  clickedStatus.value = status
  emit('statusClicked', status)
}

// Fungsi untuk menangani klik pada total_ticket
const handleTotalTicketClick = () => {
  // Set semua status background ke false
  isTotalTicketClicked.value = true
  clickedStatus.value = 'total_ticket'
  emit('statusClicked', null)
}
</script>

<template>
  <VRow>
    <VOverlay v-model="isLoading" />
    <VCol cols="12">
      <VCard>
        <VCardTitle class="text-center mb-4">
          Resume Ticket
        </VCardTitle>
        <!-- {{ data }} -->
        <VCardText :loading="isLoading">
          <VRow>
            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': isTotalTicketClicked }"
              style="margin-right: -8px;"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleTotalTicketClick"
              >  
                <h2
                  class="text-center"
                >
                  {{ data[0].total_ticket || '-' }}
                </h2>
                <p
                  class="text-center"
                >
                  Total
                </p>
              </Vbtn>
            </VCol>
  
            <VDivider vertical />

            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': clickedStatus === 'Submitted' }"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleStatusClick('Submitted')"
              >
                <h2
                  class="text-center"
                  style="color: #00CFE8;"
                >
                  {{ data[0].submitted || '-' }}
                </h2>
                <p
                  class="text-center"
                >
                  Submitted
                </p>
              </Vbtn>
            </VCol>

            <VDivider vertical />

            <!--
              <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              >
              <h2 class="text-center">
              {{ data[0].confirm || '-' }}
              </h2>
              <p class="text-center">
              Confirm
              </p>
              </VCol>
            -->


            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': clickedStatus === 'First_level_approved' }"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleStatusClick('First_level_approved')"
              >
                <h2
                  class="text-center"
                  style="color: #28C76F;"
                >
                  {{ data[0].first_level_approved || '-' }}
                </h2>
                <p
                  class="text-center"
                >
                  Approve
                </p>
              </Vbtn>
            </VCol>

            <VDivider vertical />

            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': clickedStatus === 'Started' }"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleStatusClick('Started')"
              >
                <h2
                  class="text-center"
                  style="color: orange;"
                >
                  {{ data[0].started || '-' }}
                </h2>
                <p class="text-center">
                  Started
                </p>
              </Vbtn>
            </VCol>

            <VDivider vertical />

            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': clickedStatus === 'Ended' }"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleStatusClick('Ended')"
              >
                <h2
                  class="text-center"
                  style="color: #050C9C;"
                >
                  {{ data[0].ended || '-' }}
                </h2>
                <p class="text-center">
                  Ended
                </p>
              </Vbtn>
            </VCol>

            <VDivider vertical />

            <VCol
              v-if="data && data.length"
              cols="2"
              class="text-left"
              :loading="isLoading"
              :class="{ 'background': clickedStatus === 'Rejected' }"
            >
              <Vbtn
                style="cursor: pointer;"
                @click="handleStatusClick('Rejected')"
              >
                <h2
                  class="text-center"
                  style="color: red;"
                >
                  {{ data[0].rejected || '-' }}
                </h2>
                <p class="text-center">
                  Rejected
                </p>
              </Vbtn>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style>
.background {
  background-color: #efefef;
}
</style>

<route lang="yaml">
  meta:
    action: Manage
    subject: GA Ticket
    redirectIfLoggedIn: false
  </route>
