<script setup>
import { requiredValidator } from '@/@core/utils/validators'
import { useCheckoutStore } from '@/pages/checkout/useCheckoutStore'
import DialogAssetDeployed from '../asset-ict/dialogAssetDeployed.vue'


// const assetLocation = ref()
// const assetNumber = ref(props.data.assetNumber || '');
// const assetItem = ref(props.data.assetItem || '');
// const assetId = ref(props.data.assetId || '');
// const qty = ref(props.data.qty || 0);
// const assetLocation = ref(props.data);

// const assetId = ref()

// const props = defineProps({
//   id: Number,
//   data: Object,
// })

const props = defineProps({
  checkoutId: {
    type: String,
    default: null,
  },
  save: {
    type: String,
    default: null,
  },
  id:{ type: Number, default: null },
  data: { type: Object, default: null },
})


const emit = defineEmits(['updateAsset'])
const checkoutStore = useCheckoutStore()
const assets = ref()

const loading = ref(false)

const assetNumber = ref(props.data.asset_number || '')
const assetItem = ref(props.data.item?.name || '')
const assetId = ref(props.data.id || '')
const qty = ref(props.data.qty || 1)


const getAsset = val => {
  assetNumber.value = val.asset_number
  assetId.value = val.id
  assetItem.value = val.item ? val.item.name : ''
  assets.value = val 
}

watch([assetNumber, assetItem, qty], () => {
  emit('updateAsset', {
    id: props.id,
    asset: {
      assetId: assetId.value, 
      asset_number: assetNumber.value,
      assetItem: assetItem.value,
      qty: qty.value,
    },
  })
})
</script>

<template>
  <div class="add-asset-header mb-2 d-none d-md-flex">
    <VRow class="font-weight-medium px-4">
      <VCol
        cols="12"
        md="4"
      >
        <span class="text-sm">Asset Number</span>
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <span class="text-sm">Item</span>
      </VCol>
      <VCol
        cols="12"
        md="2"
      >
        <span class="text-sm">Qty</span>
      </VCol>
    </VRow>
  </div>
  <VCard
    class="d-flex flex-row"
    flat
    border
  >
    <div class="pa-5 flex-grow-1">
      <VRow>
        <VCol
          cols="12"
          md="4"
        >
          <div class="d-flex gap-2">
            <VTextField
              v-model="assetNumber"
              readonly
              :rules="[requiredValidator]"
            />
            <DialogAssetDeployed @asset="getAsset" />
          </div>
        </VCol>
        <VCol
          cols="12"
          md="6"
        >
          <VTextField
            v-model="assetItem"
            readonly
          />
        </VCol>
        <VCol
          cols="12"
          md="2"
        >
          <VTextField
            v-model="qty"
            type="number"
            reverse
            :rules="[requiredValidator]"
          />
        </VCol>
      </VRow>
    </div>
  </VCard>
</template>
