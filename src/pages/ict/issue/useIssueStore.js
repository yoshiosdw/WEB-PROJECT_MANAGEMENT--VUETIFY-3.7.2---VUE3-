import { defineStore } from "pinia";

export const useIssueStore = defineStore('issueStore', {
    id: 'issueStore',
    state: () => ({
        issue: null,
        find: ''
    }),
    actions: {
      setIssue(newIssue) {
        this.issue = newIssue;
      }
    }
})
