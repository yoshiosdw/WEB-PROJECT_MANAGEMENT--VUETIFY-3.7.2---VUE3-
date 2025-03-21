import '@/@fake-db/db'
import '@/@iconify/icons-bundle'
import App from '@/App.vue'
import '@/assets/notification.scss'
import ability from '@/plugins/casl/ability'
import i18n from '@/plugins/i18n'
import layoutsPlugin from '@/plugins/layouts'
import vuetify from '@/plugins/vuetify'
import { loadFonts } from '@/plugins/webfontloader'
import router from '@/router'
import { abilitiesPlugin } from '@casl/vue'
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueBlockTree from 'vue3-blocks-tree'
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css'
import { PDFPlugin } from 'vue3-pdfmake'
import axiosIns from './plugins/axios'
import { useNotificationsStore } from './store/notificationStore'

import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

import Toast, { POSITION, useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import socket from './socket'
import { useEmailStore } from './views/apps/email/useEmailStore'


let defaultOptions = { treeName: 'blocks-tree' }

loadFonts()

const app = createApp(App)

// Konfigurasi Laravel Echo dengan Pusher
window.Pusher = Pusher
window.Echo = new Echo({
  broadcaster: 'pusher',

  // key: '6b5f4b7dc9a2f7936413',

  //key pusher 4.200 (development)
  key: '247276ba235e583f320f', 


  // key pusher 0.26 (production)
  // key: '410e148f9a1f7d28702a',
  cluster: 'ap1',
  encrypted: true,
})

// Use plugins
app.use(vuetify)
app.use(createPinia())
app.use(router)
app.use(layoutsPlugin)
app.use(i18n)
app.use(abilitiesPlugin, ability, {
  useGlobalProperties: true,
})
app.use(PDFPlugin)
app.use(VueBlockTree, defaultOptions)

app.use(Toast, {
  position: POSITION.TOP_LEFT,
})

// Mount vue app
app.mount('#app')

const userData = JSON.parse(localStorage.getItem('sinarjoUserData'))
const notificationsStore = useNotificationsStore()

notificationsStore.setNotifications([])

const toast = useToast()
const emailStore = useEmailStore()


// socket.on("emailSent", data => {
//   console.log("Received emailSent event:", data)

//   // const toast = useToast()
  
//   toast.success(`New email: ${data.subject}`, {
//     timeout: 20000,
//     onClick: () => {
//       router.push({ path: `/emails/${data.id}` })
//     },
//     toastClassName: 'toast-notification',
//   })

//   emailStore.fetchEmails()

//   notificationsStore.addNotification({
//     id: data.id,
//     message: `New email: ${data.subject}`,
//     created_at: new Date().toISOString(),
//     status: 0,
//   })
// })
socket.on("notifSAT", data => {
  console.log("🔍 processed_by_sat:", data?.processed_by)


  if (
    userData && 
    (data.status_name === "Revoked" || (data.job_order?.created_by === userData.id)) && 
    ability.can('Posting', 'BOA SAT Task')
  ) {
    console.log("✅ Syarat terpenuhi, menjalankan proses...")

    const toast = useToast()
    let toastMessage = data.status_name === "Revoked" ? "SAT REVOKED" : "SAT REJECTED"

    toast.info(toastMessage, { timeout: 20000, toastClassName: 'toast-notification' })

    let postData = data.status_name === "Revoked"
      ? {
        sat_number: data?.document_number,
        jo_number: data?.bill_number,
        job_order_task_id: data?.job_order_task?.id,
        note_sat: data?.job_order_task?.note,
        created_by_sat: data?.created_by,
        processed_by_sat: data?.processed?.person?.name,
        status_sat: data?.status_name,
      }
      : {
        sat_number: data?.job_order?.document_number,
        jo_number: data?.job_order?.bill_number,
        job_order_task_id: data?.id,
        note_sat: data?.note,
        created_by_sat: data?.job_order?.created_by,
        processed_by_sat: data?.processed?.person?.name,
        status_sat: data?.status_name,
      }

    console.log("🔄 Mengirim data ke server:", postData)

    axiosIns.post('/notifications', postData)
      .then(response => {
        console.log("✅ Data berhasil dikirim:", response.data)
        notificationsStore.notifTrigger++
      })
      .catch(error => {
        console.error("❌ Gagal mengirim data:", error.response?.data || error.message)
      })

    let notifData = data.status_name === "Revoked"
      ? {
        id: data.id, 
        from: data?.processed?.person?.name,
        NomerSat: data?.document_number,
        created_at: data?.updated_at, 
        message: data?.status_name,
      }
      : {
        id: data.id, 
        from: data?.processed?.person?.name,
        NomerSat: data?.job_order?.document_number,
        created_at: data.updated_at, 
        message: data.status_name,
      }

    console.log("📩 Menambahkan notifikasi ke store:", notifData)
    
    notificationsStore.addNotifSAT(notifData)

  } else {
    console.warn("⚠️ Syarat tidak terpenuhi, toast tidak ditampilkan.")
  }
})

// Listen for Pusher events
window.Echo.channel('tickets')
  .listen('TicketCreated', data => {
    console.log('Received Pusher Event:', data)

    

    // Periksa role pengguna
    if ((ability.can('Approver', 'ICT Ticket')) && data.department === 'ICT') {
      const toast = useToast()

      toast.success(`New ticket created: ${data.documentNumber}`, {
        timeout: 20000,  // Set timeout to 10 seconds for this toast
        onClick: () =>{
          router.push({ path: `/ticket/id/${data.id}` })
        },
        toastClassName: 'toast-notification',
      })

      axiosIns.post('/notifications', {
        ticket_number: data.documentNumber,
        message: data.message,
        department: data.department,
        ticket_id : data.id,
      }, {
        
      })
  
      notificationsStore.addNotification({
        id: data.id, // Pastikan ID unik
        message: `New ticket : ${data.documentNumber}`,
        department: data.department,
        created_at: new Date().toISOString(),
        status: 0,
      })
    }
    if ((userData && userData.role === 'General Affair') && data.department === 'GA') {
      const toast = useToast()

      toast.success(`New ticket created: ${data.documentNumber}`, {
        timeout: 20000,  // Set timeout to 10 seconds for this toast
        onClick: () =>{
          router.push({ path: `/ticket/ga/id/${data.id}` })
        },
        toastClassName: 'toast-notification',
      })

      axiosIns.post('/notifications', {
        ticket_number: data.documentNumber,
        message: data.message,
        department: data.department,
        ticket_id : data.id,
      }, {
        
      })
  
      notificationsStore.addNotification({
        id: data.id, // Pastikan ID unik
        message: `New ticket : ${data.documentNumber}`,
        department: data.department,
        created_at: new Date().toISOString(),
        status: 0,
      })
    }
  })
  .listen('TicketApproved', data => {
    console.log('Received TicketApproved Event:', data)


    if (userData && (data.personInChargeId === userData.id && userData.role === 'ICT Staff')) {
      const toast = useToast()

      toast.info(`New Ticket Assign To Me`, {
        timeout: 20000,  // Set timeout to 10 seconds for this toast
        onClick: () =>{
          router.push({ path: `ticket/assignto/${data.ticketId}` })
        }, 
        toastClassName: 'toast-notification',
      })
      axiosIns.post('/notifications', {
        ticket_number: data.documentNumber,
        message: 'Assign To Me',
        department: data.department || '-',
        person_in_charge_id: data?.personInChargeId,
        ticket_id: data.ticketId,
      }, {
        
      })

      notificationsStore.addNotification({
        id: data.id, // Pastikan ID unik
        message: `Assign To Me : ${data.documentNumber}`,
        department: data.department,
        created_at: new Date().toISOString(), 
        status: 0,
      })
    }
    
    if(userData && (data.personInChargeId === userData.id && userData.role === 'General Affair')) {
      const toast = useToast()

      toast.info(`New Ticket Assign To Me`, {
        timeout: 20000,  // Set timeout to 10 seconds for this toast
        onClick: () =>{
          router.push({ path: `ticket/ga/detail/${data.ticketId}` })
        }, 
        toastClassName: 'toast-notification',
      })
      axiosIns.post('/notifications', {
        ticket_number: data.documentNumber,
        message: 'Assign To Me',
        department: data.department || '-',
        person_in_charge_id: data.personInChargeId,
      }, {
        
      })
  
      notificationsStore.addNotification({
        id: data.id, // Pastikan ID unik
        message: `Assign To Me : ${data.documentNumber}`,
        department: data.department,
        created_at: new Date().toISOString(), 
        status: 0,
      })
    }
    
  })


// window.Echo.channel('inboxDelete')
//   .listen('inboxDelete', data => {
//     console.log('Received inboxDelete Event:', data)

//     if (data.message === "Delete Success") {
//       notificationsStore.removeNotification()
//       console.log('Notification removed from store')
//     }
//   })
