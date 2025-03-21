import axios from '@axios'
import { defineStore } from 'pinia'

export const useUserListStore = defineStore('UserListStore', {
  actions: {
    // 👉 Fetch users data
    fetchUsers(params) { return axios.get('/apps/users/list', { params }) },

    // 👉 Add User
    addUser(sinarjoUserData) {
      return new Promise((resolve, reject) => {
        axios.post('/apps/users/user', {
          user: sinarjoUserData,
        }).then(response => resolve(response))
          .catch(error => reject(error))
      })
    },

    // 👉 fetch single user
    fetchUser(id) {
      return new Promise((resolve, reject) => {
        axios.get(`/apps/users/${id}`)
        .then(response => resolve(response))
        .catch(error => reject(error))
      })
    },
  },
})
