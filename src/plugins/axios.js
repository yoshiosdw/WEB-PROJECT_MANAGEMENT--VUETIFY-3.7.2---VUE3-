import axios from 'axios'

const axiosIns = axios.create({
  // baseURL: 'http://localhost:8082/api',
  
  baseURL: 'http://100.100.4.200:82/sinarjoyoboyo-api/api',

  // baseURL: 'http://100.100.0.26/sinarjoyoboyo-api/api',
  
  // baseURL: 'http://100.100.0.16/sinarjoyoboyo-api/api',
  headers: {
    'Content-Type':'application/json',
  },
  
  timeout: 60000, //timeout 1 menit
})

axiosIns.interceptors.request.use(config => {
  const token = localStorage.getItem('sinarjoAccessToken')
    
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}, error => {
  return Promise.reject(error)
})

axiosIns.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Token expired, redirecting to login...')
      
      localStorage.setItem('sinarjoUserData', '{}')
      localStorage.removeItem('sinarjoAccessToken')
      localStorage.removeItem('sinarjoUserAbilities')
      
      
      router.push('/login')
      toast.info('Token Expired Please Login Again.')
      
      return
    }

    return Promise.reject(error)
  },
)


export default axiosIns
