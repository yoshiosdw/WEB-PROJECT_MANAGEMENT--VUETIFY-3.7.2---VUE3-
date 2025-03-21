<script setup>
import axiosIns from "@/plugins/axios"
import ability from '@/plugins/casl/ability'
import { themeConfig } from "@themeConfig"
import axios from "axios"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"
import { usePDF } from "vue3-pdfmake"
import AttachDialog from "./attachDialog.vue"
import { useTrialStore } from "./useTrialStore"

const trialStore = useTrialStore()
const trials = ref(null)
const totalTrials = ref(0)
const rowPerPage = ref(10)
const currentPage = ref(1)
const last = ref(0)
const trialName = ref()

const showLoading = ref(false)
const route = useRoute()
const routeId = route.params.id 

const pdfCreate = usePDF({
  autoInstallVFS: true,
})

const imageSrc = ref("")
// const imageName = "sjb.png"
const imageName = "sinarjoyoboyo.png"

const getImageBase64 = async imageUrl => {
  const ret = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  })

  const base64Image = arrayBufferToBase64(ret.data)

  imageSrc.value = `data:image/png;base64,${base64Image}`
}

const arrayBufferToBase64 = buffer => {
  let binary = ""
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  
  return window.btoa(binary)
}

const fetchTrials = async (page, perPage, find) => {
  try {

    showLoading.value = true

    const ret = await axiosIns.get('/trials', {
      headers: {
        'Authorization': "Bearer " + localStorage.getItem("sinarjoAccessToken"),
      },
      params: {
        page: page,
        perPage: perPage,
        find: find,
      },
    })

    trials.value = ret.data.data
    totalTrials.value = ret.data.meta.total
    last.value = ret.data.meta.last
    showLoading.value = false
  } catch(error) {
    showLoading.value = false
    Swal.fire({
      title: "Manufacture",
      text: "Get data trial failed.",
      icon: "error",
    })
  }
}

watchEffect(() => {
  fetchTrials(
    currentPage.value,
    rowPerPage.value,
    trialStore.find,
  )
})

const postedTrial = async id => {
  try {
    const ret = await axiosIns.patch(`trial/posts/${id}`, null )

    fetchTrials(
      currentPage.value,
      rowPerPage.value,
      trialStore.find,
    )
  } catch (error) {
    console.log(error)
  }
}

const confirmPostHandler = trialId => {
  const trial = trials.value.find(w => w.id === trialId)
  if (trial && trial.status === 0) {
    Swal.fire({
      title: "Are you sure ?",
      text: "This will Post data",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "warning",
      confirmButtonText: "Yes, Posted it!",
    }).then(result => {
      if (result.isConfirmed) {
        postedTrial(trialId)
      }
    })
  }
}

const cancelTrial = async id => {
  try {
    const ret = await axiosIns.patch(`trial/cancels/${id}`, null )

    fetchTrials(
      currentPage.value,
      rowPerPage.value,
      trialStore.find,
    )
  } catch (error) {
    console.log(error)
  }
}

const confirmCancelHandler = trialId => {
  const trial = trials.value.find(w => w.id === trialId)
  if (trial && trial.status === 0) {
    Swal.fire({
      title: "Are you sure ?",
      text: "This will Cancel data",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "warning",
      confirmButtonText: "Yes, Cancel it!",
    }).then(result => {
      if (result.isConfirmed) {
        cancelTrial(trialId)
      }
    })
  }
}

const deleteData = async (id, trialDate) => {
  try {
    const ret = await axiosIns.delete(`trials/${id}` )

    fetchTrials(
      currentPage.value,
      rowPerPage.value,
      trialStore.find)
    Swal.fire({
      text: "Delete",
      title: "Manufacture",
      icon: "success",
    })
  } catch (error) {
    Swal.fire({
      title: "Manufacture",
      text: "Delete data failed.",
      icon: "error",
    })
  }
}

const confirmDeleteHandler = trialId => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will deleting data",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "warning",
    confirmButtonText: "Yes, delete it!",
  }).then(result => {
    if (result.isConfirmed) {
      deleteData(trialId)
    }
  })
}

const paginationData = computed(() => {
  const firstIndex = totalTrials.value == 0 ? 0 : (currentPage.value - 1) * rowPerPage.value + 1
  const lastIndex = currentPage.value * rowPerPage.value >= totalTrials.value ? totalTrials.value : currentPage.value * rowPerPage.value
  
  return `Showing ${firstIndex} to ${lastIndex} of ${totalTrials.value} entries`
})

const pdfClickHandler = async trial => {
  console.log(trial)

  const today = new Date()
  const day = String(today.getDate()).padStart(2, "0")
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const year = today.getFullYear()
  const formatedDatePdf = `${day}/${month}/${year}`
  const imageUrl = import.meta.env.BASE_URL + "./" + imageName
  const originalWidth = 95 // Atur sesuai lebar asli gambar
  const originalHeight = 22 // Atur sesuai tinggi asli gambar
  const aspectRatio = originalHeight / originalWidth
  
  await getImageBase64(imageUrl)
  pdfCreate
    .createPdf({
      pageOrientation: "portrait",
      content: [
        {
          table: {
            haderRows: 2,
            widths: ["20%", "40%", "20%", "20%"],
            body: [
              [
                {
                  image: imageSrc.value,
                  width: 100,
                  height: 25,
                  rowSpan: 2,
                  margin: [0, 0, 0, 0],
                  alignment: 'left',
                  paddingLeft: 0,
                },
                {
                  text: "TRIAL / SAMPLE REPORT",
                  style: "title",
                  rowSpan: 2,
                  margin: [0, 4, , 0, 0],
                },
                { text: "No. Dokumen/ Rev", fontSize: 9 },
                { text: "F-RND-007 / 002", fontSize: 9 },
              ],
              [
                {},
                {},
                { text: "Tgl. Terbit", fontSize: 9 },
                { text: "02-01-2023", fontSize: 9 },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["100%"],
            body: [
              [
                {
                  text: "Jenis Trial:  " + trial.statusName,
                  border: [1, 0, 1, 0],
                  fillColor: "#DDDDDD",
                  fontSize: 9,
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["21%", "19%", "10%", "20%", "15%", "15%"],
            body: [
              [
                {
                  text: "Nomor",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.document_number, fontSize: 9 },
                {
                  text: "No. SPK",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.spk_number, fontSize: 9 },
                {
                  text: "Tanggal",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.document_date, fontSize: 9 },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["20%", "51%", "14%", "15%"],
            body: [
              [
                {
                  text: "Pelaksana",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: trial.executor.name,
                  fontSize: 9,
                  alignment: "left",
                  border: [0, 0, 1, 1],
                  colSpan: 3,
                },
                {},
                {},
              ],
              [
                {
                  text: "Kode Product (FG)",
                  fontSize: 9,
                  border: [1, 0, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.item_code, fontSize: 9, border: [1, 0, 1, 1] },
                {
                  text: "Family Product",
                  fontSize: 9,
                  border: [1, 0, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {
                  text: trial.family_product,
                  fontSize: 9,
                  border: [1, 0, 1, 1],
                },
              ],
              [
                {
                  text: "Nama Produk (FG)",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {
                  text: trial.item_name,
                  fontSize: 9,
                  alignment: "left",
                  border: [0, 0, 0, 0],
                },
                { text: '',border: [0, 0, 0, 0] },
                {  text: '',border: [0, 1, 1, 1] },
              ],
              [
                {
                  text: "Ukuran",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.size, colSpan: 3, fontSize: 9 },
                {},
                {},
              ],
              [
                {
                  text: "Keterangan",
                  fontSize: 9,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                { text: trial.remark, colSpan: 3, fontSize: 9 },
                {},
                {},
              ],
              [
                {
                  text: "Material yang dibutuhkan (Raw Material, Supporting Material):",
                  colSpan: 4,
                  fontSize: 10,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {},
                {},
                {},
              ],
            ],
          },
        },
        {
          table: {
            widths: ["5%", "25%", "50%", "10%", "10%"],
            body: [
              [
                {
                  text: "NO",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "KODE ITEM",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "NAMA ITEM",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "QTY (Zak)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "QTY (Kg)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
              ],
              ...trial.trial_material.map((material, index) => [
                { text: index + 1, fontSize: 9 },
                { text: material.item_code, fontSize: 9, alignment: "center" },
                { text: material.item_name, fontSize: 9, alignment: "center" },
                { text: material.qty_zack, fontSize: 9, alignment: "center" },
                { text: material.qty_kg, fontSize: 9, alignment: "center" },
              ]),
            ],
          },
        },
        {
          table: {
            widths: ["20%", "40%", "15%", "25%"],
            body: [
              [
                {
                  text: "Sesuai dengan persetujuan PPIC:",
                  colSpan: 4,
                  fontSize: 10,
                  border: [1, 0, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {},
                {},
                {},
              ],
            ],
          },
        },
        {
          table: {
            widths: ["25%", "20%", "10%", "25%", "20%"],
            body: [
              [
                {
                  text: "PROSES SAMPLE",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "TANGGAL",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "SHIFT",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "NOMOR MESIN",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "DURASI",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
              ],
              ...trial.trial_approve.map(approve => [
                {
                  text: approve.process.name,
                  fontSize: 9,
                  alignment: "center",
                  bold: true,
                },
                { text: approve.transaction_date,alignment: "center", fontSize: 9, bold: true },
                { text: approve.shift, fontSize: 9, alignment: "center" },
                {
                  text: approve.machine_number,
                  fontSize: 9,
                  alignment: "center",
                },
                {
                  text: approve.duration + " MENIT",
                  fontSize: 9,
                  alignment: "center",
                },
              ]),
            ],
          },
        },
        {
          table: {
            widths: ["20%", "40%", "15%", "25%"],
            body: [
              [
                {
                  text: "FORMULASI / KOMPOSISI:",
                  colSpan: 4,
                  border: [1, 0, 1, 1],
                  fillColor: "#DDDDDD",
                  fontSize: 10,
                  bold: true,
                },
                {},
                {},
                {},
              ],
            ],
          },
        },
        {
          table: {
            widths: ["5%", "25%", "50%", "10%", "10%"],
            body: [
              [
                {
                  text: "NO",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "KODE ITEM",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "NAMA ITEM",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "KG",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "%",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
              ],
              ...trial.composition.map((composition, index) => [
                { text: index + 1, fontSize: 9, alignment: "left" },
                {
                  text: composition.item_code,
                  fontSize: 9,
                  alignment: "center",
                },
                {
                  text: composition.item_name,
                  fontSize: 9,
                  alignment: "center",
                },
                { text: composition.tonase, fontSize: 9, alignment: "center" },
                {
                  text: composition.percentage,
                  fontSize: 9,
                  alignment: "center",
                },
              ]),
            ],
          },
        },
        {
          table: {
            widths: ["20%", "40%", "15%", "25%"],
            body: [
              [
                {
                  text: "SETTING PARAMETER MESIN",
                  border: [1, 0, 1, 1],
                  colSpan: 4,
                  fontSize: 10,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {},
                {},
                {},
              ],
            ],
          },
        },
        {
          table: {
            widths: ["5%", "55%", "20%", "20%"],
            body: [
              ...((trial.trial_machine && trial.trial_machine.length > 0) ? trial.trial_machine.flatMap((machine, index) => [
                [
                  {
                    text: String.fromCharCode(65 + index) + ".",
                    fontSize: 9,
                    bold: true,
                    alignment: "right",
                    border: [1, 0, 0, 1],
                  },
                  {
                    text: machine?.process?.name || '',
                    fontSize: 9,
                    bold: true,
                    alignment: "left",
                    border: [0, 0, 0, 1],
                  },
                  {
                    text: "No. MESIN",
                    fontSize: 9,
                    alignment: "center",
                    bold: true,
                    fillColor: "#DDDDDD",
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: machine?.machine_number || '',
                    fontSize: 9,
                    alignment: "center",
                    border: [1, 0, 1, 1],
                  },
                ],
                [
                  {
                    text: "NO",
                    fontSize: 10,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: "KETERANGAN",
                    fontSize: 10,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: "PARAMETER",
                    fontSize: 10,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: "SATUAN",
                    fontSize: 10,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  //  {
                  //   text: "AMPERE",
                  //   fontSize: 10,
                  //   alignment: "center",
                  //   bold: true,
                  //   border: [1, 0, 1, 1],
                  // },
                ],
                ...(machine?.parameter && machine.parameter.length > 0 ? machine.parameter.map((param, paramIndex) => [
                  {
                    text: paramIndex + 1,
                    fontSize: 9,
                    alignment: "left",
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: param?.name || '',
                    fontSize: 9,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  {
                    text: param?.parameter || '',
                    fontSize: 9,
                    alignment: "center",
                    bold: true,
                    border: [1, 0, 1, 1],
                  },
                  // {
                  //   text: param?.ampere || '',
                  //   fontSize: 9,
                  //   alignment: "center",
                  //   border: [1, 0, 1, 1],
                  // },
                  {
                    text: param?.unit_of_measures?.code || '',
                    fontSize: 9,
                    alignment: "center",
                    border: [1,0,1,1],
                  },
                ]) : [[
                  {
                    text: '',
                    fontSize: 9,
                    alignment: "center",
                    colSpan: 4,
                    border: [1, 0, 1, 1],
                  },
                  {},
                  {},
                  {},
                ]]),
              ]) : [[
                {
                  text: 'Data not available',
                  fontSize: 9,
                  alignment: "center",
                  colSpan: 4,
                  border: [1, 0, 1, 1],
                },
                {},
                {},
                {},
              ]]),
            ],
          },
        },
        {
          table: {
            widths: ["100%"],
            color: "#D8BFD8",
            body: [
              [
                {
                  text: "HASIL TRIAL ",
                  border: [1, 0, 1, 1],
                  fontSize: 10,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["15%", "15%", "20%", "15%", "15%", "20%"],
            body: [
              [
                {
                  text: "PRODUKSI",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "HASIL /SHIFT(Kg)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "WASTE(Kg)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "TARGET WASTE(Kg)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "AMPERE",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "OPERATOR(ORANG)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
              ],
              ...trial.trial_machine
                .map(machine => {
                  return machine.result.map(result => [
                    { text: result.process.name, fontSize: 9, bold: true },
                    {
                      text: result.result_per_shift_in_kg,
                      fontSize: 9,
                      alignment: "center",
                    },
                    {
                      text: result.waste_in_kg,
                      fontSize: 9,
                      alignment: "center",
                    },
                    {
                      text: result.waste_target_in_percentage,
                      fontSize: 9,
                      alignment: "center",
                    },
                    { text: result.ampere, fontSize: 9, alignment: "center" },
                    {
                      text: result.operator_number,
                      fontSize: 9,
                      alignment: "center",
                    },
                  ])
                })
                .flat(), // Use flat() to flatten the array of arrays
            ],
          },
        },
        {
          table: {
            widths: ["20%", "40%", "15%", "25%"],
            body: [
              [
                {
                  text: "KEBERTERIMAAN/ACCEPTANCE/HASIL LAB",
                  colSpan: 4,
                  border: [1, 0, 1, 1],
                  fontSize: 10,
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {},
                {},
                {},
              ],
            ],
          },
        },
        {
          table: {
            widths: ["5%", "30%", "25%", "20%", "20%"],
            body: [
              [
                {
                  text: "NO",
                  fontSize: 10,
                  alignment: "left",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "KRITERIA",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "STANDAR KUALITAS",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "AKTUAL KUALITAS",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
                {
                  text: "SESUAI STANDART(YES/NO)",
                  fontSize: 10,
                  alignment: "center",
                  bold: true,
                  border: [1, 0, 1, 1],
                },
              ],
              ...trial.acceptance_result.map((acceptance_result, index) => [
                { text: index + 1, fontSize: 9 },
                {
                  text: acceptance_result.criteria.name,
                  fontSize: 9,
                  bold: true,
                  alignment: "center",
                },
                {
                  text: acceptance_result.standard,
                  fontSize: 9,
                  bold: true,
                  alignment: "center",
                },
                {
                  text: acceptance_result.actual,
                  fontSize: 9,
                  bold: true,
                  alignment: "center",
                },
                {
                  text: acceptance_result.approved === 1 ? "Yes" : "No",
                  fontSize: 9,
                  alignment: "center",
                },
              ]),
            ],
          },
        },
        {
          table: {
            widths: ["100%"],
            body: [
              [
                {
                  text: "CATATAN : ",
                  border: [1, 0, 1, 0],
                  fontSize: 9,
                  bold: true,
                  style: "content",
                  italics: true,
                },
              ],
              [{ text: trial.trial_note, border: [1, 0, 1, 0] }],
              [{ text: "", border: [1, 0, 1, 0] }],
              [{ text: "", border: [1, 0, 1, 0] }],
            ],
          },
        },
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                {
                  text: "Yang Membuat,",
                  fontSize: 10,
                  alignment: "center",
                  border: [1, 1, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {
                  text: "Menyetujui,",
                  fontSize: 10,
                  alignment: "center",
                  border: [1, 1, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {
                  text: "Menyetujui,",
                  fontSize: 10,
                  alignment: "center",
                  border: [1, 1, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
                {
                  text: "Mengetahui,",
                  fontSize: 10,
                  alignment: "center",
                  border: [1, 1, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["25%", "25%", "25%", "25%"],
            body: [
              [
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
              ],
              [
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
              ],
              [
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
              ],
              [
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
              ],
              [
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
                { text: "", border: [1, 0, 1, 0] },
              ],
              [
                { text: "", border: [1, 0, 1, 1] },
                { text: "", border: [1, 0, 1, 1] },
                { text: "", border: [1, 0, 1, 1] },
                { text: "", border: [1, 0, 1, 1] },
              ],
              [
                {
                  text: "(                              )",
                  border: [1, 0, 1, 0],
                  alignment: "center",
                },
                {
                  text: "(                            )",
                  border: [1, 0, 1, 0],
                  alignment: "center",
                },
                {
                  text: "(                             )",
                  border: [1, 0, 1, 0],
                  alignment: "center",
                },
                {
                  text: "(                            )",
                  border: [1, 0, 1, 0],
                  alignment: "center",
                },
              ],
              [
                {
                  text: "R&D",
                  border: [1, 0, 1, 1],
                  alignment: "center",
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: "PPIC",
                  border: [1, 0, 1, 1],
                  alignment: "center",
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: "Plant Head",
                  border: [1, 0, 1, 1],
                  alignment: "center",
                  fontSize: 9,
                  bold: true,
                },
                {
                  text: "GM Manufacture",
                  border: [1, 0, 1, 1],
                  alignment: "center",
                  fontSize: 9,
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["100%"],
            body: [
              [
                {
                  text: "COSTING APPROVAL",
                  fontSize: 10,
                  border: [1, 0, 1, 1],
                  fillColor: "#DDDDDD",
                  bold: true,
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["50%", "25%", "25%"],
            body: [
              [
                {
                  text: "Alasan Tidak Disetujui :",
                  fontSize: 8,
                  border: [1, 0, 1, 1],
                  italics: true,
                  bold: true,
                },
                {
                  text: "Yang Menghitung,",
                  fontSize: 9,
                  alignment: "center",
                  border: [1, 0, 1, 1],
                  bold: true,
                },
                {
                  text: "Menyetujui,",
                  fontSize: 9,
                  alignment: "center",
                  border: [1, 0, 1, 1],
                  bold: true,
                },
              ],
              [
                { text: "", border: [1, 0, 1, 1], rowSpan: 11 },
                { text: "", border: [1, 0, 1, 1], rowSpan: 7 },
                { text: "", border: [1, 0, 1, 1], rowSpan: 7 },
              ],
              [{}, {}, {}],
              [{}, {}, {}],
              [{}, {}, {}],
              [{}, {}, {}],
              [{}, {}, {}],
              [{}, {}, {}],
              [
                {},
                { text: "", border: [1, 0, 1, 1], rowSpan: 3 },
                { text: "", border: [1, 0, 1, 1], rowSpan: 3 },
              ],
              [{}, {}, {}],
              [{}, {}, {}],
              [
                {},
                {
                  text: "Staff Costing",
                  border: [1, 0, 1, 1],
                  fontSize: 8,
                  alignment: "center",
                  bold: true,
                },
                {
                  text: "Accounting Dept. Head",
                  border: [1, 0, 1, 1],
                  fontSize: 8,
                  alignment: "center",
                  bold: true,
                },
              ],
            ],
          },
        },
      ],
      styles: {
        logo: {
          width: 90,
          height: 20,
        },
        title: {
          fontSize: 12,
          bold: true,
          alignment: "center",
        },
        content: {
          height: 50,
        },
      },
    })
    .download("trial-report.pdf")
}

const downloadFile = async id => {
  showLoading.value = true
  try {
    const response = await axiosIns.get(`/trials/download/${id}`, {
      responseType: 'blob',
      
    })

    const ret = await axiosIns.get(`/trials/${id}` )

    trialName.value = ret.data.data[0].attachment

    showLoading.value = false
    saveAs(response.data, trialName.value)

    // saveAs(response.data, 'Trial_Report')
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: 'Download file failed',
      icon: 'error',
    })
    showLoading.value = false
    console.log(error)
  }
}

const truncateText = text => {
  return `${text.substring(0, 6)}...`
}

const resolveAttachVariant = attachment => {
  if (attachment !== null)
    return {
      text: attachment,
      color: 'success',
    }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VOverlay v-model="showLoading" />
      <Resume />
      <VSpacer class="mt-5" />
      <VCard :show-loading="showLoading">
        <VCardText class="d-flex flex-wrap py-4 gap-1">
          <div
            class="me-6"
            style="width: 70px;"
          >
            <VSelect
              v-model="rowPerPage"
              density="compact"
              variant="outlined"
              :items="[10, 20, 30, 50]"
            />
          </div>

          <VSpacer />
          <div class="d-flex flex-wrap gap-4">
            <div style="width: 33rem">
              <VTextField
                v-model="trialStore.find"
                placeholder="Search by Document Number"
                density="compact"
              />
            </div>

            <VBtn
              v-if="ability.can('Manage', 'Trial')"
              prepend-icon="tabler-plus"
              :to="{ name: 'trial-add' }"
            >
              Create New
            </VBtn>
          </div>
        </VCardText>

        <VDiver />
        <VTable class="text-no-wrap">
          <thead
            class="text-uppercase"
            style="background-color: #efefef"
          >
            <tr>
              <th scope="col">
                Action
              </th>
              <th scope="col">
                Document Number
              </th>
              <th scope="col">
                Document Date
              </th>
              <th scope="col">
                Item
              </th>
              <th scope="col">
                Name
              </th>
              <th scope="col">
                Type
              </th>
              <th scope="col">
                Keterangan
              </th>
              <th scope="col">
                Executor
              </th>
              <th scope="col">
                Status
              </th>
              <th scope="col">
                Attachment
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="trial in trials"
              :key="trial.id"
            >
              <td
                class="text-center"
                style="width: 5.5rem"
              >                
                <VBtn
                  title="Cancel"
                  icon
                  variant="none"
                  color="error"
                  density="compact"
                  :disabled="trial.statusDetail !== 'Open'"
                  @click="confirmCancelHandler(trial.id)"
                >
                  <VIcon
                    icon="tabler:rotate-clockwise"
                    color="error"
                  />
                </VBtn>
                <VBtn
                  v-if="ability.can('Manage', 'Trial')"
                  title="Edit"
                  icon
                  variant="none"
                  color="error"
                  density="compact"
                  :to="{ name: 'trial-id', params: {id: trial.id} }"
                  :disabled="trial.statusDetail !== 'Open'"
                >
                  <VIcon
                    icon="tabler:edit"
                    color="warning"
                  />
                </VBtn>
                <VBtn
                  icon
                  variant="none"
                  density="compact"
                  color="success"
                  title="More Action"
                >
                  <VIcon icon="tabler-dots-vertical" />
                  <VMenu activator="parent">
                    <VList width="10rem">
                      <VListItem
                        v-if="trial.statusDetail == 'Open' && ability.can('Post', 'Trial Costing') "
                        @click="confirmPostHandler(trial.id)"
                      >
                        <VIcon
                          icon="tabler-check"
                          color="success"
                        />
                        Approve
                      </VListItem>
                      <VListItem
                        v-if="ability.can('Manage', 'Trial Attach Lab Result') && trial.statusDetail !== 'Cancel' && trial.statusDetail !== 'Posted'"
                        class="pointer-cursor"
                      >
                        <template #prepend>
                          <VIcon
                            icon="tabler-cloud-upload"
                            color="warning"
                            style="margin-right: 6px"
                          />
                        </template>
                        <AttachDialog :data="trial" />
                      </VListItem>
                      <VListItem @click="pdfClickHandler(trial)">
                        <VIcon
                          icon="tabler-pdf"
                          color="info"
                        />
                        Download
                      </VListItem>
                      <!--
                        <VListItem :to="{name: 'trial-detail-detail', params: {detail: trial.id}}"
                        v-if="trial.statusDetail == 'Posted' || trial.statusDetail == 'Cancel'"
                        >
                        <VIcon
                        icon="tabler-eye"
                        color="warning"
                        />
                        View
                        </VListItem> 
                      -->
                      <VListItem :to="{name: 'trial-detail-detail', params: {detail: trial.id}}">
                        <VIcon
                          icon="tabler-eye"
                          color="warning"
                        />
                        View
                      </VListItem>
                      <!-- <VDivider /> -->
                      <!-- <VListItem
                        v-if="trial.statusDetail == 'Open' && ability.can('Manage', 'Trial')"
                        @click="confirmDeleteHandler(trial.id)"
                      >
                        <VIcon
                          icon="tabler-trash"
                          color="error"
                        />
                        Delete
                      </VListItem> -->
                    </VList>
                  </VMenu>
                </VBtn>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <!--
                      <RouterLink
                      :to="{
                      name: 'trial-id',
                      params: { id: trial.id },
                      }"
                      > 
                    -->
                    <p class="text-base">
                      {{ trial.document_number }}
                    </p>
                    <!-- </RouterLink> -->
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ trial.document_date }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base text-uppercase">
                      {{ trial.item_code }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base text-uppercase text-no-wrap">
                      {{ trial.item_name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ trial.statusName }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p class="text-base">
                      {{ trial.remark }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p
                      v-if="trial.executor"
                      class="text-base"
                    >
                      {{ trial.executor.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td>
                <div class="d-flex align-center">
                  <div class="d-flex flex-column">
                    <p
                      v-if="trial.executor"
                      class="text-base"
                    >
                      {{ trial.statusDetail }}
                    </p>
                  </div>
                </div>
              </td>
              <td
                style="word-wrap: break-word;"
                class="text-wrap"
              >
                <div
                  class="d-flex flex-column text-wrap"
                  @click="downloadFile(trial.id)"
                >
                  <VChip
                    v-if="trial.attachment !== null"
                    :color="resolveAttachVariant(trial.attachment).color"
                    size="small"
                  >
                    {{ truncateText(trial.attachment) }}
                  </VChip>
                  <template v-else>
                    {{ trial.attachment }}
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </VTable>
        <VCardText class="d-flex align-center flex-wrap justify-space-between gap-4 py-3 px-5">
          <span class="text-sm text-disabled">
            {{ paginationData }}
          </span>

          <VPagination
            v-model="currentPage"
            size="small"
            :total-visible="5"
            :length="last"
          />
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style>
.pointer-cursor {
  cursor: pointer;
}
</style>

<route lang="yaml">
  meta:
    action: Read
    subject: Trial
    redirectIfLoggedIn: false
</route>
