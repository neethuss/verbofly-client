"use client";

import { useSocketStore } from "@/store/socketStore";
import Image from "next/image";
import { useEffect } from "react";
import { MdCall, MdCallEnd } from "react-icons/md";

const CallNotification = () => {
  const { ongoingCall, handleJoinCall ,handleHangupDuringInitiation} = useSocketStore();
  useEffect(()=>{

  },[ongoingCall])

  if (!ongoingCall?.isRinging) return null;
  console.log("incoming call notification", ongoingCall);
  return (
    <div className="absolute bg-opacity-70 w-screen h-screen top-0 bottom-0 flex items-center justify-center text-black">
      <div className="bg-white min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4">
        <div className="flex flex-col items-center">
          <Image
            src={ongoingCall.participants.caller.profilePhoto || ""}
            alt="/default-profile.jpg"
            width={20}
            height={20}
            className="cursor-pointer"
          />
          <h3 className="text-sm">
            {ongoingCall.participants.caller.username}
          </h3>
        </div>
        <p className="text-sm mb-2">Incoming call</p>
        <div className="flex gap-8">
          <button onClick={()=>handleJoinCall(ongoingCall)} className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
            <MdCall size={24} />
          </button>
          <button onClick={handleHangupDuringInitiation} className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
            <MdCallEnd size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
