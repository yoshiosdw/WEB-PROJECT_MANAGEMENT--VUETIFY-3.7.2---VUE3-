import { defineStore } from "pinia";

export const useItemStore = defineStore('itemStore', {
    id: 'itemStore',
    state: () => ({
        item: null,
        find: ''
    }),
    actions: {
      setItem(newItem) {
        this.item = newItem;
      }
    }
})
