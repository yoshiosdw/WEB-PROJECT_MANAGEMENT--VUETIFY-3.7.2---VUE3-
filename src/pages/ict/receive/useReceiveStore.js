import { defineStore } from "pinia";

export const useReceiveStore = defineStore('receiveStore', {
    id: 'receiveStore',
    state: () => ({
        receive: null,
        find: ''
    }),
    actions: {
      setReceive(newReceive) {
        this.receive = newReceive;
      }
    }
})
