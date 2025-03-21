import { defineStore } from "pinia";

export const useVendorStore = defineStore('vendorStore', {
    id: 'vendorStore',
    state: () => ({
        vendor: null,
        find: ''
    }),
    actions: {
      setVendor(newVendor) {
        this.vendor = newVendor;
      }
    }
})
