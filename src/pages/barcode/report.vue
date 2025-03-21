<script setup>
import axiosIns from "@/plugins/axios"
import { ref, watchEffect } from "vue"
import { useToast } from "vue-toastification"

const props = defineProps({
  boNumber: {
    type: String,
    required: true,
  },
})

const prodId = computed(() => props.boNumber)
const productPrint = ref([])
const page = ref(1)
const perPage = ref(10)
const total = ref(0)
const last = ref(0)
const from = ref(1)
const to = ref(10)
const find = ref('')
const findText = ref('')
const toast = useToast()
const loading = ref(false)

const fetchPrintProduct = async (page, perPage, prodId, find) => {
  loading.value = true
  try {
    const params = {
      page: page,
      perPage: perPage,
      prod_id: prodId,
      find: find,
    }

    const response = await axiosIns.get('/barcodes/getPrintByBoNumber',
      { params:params },
    )

    loading.value = false
    productPrint.value = response.data.data
    from.value = response.data.meta.from
    to.value = response.data.meta.to
    total.value = response.data.meta.total
    last.value = response.data.meta.last
      
  } catch (error) {
    loading.value = false
    console.log(error)
  }
}

const clearHandle = () => {
  find.value = ''
}

const findData = async ()=>{
  page.value = 1
  perPage.value = 10
  find.value = findText.value
}

watchEffect(() =>{
  fetchPrintProduct(page.value, perPage.value, prodId.value, find.value)
})

const paginationData = computed(() => {
  return `Showing ${from.value} to ${to.value} of ${total.value} entries`
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="loading" />
      <VCard :loading="loading">
        <VCardTitle style=" margin-bottom: 16px;">
          Histori Cetak Barcode
        </VCardTitle>
        <VDivider class="mb-2" />
        <VCardText class="d-flex justify-start gap-4">
          <div style="min-width: 80px;">
            <VSelect 
              v-model="perPage"
              :items="[10,20,30,50]"
            />
          </div>

          <VTextField
            v-model="findText"
            label="Search"
            clearable
            @keydown.enter="findData"
            @click:clear="clearHandle"
          />
        </VCardText>
        <VTable>
          <thead 
            class="text-uppercase text-no-wrap"
            style="background-color: #efefef;"
          >
            <tr>
              <th scope="col">
                No. BO
              </th>
              <th scope="col">
                No. Mesin
              </th>
              <th scope="col">
                Kode Produk
              </th>
              <th scope="col">
                Nama Produk
              </th>
              <th scope="col">
                Dari
              </th>
              <th scope="col">
                Ke
              </th>
              <th scope="col">
                Jumlah
              </th>
              <th scope="col">
                Tanggal Produksi
              </th>
              <th scope="col">
                Shift
              </th>
              <th scope="col">
                Pengawas
              </th>
              <th scope="col">
                Operator
              </th>
              <th scope="col">
                Tipe
              </th>
              <th scope="col">
                Plant
              </th>
              <th scope="col">
                Penginput
              </th>
              <th scope="col">
                Keterangan
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(products, index) in productPrint"
              :key="index"
            >
              <td style="white-space: nowrap;">
                {{ products.bonumber }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.machine_no }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.itemcode }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.itemname }}
              </td>
              <td style="text-align: right;">
                {{ products.from_page }}
              </td>
              <td style="text-align: right;">
                {{ products.to_page }}
              </td>
              <td style="text-align: right;">
                {{ products.page }}
              </td>
              <td>
                {{ products.production_date }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.shift?.name }}
              </td>
              <td>
                {{ products.pengawas }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.operator }}
              </td>
              <td style="white-space: nowrap;">
                {{ products.type_label_barcode?.name }} 
              </td>
              <td>
                {{ products.site }} 
              </td>
              <td>
                {{ products.user }} 
              </td>
              <td>
                {{ products.note }} 
              </td>
            </tr>
          </tbody>
        </VTable>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>
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
    subject: Barcode
    redirectIfLoggedIn: false
</route>
