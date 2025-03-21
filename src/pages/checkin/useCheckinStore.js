import { defineStore } from "pinia"

export const useCheckinStore = defineStore('checkinStore', {
  id: 'checkinStore',
  state: () => ({
    chechout: null,
    find: '',
  }),
})
