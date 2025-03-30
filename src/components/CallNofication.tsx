"use client";

import { useSocketStore } from "@/store/socketStore";
import Image from "next/image";
import { useEffect } from "react";
import { MdCall, MdCallEnd } from "react-icons/md";
import { FaRegCircleUser } from "react-icons/fa6";

const CallNotification = () => {
  const {
    ongoingCall,
    handleJoinCall,
    handleHangupDuringInitiation,
    handleHangup,
  } = useSocketStore();
  useEffect(() => {}, [ongoingCall]);

  if (!ongoingCall?.isRinging) return null;
  console.log("incoming call notification", ongoingCall);
  return (
    <div className="absolute bg-opacity-70 w-screen h-screen top-0 bottom-0 flex items-center justify-center text-black">
      <div className="bg-[#1b1b1b] min-w-[300px] min-h-[200px] flex flex-col items-center justify-center rounded-xl p-4">
        <div className="flex flex-col items-center">
          <Image
            src={ongoingCall.participants.caller.profilePhoto || ""}
            alt="/default-profile.jpg"
            width={20}
            height={20}
          unoptimized={true}
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            e.currentTarget.src = '/default-profile.jpg';
          }}
            className="cursor-pointer"
          />
          <h3 className=" text-white ">
            Incoming call from <span className="text-2xl ">{ongoingCall.participants.caller.username.charAt(0).toUpperCase()+ongoingCall.participants.caller.username.slice(1)}</span>
          </h3>
        </div>
       
        <div className="flex gap-8">
          <button
            onClick={() => handleJoinCall(ongoingCall)}
            className="w-10 h-10 bg-green-700 rounded-full hover:bg-green-400 flex items-center justify-center text-white"
          >
            <MdCall size={24} className="text-black" />
          </button>
          <button
            onClick={handleHangupDuringInitiation}
            className="w-10 h-10 bg-rose-500 rounded-full hover:bg-red-400 flex items-center justify-center text-white"
          >
            
            <MdCallEnd size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
