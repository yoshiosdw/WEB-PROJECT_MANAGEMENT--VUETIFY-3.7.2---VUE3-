import { defineStore } from "pinia"

export const useMaintenanceStore = defineStore('maintenanceStore', {
  id: 'maintenanceStore',
  state: () => ({
    asset: null,
    find: '',
  }),
  actions: {
    setAssets(newAsset) {
      this.asset = newAsset
    },
  },
})
