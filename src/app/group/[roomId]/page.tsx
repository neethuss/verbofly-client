"use client";

import React, { useRef, useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { IoIosChatbubbles } from "react-icons/io";
import UserNav from "@/components/UserNav";

const GroupChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zp, setZp] = useState<ZegoUIKitPrebuilt | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setupGroupChat = async () => {
      const appID = 1753727909;
      const serverSecret = "7ba0852a9596a5818675b80a0aa4bc7c";

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId as string,
        Date.now().toString(),
        user?.user?.username || "Anonymous"
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
  }, [roomId, user]);

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