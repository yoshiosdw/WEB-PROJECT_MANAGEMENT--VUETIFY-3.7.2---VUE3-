<script setup>
import axiosIns from '@/plugins/axios';
import { watchEffect } from 'vue';
import { useToast } from 'vue-toastification';
import addLocation from './add.vue';

const toast = useToast()
const location = ref()
const locations = ref()
const currentPage = ref(1)
const perPage = ref(10)
const totalData = ref(0)
const lastData = ref(0)
const from = ref(1)
const to = ref(10)
const showLoading = ref(false)
const fetchLocation = async (page, perPage) => {
  showLoading.value = true;
  try {
    const ret = await axiosIns.get('/scale/locations', {
      params: {
        page: page,
        per_page: perPage
      }
    })
    locations.value = ret.data.data
    totalData.value = ret.data.meta.total
    lastData.value = ret.data.meta.last
    from.value = ret.data.meta.from
    to.value = ret.data.meta.to
    showLoading.value = false
  } catch (error) {
    console.log(error);
    showLoading.value = false
    toast.error(error.response.data.message)
  }
}

watchEffect(()=>{
  fetchLocation(currentPage.value, perPage.value)
})

const paginationData = computed(()=>{
  return `Showing ${from.value} to ${to.value} of ${totalData.value}`
})

</script>
<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle>Konfigurasi Lokasi</VCardTitle>
        <VDivider />
        <VCardText class="d-flex justify-space-between gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10, 20, 30, 50]"
            />
          </div>
          <addLocation />
        </VCardText>
        <VTable>
          <thead class="text-uppercase" style="background-color: #efefef;">
            <tr>
              <th>Lokasi</th>
              <th>Nama</th>
              <th>Keterangan</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in locations" :key="data.id">
              <td>{{ data.code }}</td>
              <td>{{ data.name }}</td>
              <td>{{ data.keterangan }}</td>
              <td>
                <VBtn variant="none" icon="tabler-trash" size="small"/>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
</template>