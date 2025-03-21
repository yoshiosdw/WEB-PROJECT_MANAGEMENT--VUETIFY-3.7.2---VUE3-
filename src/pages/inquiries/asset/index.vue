<script setup>
import axiosIns from '@/plugins/axios.js'
import { useAssetHistoryStore } from './useAssetHistoryStore.js'

const assetHistoryStore = useAssetHistoryStore()
const assetHistories = ref()
const perPage = ref(10)
const page = ref(1)
const totalAssetHistory = ref(0)
const last = ref(0)
const isLoading = ref(false)

const fetchHistory = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/' )

    assetHistories.value = ret.data.data
    totalAssetHistory.value = ret.data.meta.total 
    last.value = ret.data.meta.last 
  } catch(error) {
    console.log(error)
  }
}

// watchEffect(() => {
//   fetchHistory()
// })

const paginationData = computed(() => {
  const firstIndex = totalAssetHistory.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalAssetHistory.value ? totalAssetHistory.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalAssetHistory.value} entries`
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
        </VCardText>
        <VCardText>
          <VTable>
            <thead>
              <tr
                class="text-uppercase"
                style="background-color: #efefef;"
              >
                <th>Asset Name</th>
                <th>UOM</th>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="data in assetHistories"
                :key="data.id"
              >
                <!--
                  <td style="width: 8rem;">
                  <div class="d-flex justify-center">

                  </div>
                  </td> 
                -->
                <td>{{ data.asset_name }}</td>
                <td>{{ data.uom }}</td>
                <td>{{ data.transaction_date }}</td>
                <td>{{ data.transaction_type }}</td>
                <td>{{ data.reference_description }}</td>
                <td>{{ data.note }}</td>
              </tr>
            </tbody>
          </VTable>
        </VCardText>
        <VCardText
          class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5"
        >
          <span
            v-if="totalAssetHistory != 0"
            class="text-sm text-disabled"
          >
            {{ paginationData }}
          </span>
          <span
            v-else
            class="text-sm text-disabled"
          >No Data Found!</span>
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
    subject: Ticket
    redirectIfLoggedIn: false
</route>
