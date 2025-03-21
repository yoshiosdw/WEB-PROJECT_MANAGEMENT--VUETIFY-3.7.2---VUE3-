import { defineStore } from "pinia";

export const useSpkStore = defineStore("spkStore", {
  id: "spkStore",
  state: () => ({
    spk: null,
    from: getTwoDaysAgo(),
    to: getToday(),
    find: "",
  }),
});

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
};

const getTwoDaysAgo = () => {
  const today = new Date();
  const fiveDayAgo = new Date(today);
  fiveDayAgo.setDate(today.getDate() - 10);
  const year = fiveDayAgo.getFullYear();
  const month = (fiveDayAgo.getMonth() + 1).toString().padStart(2, "0");
  const day = fiveDayAgo.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
};
