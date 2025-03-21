import axios from 'axios'

const axiosDW = axios.create({
  baseURL: 'http://100.100.0.16/data-warehouse/api',
})

export default axiosDW
