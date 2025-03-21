import { defineStore } from "pinia";

export const useItemStore = defineStore("itemStore", {
  id: "itemStore",
  state: () => ({
    item: null,
    find: "",
  }),
});
