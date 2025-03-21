import { defineStore } from "pinia"

export const useSalesOrderLineStore = defineStore('salesOrderLineStore', {
  id: 'salesOrderLineStore',
  state: () => ({
    salesOrderLine: null,
    find: ''
  })
})