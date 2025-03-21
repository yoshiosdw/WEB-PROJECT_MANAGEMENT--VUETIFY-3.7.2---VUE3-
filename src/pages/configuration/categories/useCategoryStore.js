import { defineStore } from "pinia";

export const useCategoryStore = defineStore('categoryStore', {
    id: 'categoryStore',
    state: () => ({
        category: null,
        find: ''
    }),
    actions: {
      setCategory(newCategory) {
        this.category = newCategory;
      }
    }
})
