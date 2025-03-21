import { defineStore } from "pinia"

export const useTicket = defineStore("ticketGaStore", {
  id: "ticketGaStore",
  state: () => ({
    tickets: null,
    find: '',
  }),
})
