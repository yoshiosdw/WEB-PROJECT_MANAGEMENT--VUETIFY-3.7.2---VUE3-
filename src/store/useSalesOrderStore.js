import { defineStore } from "pinia"

export const useSalesOrderStore = defineStore('salesOrderStore', {
  id: 'salesOrderStore',
  state: () => ({
    salesOrder: null,
    find: ''
  })
})