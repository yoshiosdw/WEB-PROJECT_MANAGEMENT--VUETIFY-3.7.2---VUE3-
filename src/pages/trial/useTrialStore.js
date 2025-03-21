import { defineStore } from "pinia";

export const useTrialStore = defineStore("trialStore", {
  id: "trialStore",
  state: () => ({
    trial: null,
    machine: null,
    fromDate: getTwoDaysAgo(),
    toDate: getToday(),
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
  fiveDayAgo.setDate(today.getDate() - 2);
  const year = fiveDayAgo.getFullYear();
  const month = (fiveDayAgo.getMonth() + 1).toString().padStart(2, "0");
  const day = fiveDayAgo.getDate().toString().padStart(2, "0");

  return year + "-" + month + "-" + day;
};
