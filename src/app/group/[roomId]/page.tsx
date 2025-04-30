"use client";

import React, { useRef, useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { IoIosChatbubbles } from "react-icons/io";
import UserNav from "@/components/UserNav";
import { User } from "@/Types/chat";
import { fetchUser } from "@/services/userApi";
import axios from "axios";
import { toast } from "react-toastify";

const GroupChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, logout } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<User>()
  const containerRef = useRef<HTMLDivElement>(null);
  const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("userAccessToken");
    const fetchCurrentUser = async () => {
      console.log('useEffect in subscription')
      try {
        const data = await fetchUser(token as string);
        setCurrentUser(data)
        
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 403) {
              toast.error("User is blocked");
              logout()
            }else if (error.response.status === 401) {
              toast.error("Token expired");
              logout()
            }
          } else {
            toast.error("An unexpected error occurred in login");
          }
        } else {
          toast.error("An error occurred during login. Please try again.");
        }
      }
    };
    fetchCurrentUser();
  }, [logout]);


  useEffect(() => {
    const setupGroupChat = async () => {
      const appID = 1386204990;
      const serverSecret = "92daef8ad3153dc7e5d072c206ebb6d8";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId as string,
        Date.now().toString(),
        user?.username || "Anonymous"
      );

      const zpInstance = ZegoUIKitPrebuilt.create(kitToken);
      setZp(zpInstance);

      if (containerRef.current) {
        zpInstance.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
            config: {
              role: ZegoUIKitPrebuilt.Host,
            },
          },
          showScreenSharingButton: false,
        });
      }
    };

    setupGroupChat();

    return () => {
      if (zp) {
        zp.destroy();
      }
    };
  }, [roomId, user, zp]);

  const handleLeaveRoom = () => {
    if (zp) {
      zp.destroy();
    }
    router.back()
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <UserNav />
      <main className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8 flex items-center justify-center">
          <IoIosChatbubbles className="mr-3 text-yellow-400" /> Group Chat Room
        </h1>
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div ref={containerRef} className="h-[calc(100vh-12rem)]" />
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleLeaveRoom}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Leave Room
          </button>
        </div>
      </main>
    </div>
  );
};

export default GroupChatPage;