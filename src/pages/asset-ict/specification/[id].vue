<script setup>
import axiosIns from '@/plugins/axios'
import { useRoute } from "vue-router"
import Swal from "sweetalert2"


const route = useRoute()

const assetId = route.params.id 
const loading = ref(false)

const assetSpec = ref ()
const asset = ref([])
const assetNumber = ref()
const assetSerialNumber = ref()
const assetBrand = ref()
const assetCondition = ref()
const assetStatus = ref ()
const assetDesc = ref()
const assetOrganization = ref()
const dialogVisible = ref(false)

const refAsset = ref()

const spekName = ref()
const spekVal = ref()


// const assign = ref(false)


const fetchAssetSpecification = async assetId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/asset/specifications/assetId/${assetId}` )

    assetSpec.value = ret.data.data
    loading.value = false
  } catch(error) {
    loading.value = false
    console.log(error)
  }
}

const fetchAssets = async assetId => {
  loading.value = true
  try {
    const ret = await axiosIns.get(`/assets/${assetId}` )

    asset.value = ret.data.data[0]
    assetNumber.value = asset.value.asset_number
    assetOrganization.value = asset.value.organization.name
    assetSerialNumber.value = asset.value.serial_number
    assetStatus.value = asset.value.status_name
    assetBrand.value = asset.value.brand
    assetCondition.value = asset.value.item_condition
    loading.value = false
  } catch(error) {
    Swal.fire({
      text: 'Failed to load Asset',
      title: error,
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchAssets(assetId),
  fetchAssetSpecification(assetId)
})

const createAssetSpek = async assetId => {
  loading.value = true
  try {
    const ret = await axiosIns.post(`/asset/specifications/store/By/${assetId}`, {
      asset_id: assetId,
      name: spekName.value,
      value: spekVal.value,
    } )

    fetchAssets(assetId),
    fetchAssetSpecification(assetId)
    closeDialog()

  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: 'Create Vendor failed',
      icon: 'error',
    })
  } finally { loading.value = false }
}

const openDialog = async () => {
  loading.value = true
  fetchAssets(assetId),
  fetchAssetSpecification(assetId)
  dialogVisible.value = true
  loading.value = false
}

const closeDialog = () => {
  dialogVisible.value = false
}


// const openDialog = async id => {
//   loading.value = true
//   try {
//     const ret = await axiosIns.post(`/asset/specifications/store/By/${assetId}`, {
//       asset_id: assetId,
//       name: spekName.value,
//       value: spekVal.value,
//     }, {
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
//       },
//     })

//     fetchAssets(assetId),
//     fetchAssetSpecification(assetId)
//     dialogVisible.value = true

//   } catch(error) {
//     Swal.fire({
//       title: "LBG",
//       text: error,
//       icon: 'error',
//     })
//   } finally { loading.value = false }
// }

const onSubmit = () => {
  refAsset.value?.validate().then(({ valid: isValid }) => {
    if (isValid) createAssetSpek(assetId)
  })
}
</script>

<template>
  <VRow>
    <VCol
      cols="3"
    >
      <VCard>
        <VCardText class="text-center pt-15">
          <VIcon
            size="60"
            color="error"
            icon="tabler-devices"
          />
          <h6 class="text-h6 mt-4">
            {{ assetNumber }}
          </h6>
          <p>
            {{ assetSerialNumber }} - {{ assetBrand }}
          </p>

          <VChip
            label:color="primary"
            size="small"
            class="text-capitalize mt-4"
          >
            Location: {{ assetOrganization }}
          </VChip>
        </VCardText>

        <VCardText class="d-flex justify-center flex-wrap mt-3">
          <div class="d-flex align-center me-8 mb-2">
            <VAvatar
              :size="38"
              rounded
              color="primary"
              variant="tonal"
              class="me-3"
            >
              <VIcon
                size="24"
                icon="tabler-checkbox"
              />
            </VAvatar>

            <div>
              <h6
                class="text-base font-weight-semibold"
                style="font-size: 13px;"
              >
                <span>{{ assetNumber }}</span>
              </h6>
              <span class="text-sm">Condition: {{ assetCondition }} </span>
            </div>
          </div>
        </VCardText>

        <VDivider />
        <VCardText class="text-center">
          <div>
            <h6 class="text-base font-weight-semibold">
              <span>{{ assetStatus }}</span>
            </h6>
          </div>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="9">
      <VCard>
        <div class="d-flex align-items-center justify-between mt-3 mb-2">
          <VCardTitle class="mb-0">
            SPECIFICATION
          </VCardTitle>
          <div class="ms-auto">
            <VBtn
              prepend-icon="tabler:plus"
              class="d-flex gap-2"
              style="margin-right: 1rem;"
              @click="openDialog"
            >
              Add Specification
            </VBtn>
          </div>
        </div>
        <VTable>
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
          >
            <tr>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(spek, index) in assetSpec"
              :key="index"
            >
              <td>{{ spek.name || '-' }}</td>
              <td>{{ spek.value || '-' }}</td>
            </tr>
          </tbody>
        </VTable>
        <VDialog
          v-model="dialogVisible"
          width="768"
          transition="dialog-bottom-transition"
          persistent
        >
          <DialogCloseBtn @click="closeDialog" />
          <VCol cols="12">
            <VCard>
              <VCardTitle>Asset Specification</VCardTitle>
              <VCardText class="mt-3">
                <VForm
                  ref="refAsset"
                  @submit.prevent="onSubmit"
                >
                  <VRow>
                    <VCol cols="6">
                      <VTextField  
                        v-model="spekName"
                        label="Name"
                      />
                    </VCol>
                    <VCol cols="6">
                      <VTextField 
                        v-model="spekVal"
                        label="Value"
                      />
                    </VCol>
                  </VRow>

                  <VRow class="mt-3">
                    <VCol
                      cols="12"
                      class="d-flex justify-end gap-3"
                    >
                      <VBtn
                        color="warning"
                        @click="closeDialog"
                      >
                        Cancel
                      </VBtn>
                      <VBtn
                        type="submit"
                        color="success"
                      >
                        Save
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VDialog>
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
