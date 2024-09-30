import useAuthStore from "@/store/authStore";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface iSocketContext {

}

export const SocketContext = createContext<iSocketContext | null>(null)

export const SocketContextProvider = ({children}:{children : React.ReactNode}) => {
  const user = useAuthStore()

  const [isSocketConnected, setIsSocketConnected] = useState(false)

  const [socket, setSocket] = useState<Socket | null>(null)
  useEffect(()=>{
    const newSocket = io()
    setSocket(newSocket)

    return ()=>{
      newSocket.disconnect
    }
  },[user])


  useEffect(()=>{
    if(socket === null)return
    if(socket.connected){
      onConnect()
    }
    function onConnect(){
      setIsSocketConnected(true)
    }

    function onDisconnect(){
      setIsSocketConnected(false)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return()=>{
      socket.off('connect',onConnect)
      socket.off('disconnect', onDisconnect)
    }
  },[socket])

  
  return <SocketContext.Provider value={{}}>

  </SocketContext.Provider>
}

export  const useSocket = () => {
  const context = useContext(SocketContext)

  if(context === null){
    throw new Error("useSocket must be used within a SocketContextProvider")
  }
  return context
}

