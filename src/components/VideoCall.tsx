"use client";

import { useSocketStore } from "@/store/socketStore";
import VideoContainer from "./VidoeContainer";
import { useCallback, useEffect, useState } from "react";
import {
  MdCamera,
  MdMic,
  MdMicOff,
  MdVideocam,
  MdVideocamOff,
} from "react-icons/md";

const Videocall = () => {
  const { localStream, peer, ongoingCall, handleHangup } = useSocketStore();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      setIsVideoOn(videoTrack.enabled);
      const audioTrack = localStream.getAudioTracks()[0];
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const isOnCall = localStream && peer && ongoingCall ? true : false;
  console.log(isOnCall, "isOncall");
  console.log(peer, peer?.stream, "ellarum undo");

  if (!ongoingCall) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <div className="mt-4 relative flex flex-row items-center justify-center">
        {localStream && (
          <div>
            <VideoContainer
              stream={localStream}
              isLocalStream={true}
              isOnCall={isOnCall}
            />
          </div>
        )}
        {peer && peer.stream && (
          <div>
            <VideoContainer
              stream={peer.stream}
              isLocalStream={false}
              isOnCall={isOnCall}
            />
          </div>
        )}
      </div>
      {localStream && (
        <div className="mt-8 flex items-center justify-center">
          <button onClick={toggleMic}>
            {isMicOn && <MdMicOff size={28} />}{" "}
            {!isMicOn && <MdMic size={28} />}
          </button>
          <button
            className="px-4 py-2 bg-rose-500 text-white rounded mx-4"
            onClick={handleHangup}
          >
            End Call
          </button>
          <button onClick={toggleCamera}>
            {isVideoOn && <MdVideocamOff size={28} />}{" "}
            {!isVideoOn && <MdVideocam size={28} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default Videocall;
