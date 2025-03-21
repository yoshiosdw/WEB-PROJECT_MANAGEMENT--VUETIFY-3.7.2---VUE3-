import { defineStore } from "pinia"

export const useReturStore = defineStore('returStore', {
  id: 'returStore',
  state: () => ({
    retur: null,
    find: ''
  })
})