import { defineStore } from "pinia";

export const useUomStore = defineStore('uomStore', {
    id: 'uomStore',
    state: () => ({
        uom: null,
        find: ''
    }),
    actions: {
      setUom(newUom) {
        this.uom = newUom;
      }
    }
})
