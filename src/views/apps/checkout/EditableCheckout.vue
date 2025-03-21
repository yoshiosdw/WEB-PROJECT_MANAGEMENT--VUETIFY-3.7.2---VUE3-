<script setup>
import axiosIns from '@/plugins/axios'
import { themeConfig } from '@themeConfig'
import EditCheckoutAsset from './EditCheckoutAsset.vue'

const props = defineProps({
  data: {
    type: null,
    required: true,
  },
})

const isLoading = ref(false)

const checkoutFilter = [
  {
    id: 1,
    name: 'EMPLOYEE',
  },
  {
    id: 2,
    name: 'ITEM',
  },
  {
    id: 3,
    name: 'LOCATION',
  },
]

const checkoutTo = ref()
const refName = ref()
const refDesc = ref()
const refCategory = ref()
const employees = ref()
const items = ref()
const locations = ref()
const selectedRef = ref()
const selectedReLoc = ref()
const selectedRefEmp = ref()
const assets = ref([])

const fetchItem = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/items' )

    items.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const fetchLocation = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('/locations' )

    locations.value = ret.data.data
    isLoading.value = false
  } catch(error) {
    isLoading.value = false
    console.log(error)
  }
}

const fetchEmployee = async() => {
  isLoading.value = true
  try {
    const ret = await axiosIns.get('employment/employees' )

    isLoading.value = false
    employees.value = ret.data.data
  } catch(error){
    isLoading.value = false
    console.log(error)
  }
}

watchEffect(() => {
  fetchItem(), fetchLocation(), fetchEmployee()
})

watch(checkoutTo, async newCheckoutTo => {
  if (newCheckoutTo && newCheckoutTo.name === 'ITEM') {
    await fetchItem()
    selectedRef.value = true
    selectedReLoc.value = false
    selectedRefEmp.value = false
  } else if(newCheckoutTo && newCheckoutTo.name === 'LOCATION') {
    await fetchLocation()
    selectedReLoc.value = true
    selectedRef.value = false
    selectedRefEmp.value = false
  } else if(newCheckoutTo && newCheckoutTo.name === 'EMPLOYEE') {
    await fetchEmployee()
    selectedRefEmp.value = true
    selectedRef.value = false
    selectedReLoc.value = false
  } else {
    selectedRef.value = false
    selectedReLoc.value = false
    selectedRefEmp.value = false
  }
})

const addAsset = () => {
  assets.value.push({})
}

const removeAsset = id => {
  assets.value.splice(id, 1)
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row">
      <div class="ma-sm-1">
        <div class="d-flex align-center mb-6">
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
            class="me-3"
          />
          <h6 class="font-weight-bold text-xl">
            {{ themeConfig.app.title }}
          </h6>
        </div>
      </div>
      <div class="mt-4 ma-sm-1">
        <h3 class="d-flex align-center font-weight-medium justify-sm-end text-l mb-2">
          <span class="me-2">Document Number</span>
          <span>
            <VTextField 
              v-model="documentNumber"
              disabled
              prefix="#"
              style="width: 8.9rem;"
            />
          </span>
        </h3>
        <p class="d-flex align-center justify-sm-end mb-2">
          <span class="me-2">Document Date</span>
          <span>
            <VDateInput 
              v-model="documentDate"
              density="compact"
              style="width: 8.9rem;"
              placeholder="YYYY-MM-DD"
              :config="{ position: 'auto right ' }"
            />
          </span>
        </p>
        <p class="d-flex align-center justify-sm-end mb-2">
          <span class="me-2">Expectation Checkin</span>
          <span>
            <VDateInput 
              v-model="expectCheckin"
              density="compact"
              style="width: 8.9rem;"
              placeholder="YYYY-MM-DD"
              :config="{ position: 'auto right ' }"
            />
          </span>
        </p>
      </div>
    </VCardText>

    <VDivider />
    <VCardText class="d-flex flex-wrap justify-space-between flex-column flex-sm-row gap-4">
      <div
        class="ma-sm-3"
        style="width: 25rem"
      >
        <h6 class="text-sm font-weight-medium mb-2">
          Checkout To :
        </h6>
        <VRadioGroup
          v-model="checkoutTo"
          inline
          :rules="[requiredValidator]"
        >
          <VRadio 
            v-for="hal in checkoutFilter"
            :key="hal.name"
            :label="hal.name"
            :value="hal"
          />
        </VRadioGroup>
      </div>
      <div
        v-if="selectedRef"
        class="ma-sm-3 mt-4"
        style="width: 18rem"
      >
        <VSelect
          v-model="referenceId"
          class="mt-7"
          :items="items"
          item-value="id"
          item-title="code"
        />
        <table>
          <tbody>
            <tr>
              <td class="pe-6">
                Category :
              </td>
              <td class="font-weight-semibold">
                {{ refCategory }}
              </td>
            </tr>
            <tr>
              <td class="pe-6">
                Name :
              </td>
              <td class="font-weight-semibold">
                {{ refName }}
              </td>
            </tr>
            <tr>
              <td class="pe-6">
                Description :
              </td>
              <td class="font-weight-semibold">
                {{ refDesc }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="selectedReLoc"
        class="ma-sm-3 mt-4"
        style="width: 18rem"
      >
        <VSelect
          v-model="referenceId"
          class="mt-7"
          :items="locations"
          item-value="id"
          item-title="name"
        />
      </div>
      <div
        v-if="selectedRefEmp"
        class="ma-sm-3 mt-4"
        style="width: 18rem"
      >
        <VSelect
          v-model="referenceId"
          class="mt-7"
          :items="employees"
          item-value="id"
          item-title="person.name"
        />
      </div>
    </VCardText>

    <VDivider />
    <VCardText class="add-asset-form">
      <div class="ma-sm-4">
        <div
          v-for="(asset, index) in assets"
          :key="asset.id"
          class="mb-4"
        >
          <EditCheckoutAsset
            :id="index"
            :data="asset"
          />
          <VBtn
            color="red"
            @click="removeAsset(index)"
          >
            Remove
          </VBtn>
        </div>
      </div>
      <div class="mt-4 ma-sm-4">
        <VBtn @click="addAsset">
          Add Asset
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
