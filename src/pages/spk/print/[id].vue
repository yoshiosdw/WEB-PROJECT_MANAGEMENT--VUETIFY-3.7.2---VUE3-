<script setup>
import { formatRibuan } from "@/@core/utils/formatters"
import axiosIns from "@/plugins/axios"
import router from "@/router"
import VueQrcode from 'qrcode.vue'
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const route = useRoute()
const spkId = ref(route.params.id)
const spks = ref(null)
const noSpk = ref()
const itemCode = ref()
const itemName = ref()
const noNota = ref()
const customerName = ref()
const customerAccount = ref()
const brand = ref()
const uom = ref()
const size = ref()
const shippingTolerance = ref()
const sizeDetail = ref()
const qtyOrder = ref()
const status = ref()
const orderStatus = ref()

const lines = ref([])
const totalLine = ref(0)
const totalBs = ref(0)
const totalPercentage = ref(0)
const isLoading = ref(true)

const fetchSpkHeader = async id => {
  try {
    const ret = await axiosIns.get(`/production/workorders/${id}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('sinarjoAccessToken'),
      },
    })

    spks.value = ret.data.data[0]
    noSpk.value = spks.value.document_number
    itemCode.value = spks.value.item_code
    itemName.value = spks.value.item_name
    noNota.value = spks.value.bill_number
    customerName.value = spks.value.customer_name
    customerAccount.value = spks.value.customer_account
    shippingTolerance.value = spks.value.shipping_tolerance
    brand.value = spks.value.item_brand
    uom.value = spks.value.uom.code
    size.value = spks.value.item_size
    status.value = spks.value.status
    sizeDetail.value = spks.value.item_size_detail
    qtyOrder.value = spks.value.quantity
    orderStatus.value = spks.value.status

  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Get data SPK failed!',
      icon: 'error',
    })
  }
}

const fetchSpkLine = async spkId => {
  try {
    const ret = await axiosIns.get(`/production/workorder/lines/${spkId}` )

    lines.value = ret.data.data
    totalLine.value = ret.data.meta.total
  } catch(error) {
    Swal.fire({
      title: 'SPK',
      text: 'Get data line failed.',
      icon: 'error',
    })
  }
}

const cancel = () => {
  router.go(-1)
}

watchEffect(async () => {
  await fetchSpkHeader(spkId.value)
  if (spks.value) {
    await fetchSpkLine(spkId.value)

    const printStatus = window.print()

    if (printStatus) {
      cancel()
    } else {
      cancel()
    }
  }
})

const calculateTotal = () => {
  if (lines.value.length > 0) {
    totalBs.value = lines.value.reduce((accumulator, current) => {
      return accumulator + (current.order_qty * (current.waste_target / 100))
    }, 0)

    totalPercentage.value = lines.value.reduce((accumulator, current) => {
      return accumulator + current.waste_target
    }, 0)
  } else {
    totalBS.value = 0
    totalPercentage.value = 0
  }
}

// watchEffect(() => {
//   calculateTotal()
// })
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardText
          class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          style="margin-bottom: -50px;"
        >
          <VCol
            cols="7"
            style="margin-right: -20px; margin-bottom: -10px;"
          >
            <h6 class="text-sm font-weight-bold mb-3">
              SURAT PERINTAH KERJA (SPK)
            </h6>
            <VTable style="margin-right: -30px;">
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6 ml-5">
                  NOMOR SPK
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ noSpk }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  KODE ITEM
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ itemCode }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  NAMA ITEM
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ itemName }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  NOMOR NOTA
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ noNota }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  CUSTOMER
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ customerName }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  BRAND
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ itemBrand }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  UKURAN
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ size }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  DETAIL UKURAN
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ sizeDetail }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  QUANTITY ORDER
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ qtyOrder }} {{ uom }}
                </td>
              </tr>
              <tr>
                <td class="text-sm font-weight-bold mb-3 pe-6">
                  STATUS ORDER
                </td>
                <td class="text-sm font-weight-bold mb-3 pe-2">
                  :
                </td>
                <td class="text-sm font-weight-bold mb-3">
                  {{ orderStatus === 0 ? 'Created' : (orderStatus === 1 ? 'Closed' : 'On Process') }}
                </td>
              </tr>
            </VTable>
          </VCol>

          <VCol
            cols="5"
            class="flex-grow-0"
          >
            <h6 class="text-sm font-weight-bold mb-3">
              TARGET BS
            </h6>
            <VTable
              class="table table-sm font-weight-bold"
              style="margin-top: -20px; font-size: 5px; margin-left: -30px;"
            >
              <thead>
                <tr style="padding: 0px; padding-left: -20px;">
                  <td style="padding: 5px">
                    DIVISI
                  </td>
                  <td style="padding: 0px;" />
                  <td style="padding: 0px; text-align: center;">
                    %
                  </td>
                  <td style="padding: 4px">
                    QTY
                  </td>
                  <td style="padding: 3px">
                    UOM
                  </td>
                </tr>
              </thead>
              <!-- <tbody style="padding-top: 0px;"> -->
              <tr
                v-for="data in lines"
                :key="data.id"
                class="text-sm font-weight-bold mb-3"
              >
                <td style="padding-left: 3px;">
                  {{ data.process.name }}
                </td>
                <td style="padding: 2px;">
                  :
                </td>
                <td style="padding: 2px; text-align: center;">
                  {{ data.waste_target }} %
                </td>
                <td style="padding: 4px; text-align: right;">
                  {{ formatRibuan(data.order_qty) }}
                </td>
                <td style="padding: 0px" />
              </tr>
              <tr class="text-sm font-weight-bold mb-3"> 
                <td style="padding-left: 3px; border-top: 1px solid black; border-bottom: 1px solid black;">
                  TOTAL BS
                </td>
                <td style="padding: 0px; border-top: 1px solid black; border-bottom: 1px solid black;">
                  :
                </td>
                <td style="padding: 2px; text-align: center; border-top: 1px solid black; border-bottom: 1px solid black;">
                  {{ totalPercentage.toFixed(2) }} %
                </td>
                <td style="padding: 4px; border-top: 1px solid black; border-bottom: 1px solid black;">
                  {{ totalBs.toFixed(2) }}
                </td>
                <td style="padding: 0px; border-top: 1px solid black; border-bottom: 1px solid black;" />
              </tr>
              <!-- </tbody> -->
            </VTable>
          </VCol>
        </VCardText>

        <div
          v-for="data in lines"
          :key="data.id"
        >
          <!-- ROLL -->
          <VCardText
            v-if="data.process.name === 'ROLL'"
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <VCol
              cols="12"
              class="d-flex"
              style="margin-bottom: -75px; margin-top: -20px;"
            >
              <div class="ma-sm-4">
                <h6 class="text-sm font-weight-bold">
                  BLOWING
                </h6>
                <h6 class="text-sm font-weight-bold mb-3">
                  A. SPESIFIKASI PRODUK
                </h6>
                <VTable
                  class="ml-4"
                  style="margin-top: -15px;"
                >
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      ITEM ID
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.item_code }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      ITEM NAME
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.item_name }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      QUANTITY ORDER
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ formatRibuan(data.order_qty) }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      JENIS BAHAN & WARNA
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.material_type }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      UKURAN BLOWING
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      JUMLAH PER 1 KG
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td />
                  </tr>
                </VTable>
    
                <VSpacer class="mt-3" />
                <h6
                  class="text-sm font-weight-bold mb-3"
                  style="margin-top: -6px;"
                >
                  B. QUANTITY ORDER 
                </h6>
                <VCol
                  cols="7"
                  style="margin-left: -12px;"
                >
                  <VTable
                    class="ml-4"
                    style="margin-top: -25px;"
                  >
                    <tr>
                      <td class="text-sm font-weight-bold mb-3">
                        BERAT
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ data.box_weight }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3">
                        JUMLAH
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ formatRibuan(data.order_qty) }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3">
                        BAHAN YANG DIGUNAKAN
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ data.order_qty }}</td>
                    </tr>
                  </VTable>
                </VCol>
    
                <VSpacer class="mt-2" />
                <h6
                  class="text-sm font-weight-bold mb-3"
                  style="margin-top: -10px;"
                >
                  C. KETERANGAN LAIN-LAIN
                </h6>
                <VCol
                  cols="7"
                  style="margin-left: -12px;"
                >
                  <VTable
                    class="ml-4"
                    style="margin-top: -25px;"
                  >
                    <tr>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        TREAT / AC
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ data.is_use_treatment === 2 ? 'YES' : 'NO' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        PRODUKSI PAKAI ROTARI
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ data.is_use_rotary === 2 ? 'YES' : 'NO' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        METERAN
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ formatRibuan(data.meter) }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        DIAMETER ROLL
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ formatRibuan(data.order_qty) }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        NOTE
                      </td>
                      <td class="text-sm font-weight-bold mb-3 pe-3">
                        :
                      </td>
                      <td>{{ data.note }}</td>
                    </tr>
                  </VTable>
                </VCol>
              </div>
              <VSpacer />
              <div class="d-flex justify-end">
                <div class="mt-12">
                  <h6 class="text-sm text-center font-weight-bold mb-3">
                    {{ data.line_document_number }}
                  </h6>
                  <VTable>
                    <tr>
                      <td style="height: 18px; text-align: center;">
                        <VueQrcode :value="data.line_document_number" />
                      </td>
                    </tr>
                  </VTable>
                </div>
              </div>
            </VCol>
          </VCardText>
  
          <!-- PRINTING -->
          <VCardText 
            v-if="data.process.name === 'PRINTING'"
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <VCol
              cols="12"
              class="d-flex"
              style="margin-bottom: -60px;margin-top: -10px;"
            >
              <div class="ma-sm-4">
                <h6 class="text-sm font-weight-bold mb-3">
                  PRINTING
                </h6>
                <h6 class="text-sm font-weight-bold mb-3">
                  A. DETAIL
                </h6>
                <VTable
                  class="ml-4"
                  style="margin-top: -15px;"
                >
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      UKURAN ROLL
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.roll_size_finish }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      CIRCUM CYLINDER
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.roll_diameter }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      JUMLAH TINTA DIGUNAKAN
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.number_of_color }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      WARNA TINTA
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.color }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      NOTE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.note }}</td>
                  </tr>
                </VTable>
              </div>
              <VSpacer />
              <div class="d-flex justify-end">
                <div class="mt-12">
                  <h6 class="text-sm text-center font-weight-bold mb-3">
                    {{ data.line_document_number }}
                  </h6>
                  <VTable>
                    <tr>
                      <td>
                        <VueQrcode :value="data.line_document_number" />
                      </td>
                    </tr>
                  </VTable>
                </div>
              </div>
            </VCol>
          </VCardText>
  
          <VCardText
            v-if="data.process.name === 'GUSSET' || data.process.name === 'SLITTING' || data.process.name === 'HEAT SEAL'"
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <VCol
              cols="12"
              class="d-flex"
              style="margin-bottom: -55px; margin-top: -10px;"
            >
              <div class="ma-sm-4">
                <h6 class="text-sm font-weight-bold mb-3">
                  {{ data.process.name }}
                </h6>
                <h6 class="text-sm font-weight-bold mb-3">
                  A. DETAIL
                </h6>
                <VTable
                  class="ml-4"
                  style="margin-top: -15px;"
                >
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-6">
                      UKURAN ROLL AWAL
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.roll_size_start }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-6">
                      UKURAN ROLL AKHIR
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.roll_size_finish }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-6">
                      NOTE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.note }}</td>
                  </tr>
                </VTable>
              </div>
              <VSpacer />
              <div class="d-flex justify-end">
                <div class="mt-12">
                  <h6 class="text-sm text-center font-weight-bold mb-3">
                    {{ data.line_document_number }}
                  </h6>
                  <VTable>
                    <tr>
                      <td>
                        <VueQrcode :value="data.line_document_number" />
                      </td>
                    </tr>
                  </VTable>
                </div>
              </div>
            </VCol>
          </VCardText>
  
          <!-- CUTTING -->
          <VCardText 
            v-if="data.process.name === 'CUTTING' || data.process.name === 'HANDLE MANUAL' || data.process.name === 'SORTIR HANDLE'"
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <VCol
              cols="12"
              class="d-flex"
              style="margin-bottom: -55px; margin-top: -10px;"
            >
              <div class="ma-sm-4">
                <h6 class="text-sm font-weight-bold mb-3">
                  {{ data.process.name }}
                </h6>
                <h6 class="text-sm font-weight-bold mb-3">
                  A. DETAIL
                </h6>
                <VTable
                  class="ml-4"
                  style="margin-top: -15px;"
                >
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      UKURAN
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td />
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      JENIS POTONGAN
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.cut_type }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      HANDLE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.handle }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      BERAT STANDAR
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.standard_weight }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      BERAT MINIMAL
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.min_weight }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      BERAT MAKSIMAL
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.max_weight }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      NOTE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.note }}</td>
                  </tr>
                </VTable>
              </div>
              <VSpacer />
              <div class="d-flex justify-end">
                <div class="mt-12">
                  <h6 class="text-sm text-center font-weight-bold mb-3">
                    {{ data.line_document_number }}
                  </h6>
                  <VTable>
                    <tr>
                      <td>
                        <VueQrcode :value="data.line_document_number" />
                      </td>
                    </tr>
                  </VTable>
                </div>
              </div>
            </VCol>
          </VCardText>
  
          <VCardText 
            v-if="data.process.name === 'SOFT HANDLE'"
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <VCol
              cols="12"
              class="d-flex"
              style="margin-bottom: -55px; margin-top: -10px;"
            >
              <div class="ma-sm-4">
                <h6 class="text-sm font-weight-bold mb-3">
                  HANDLE SEMI AUTOMATIC
                </h6>
                <h6 class="text-sm font-weight-bold mb-3">
                  A. DETAIL
                </h6>
                <VTable
                  class="ml-4"
                  style="margin-top: -15px;"
                >
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      UKURAN
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      JENIS POTONGAN
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.cut_type }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      JENIS HANDLE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.handle }}</td>
                  </tr>
                  <tr>
                    <td class="text-sm font-weight-bold mb-3 pe-13">
                      NOTE
                    </td>
                    <td class="text-sm font-weight-bold mb-3 pe-3">
                      :
                    </td>
                    <td>{{ data.note }}</td>
                  </tr>
                </VTable>
              </div>
              <VSpacer />
              <div class="d-flex justify-end">
                <div class="mt-12">
                  <h6 class="text-sm text-center font-weight-bold mb-3">
                    {{ data.line_document_number }}
                  </h6>
                  <VTable>
                    <tr>
                      <td>
                        <VueQrcode :value="data.line_document_number" />
                      </td>
                    </tr>
                  </VTable>
                </div>
              </div>
            </VCol>
          </VCardText>
        </div>
        
        <div>
          <VCardText 
            class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
          >
            <VDivider />
            <div
              class="ma-sm-4"
              style="margin-top: 20px;"
            >
              <h6 class="text-sm font-weight-bold mb-3">
                PACKING
              </h6>
              <h6 class="text-sm font-weight-bold mb-3">
                A. QUANTITY
              </h6>
              <VTable
                class="ml-5"
                style="margin-top: -10px;"
              >
                <tr>
                  <td class="text-sm font-weight-bold mb-3 pe-16">
                    BARANG JADI
                  </td>
                  <td class="text-sm font-weight-bold mb-3">
                    :
                  </td>
                  <td />
                </tr>
              </VTable>
  
              <VSpacer class="mt-5" />
              <h6 class="text-sm font-weight-bold mb-3">
                B. DETAIL
              </h6>
              <VTable>
                <tr>
                  <td class="text-sm font-weight-bold mb-3" />
                </tr>
              </VTable>
            </div>
          </VCardText>
  
          <VCardText class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row">
            <VDivider />
            <div class="ma-sm-4">
              <h6 class="text-sm font-weight-bold mb-3">
                DELIVERY
              </h6>
              <h6 class="text-sm font-weight-bold mb-3">
                A. DETAIL
              </h6>
              <VTable
                class="ml-5"
                style="margin-top: -10px;"
              >
                <tr>
                  <td class="text-sm font-weight-bold mb-3 pe-2">
                    ORDER CUSTOMER
                  </td>
                  <td class="text-sm font-weight-bold mb-3">
                    :
                  </td>
                  <td>{{ customerAccount }}</td>
                </tr>
                <tr>
                  <td class="text-sm font-weight-bold mb-3 pe-2">
                    TOLERANSI KIRIM
                  </td>
                  <td class="text-sm font-weight-bold mb-3">
                    :
                  </td>
                  <td>{{ shippingTolerance }}</td>
                </tr>
                <tr>
                  <td class="text-sm font-weight-bold mb-3 pe-2">
                    STATUS PO
                  </td>
                  <td class="text-sm font-weight-bold mb-3">
                    :
                  </td>
                  <td>{{ status }}</td>
                </tr>
                <tr>
                  <td class="text-sm font-weight-bold mb-3 pe-2">
                    ALAMAT PENGIRIMAN
                  </td>
                  <td class="text-sm font-weight-bold mb-3">
                    :
                  </td>
                  <td />
                </tr>
              </VTable>
            </div>
          </VCardText>

          <VCardText>
            <VDivider />
            <VTable
              class="table table-borderless table-sm signature-table"
              style="margin-top: 50px"
            >
              <tr class="text-center">
                <td>Dibuat oleh</td>
                <td>Diperiksa oleh</td>
                <td>Disetujui oleh</td>
              </tr>
              <tr style="height: 70px" />
              <tr class="text-center">
                <td>( Planner PPIC )</td>
                <td>
                  ( Manager PPIC )
                  ( Manager QA/QC )
                  ( PPE )
                </td>
                <td>( Plant Head )</td>
              </tr>
            </VTable>
          </VCardText>
        </div>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@media print {
  @page {margin-left: -10px; margin-bottom: 8%; margin-top: 3%; margin-right: -10px; size: auto;}
}
</style>

<route lang="yaml">
  meta:
    layout: blank
    action: Read
    subject: SPK
    redirectIfLoggedIn: false
</route>
