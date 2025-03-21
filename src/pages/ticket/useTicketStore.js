import { defineStore } from "pinia";

export const useTicket = defineStore("ticketStore", {
  id: "ticketStore",
  state: () => ({
    tickets: null,
    find: ''
  }),
});
