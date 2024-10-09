"use client";

import { useSocketStore } from "@/store/socketStore";
import { useEffect } from "react";

export default function SocketInitializer() {
  const { socket, initializeSocket } = useSocketStore();

  useEffect(() => {
    if (!socket) {
      console.log("initializing socket");
      initializeSocket();
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket, initializeSocket]);

  return null; 
}