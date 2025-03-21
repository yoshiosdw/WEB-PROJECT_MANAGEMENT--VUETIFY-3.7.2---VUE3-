import { defineStore } from "pinia"

export const useLocationStore = defineStore('locationStore', {
  id: 'locationStore',
  state: () => ({
    locations: null,
  }),
})