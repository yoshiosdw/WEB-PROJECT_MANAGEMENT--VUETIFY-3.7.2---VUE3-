<script setup>
import axiosIns from "@/plugins/axios"
import { themeConfig } from "@themeConfig"
import Swal from "sweetalert2"
import { useRoute } from "vue-router"

const users = ref()
const route = useRoute()
const userId = ref(route.params.id)

const fetchUser = async id => {
  try{
    const ret = await axiosIns.get(`users/${id}` )

    users.value = ret.data.data[0]
  } catch(error) {
    Swal.fire({
      title: themeConfig.app.title,
      text: "Get data user failed.",
      icon: 'error',
    })
    console.log(error)
  }
}

watchEffect(() => {
  fetchUser(userId.value)
})
</script>

<template>
</template>

<route lang="yaml">
  meta:
    action: Manage
    subject: User
    redirectIfLoggedIn: false
  </route>
