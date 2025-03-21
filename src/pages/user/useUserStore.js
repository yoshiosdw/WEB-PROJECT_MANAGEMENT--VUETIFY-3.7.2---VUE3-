import { defineStore } from "pinia"

export const useUserStore = defineStore('userStore', {
  id: 'userStore',
  state: () => ({
    user: null,
    find: ''
  })
})