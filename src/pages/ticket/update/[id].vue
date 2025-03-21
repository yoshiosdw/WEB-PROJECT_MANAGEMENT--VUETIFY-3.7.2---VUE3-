<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()

const refConfirmTicket = ref()
const ticket = ref([])
const route = useRoute()
const ticketId = ref(route.params.id)
const showLoading = ref(false)

const documentNumber = ref()
const documentRequest = ref()
const requestor = ref()
const ticketType = ref()
const ticketCategory = ref()
const ticketSubCategory = ref()
const confirmAt = ref()
const targetMinute = ref(0)
const extension_number = ref()
const ip_address = ref()
const priority = ref()
const plantStart = ref()
const endTarget = ref()
const description = ref()
const startAt = ref()
const endAt = ref()
const location = ref()
const attachment = ref()
const person = ref()
const person_in_charge = ref()
const personId = ref()
const status = ref()

const business_benefit = ref()
const business_impact = ref()

const isTicketRejected= ref(false)

</script>

<template>
  <div>
    sample
  </div>
</template>

<route lang="yaml">
  meta:
    action: Manage
    subject: User
    redirectIfLoggedIn: false
  </route>
