<script setup>
import axiosIns from '@/plugins/axios'
import { useRoute } from 'vue-router'

const route = useRoute()
const satId = ref(route.params.id)
const histories = ref()
const isLoading = ref(false)

const fetchTask = async satId => {
  isLoading.value = true
  try{
    const ret = await axiosIns.get(`/sat/histories/${satId}` )

    isLoading.value = false
    histories.value = ret.data.data
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchTask(satId.value)
})
</script>

<template>
  <VRow>
    <VCols cols="12">
      <VCard>
        <VCardText>
          <VTable>
            <thead
              class="text-uppercase"
              style="background-color: #efefef"
            >
              <tr>
                <th
                  scpe="col"
                  class="text-no-wrap"
                >
                  Document Date
                </th>
                <th scpe="col">
                  Document Number
                </th>
                <th scpe="col">
                  Bill Date
                </th>
                <th scpe="col">
                  Bill Number
                </th>
                <th scpe="col">
                  Qty (Kg)
                </th>
                <th scpe="col">
                  Request Shipdate
                </th>
                <th scpe="col">
                  Task Name
                </th>
                <th scpe="col">
                  Delivery Date
                </th>
                <th scpe="col">
                  Task Status
                </th>
                <th scpe="col">
                  Action Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in histories"
                :key="data.id"
              >
                <td>{{ data.document_date }}</td>
                <td>{{ data.document_number }}</td>
                <td>{{ data.bill_date }}</td>
                <td class="text-no-wrap">
                  {{ data.bill_number }}
                </td>
                <td>{{ data.quantity }}</td>
                <td>{{ data.request_ship_date }}</td>
                <td class="text-no-wrap">
                  {{ data.task_name }}
                </td>
                <td>{{ data.delivery_date }}</td>
                <td>{{ data.task_status }}</td>
                <td>{{ data.action_date }}</td>
              </tr>
            </tbody>
          </VTable>      
          <VDivider />
        </VCardText>
        <VCardText>
          <VRow>
            <VCol cols="12">
              <div class="d-flex justify-end gap-4">
                <VBtn
                  :to="{name: 'sat'}"
                  color="warning"
                >
                  Close
                </VBtn>
              </div>
            </VCol>
          </VRow>    
        </VCardText>
      </VCard>
    </VCols>
  </VRow>
</template>

<route lang="yaml">
  meta:
    action: Read
    subject: SAT
    redirectIfLoggedIn: false
</route>
