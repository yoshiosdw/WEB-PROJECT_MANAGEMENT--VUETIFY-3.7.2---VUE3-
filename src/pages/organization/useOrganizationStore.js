import { defineStore } from "pinia"

export const useOrganizationStore = defineStore('organizationStore', {
  id: 'organizationStore',
  state: () => ({
    organizations: null
  })
})