<script setup>
import axiosIns from "@/plugins/axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

// import ItemDialog from "../item/itemDialog.vue";
// import { useItemStore } from "../item/useItemStore";
import { useReceiveStore } from "./useReceiveStore"

const route = useRoute()
const lineId = route.params.id

const receiveStore = useReceiveStore()
const receives = ref(null)
const totalReceive = ref(0)
const page = ref(1)
const last = ref(0)
const perPage = ref(10)

const uomData = ref()
const uoms = ref()
const itemSelected = ref()
const itemData = ref()
const items = ref()
const itemName = ref()
const quantity = ref(0)
const price = ref()

const waiting = ref(true)
const showLoading = ref(true)

const fetchReceiveLine = async() => {
  waiting.value = true
  try {
    const ret = await axiosIns.get("/ict/receive/line/list/", {
      
      params: {
        receive_id: receiveStore.receive.id,
      },
    })

    const newReceiveLine = ret.data.data

    if (receives.value) {
      receives.value.push(newReceiveLine)
    } else {
      receives.value = [newReceiveLine]
    }
    
    receives.value = ret.data.data
    totalReceive.value = ret.data.meta.total 
    last.value = ref.data.meta.last
    waiting.value = true
  } catch(error) {
    console.log(error)

    // Swal.fire({
    //   title: 'LBG',
    //   error: error,
    //   icon: 'error'
    // })
  }
}

watchEffect(() => {
  fetchReceiveLine()
})

const fetchUom = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/uom/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    uomData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

const fetchItem = async(page, perPage, find) => {
  try {
    const ret = await axiosIns.get('/ict/items/', {
      
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    itemData.value = ret.data.data
  } catch(error) {
    Swal.fire({
      title: "LBG",
      text: error,
      icon: 'error',
    })
  }
}

watchEffect(() => {
  fetchUom(),
  fetchItem()
})

const getItems = val => {
  itemSelected.value = val.id
  items.value = val.code
  itemName.value = val.name 
  itemStore.item = val
}

const createReceiveLine = async() => {
  try {
    const ret = await axiosIns.post('/ict/receive/line/create', {
      receive_id: receiveStore.receive.id,
      item_id: itemSelected.value,
      uom_id: uoms.value,
      quantity: quantity.value,
      price: price.value,
    } )

    items.value = null
    itemName.value = null
    uoms.value = null
    quantity.value = null
    price.value = null
    fetchReceiveLine()
    Swal.fire({
      title: 'LBG',
      text: 'Create new Receive Line success',
      icon: 'success',
    })
  } catch(error) {
    console.log(error)

    // Swal.fire({
    //   title: "LBG",
    //   text: 'Create Receive Line failed',
    //   icon: 'error'
    // })
  }
}

const lineForm = ref()

const onSubmit = () => {
  lineForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid) {
      createReceiveLine()
    }
  })
}

const deleteData = async lineId => {
  showLoading.value = true
  try {
    const ret = await axiosIns.delete(`/ict/receive/line/delete/${lineId}` )

    fetchReceiveLine(page.value, perPage.value, find.value)
  } catch(error) {
    Swal.fire({
      title: 'LBG',
      text: error,
      icon: 'error',
    })
    showLoading.value = false
  }
}

const btnDeleteClickHandler = id => {
  Swal.fire({
    title: 'LBG',
    text: 'Sure delete data?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: 'warning',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonColor: 'primary',
  }).then(ret => {
    if(ret.isConfirmed) {
      deleteData(id)
    }
  })
}

const paginationData = computed(() => {
  const firstIndex = totalReceiveL.value == 0 ? 0 : (page.value - 1) * perPage.value + 1
  const lastIndex = page.value * perPage.value >= totalReceive.value ? totalReceive.value : page.value * perPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalReceive.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText>
          <VForm
            ref="lineForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <VCol cols="6">
                <div class="d-flex gap-3">
                  <VTextField
                    v-model="items"
                    label="Item"
                    :readonly="true"
                  />
                  <!-- <ItemDialog @item="getItems" /> -->
                </div>
              </VCol>
              <VCol cols="6">
                <VTextField
                  v-model="itemName"
                  label="Item Name"
                  :readonly="true"
                />
              </VCol>
            </VRow>
            <VRow>
              <VCol cols="4">
                <VSelect 
                  v-model="uoms"
                  label="UOM"
                  :items="uomData"
                  item-title="name"
                  item-value="id"
                  single-line
                  placeholder="UOM"
                />
              </VCol>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="quantity"
                    label="Quantity"
                  />
                </div>
              </VCol>
              <VCol cols="4">
                <div class="d-flex gap-3">
                  <VTextField 
                    v-model="price"
                    label="Price"
                  />
                </div>
              </VCol>
            </VRow>
            <VRow>
              <VCol
                cols="12"
                class="d-flex justify-end gap-4"
              >
                <VBtn
                  color="success"
                  type="submit"
                >
                  Save
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <VCard>
        <VTable class="text-no-wrap">
          <thead class="text-uppercase">
            <tr>
              <th scope="col">
                Item
              </th>
              <th scope="col">
                Uom
              </th>
              <th scope="col">
                Quantity
              </th>
              <th scope="col">
                Price
              </th>
              <th scope="col">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="line in receives"
              :key="line.id"
              style="height: 3.75rem;"
            >
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ line.item.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ line.uom.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ line.quantity }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ line.price }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <VBtn
                  icon=""
                  size="x-small"
                  color="default"
                  variant="text"
                  @click="btnDeleteClickHandler(line.id)"
                >
                  <VIcon
                    size="22"
                    icon="tabler-trash"
                    color="error"
                  />
                </VBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
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
