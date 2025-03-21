<script setup>
import DialogCloseBtn from '@/@core/components/DialogCloseBtn.vue';
import axiosIns from '@/plugins/axios';
import { watchEffect } from 'vue';
import { useToast } from 'vue-toastification';

const toast = useToast()
const scaleLocations = ref()
const currentPage = ref(1)
const perPage = ref(10)
const totalData = ref(0)
const lastData = ref(0)
const from = ref(1)
const to = ref(10)
const showLoading = ref(false)
const fetchScaleLocation = async (page, perPage) => {
  showLoading.value = true;
  try {
    const ret = await axiosIns.get('/scale/locations', {
      params: {
        page: page,
        per_page: perPage
      }
    })
    scaleLocations.value = ret.data.data
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
  fetchScaleLocation(currentPage.value, perPage.value)
})

const paginationData = computed(()=>{
  return `Showing ${from.value} to ${to.value} of ${totalData.value}`
})

const location = ref(null)
const locations = ref([])
const fetchLocations = async search => {
  try {
    const ret = await axiosIns.get('/locations', {
      params: {
        find: search
      }
    })
    locations.value = ret.data.data
  } catch (error) {
    console.log(error);
    locations.value = []
  }
}

const search = ref()
const onSearch = newSearch => {
  search.value = newSearch
  if(newSearch.length >= 5){
    fetchLocations(newSearch)
  } else {
    locations.value = []
  }
}

const addLocaionHandler = async () => {
  try {
    const ret = await axiosIns.patch(`/scale/locations/set/available/${location.value.id}`)
    toast.success('Success')
    locations.value = []
  } catch (error) {
    toast.error(error.response.data.message)
  }
}

const isVisible = ref(false)

</script>
<template>
  <VDialog
    v-model="isVisible"
    width="1024"
    transition="dialog-bottom-transition"
    persistent
  >
    <template #activator="{props}">
      <VBtn v-bind="props">Add</VBtn>
    </template>
    <DialogCloseBtn @click="isVisible = false"/>
    <VCard>
      <VCardTitle>Tambah Lokasi</VCardTitle>
      <VDivider />
      <VCardText>
        <VRow>
          <VCol cols="12" class="d-flex gap-2">
            <VAutocomplete 
              v-model="location"
              :items="locations"
              @update:search="onSearch"
              item-value="name"
              item-title="name"
              clearable
              label="Cari Lokasi"
              return-object
            />
            <VBtn
              variant="text"
              color="default"
              icon
              size="small"
              :disabled="!location"
              @click="addLocaionHandler"
            >
              <VIcon
                size="24"
                icon="tabler-plus"
              />
            </VBtn>
          </VCol>
        </VRow>
      </VCardText>
      <VCardText>
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
            <tr v-for="data in scaleLocations" :key="data.id">
              <td>{{ data.code }}</td>
              <td>{{ data.name }}</td>
              <td>{{ data.keterangan }}</td>
              <td>
                <VBtn variant="none" icon="tabler-trash" size="small"/>
              </td>
            </tr>
          </tbody>
        </VTable>
        <VRow>
          <VCol cols="12" class="d-flex justify-end mt-5">
            <VBtn>Close</VBtn>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog >
</template>