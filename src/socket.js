import { io } from "socket.io-client"

// const socket = io("http://localhost:3001") 

const socket = io("http://100.100.4.200:3001", {
  transports: ["websocket", "polling"],
})

  
export default socket
