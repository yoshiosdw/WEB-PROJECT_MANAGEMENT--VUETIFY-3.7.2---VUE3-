import { defineStore } from "pinia"

export const usePersonStore = defineStore('personStore', {
  id: 'personStore',
  state: () => ({
    person: null,
    find: ''
  })
})