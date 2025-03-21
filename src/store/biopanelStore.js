// store/notificationStore.js
import { defineStore } from 'pinia'

export const useBioPanelStore = defineStore('bioPanel', {
  state: () => ({
    // showUserBioPanel: true,
    showUserBioPanel: JSON.parse(localStorage.getItem('showUserBioPanel')) ?? true,
  }),
  actions: {
    toggleShowUserBioPanel() {
      this.showUserBioPanel = !this.showUserBioPanel
    },
  },
})
