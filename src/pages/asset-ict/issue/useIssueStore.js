import { defineStore } from "pinia"

export const useIssueStore = defineStore('issueStore', {
  id: 'issueStore',
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
