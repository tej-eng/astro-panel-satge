"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import { PhoneOff, Mic, MicOff, Clock } from "lucide-react";
import SocketContext from "../SocketClient";

const Calling = () => {
  const socket = useContext(SocketContext);

  const ringtoneRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [callState, setCallState] = useState<"idle" | "ringing" | "connecting" | "connected">("idle");
  const [currentRequest, setCurrentRequest] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callerName, setCallerName] = useState("User");

  const astroId = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("astro_user") || "{}")?.id 
    : null;

  // Call Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === "connected") {
      interval = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize Microphone
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
    } catch (err) {
      console.error("❌ Mic access failed:", err);
    }
  };

  // Create Peer Connection (Already improved in previous response)
  const createPeerConnection = (roomId: string) => {
    // ... (use the improved version I gave you earlier)
    // Make sure you paste the full improved createPeerConnection here
  };

  // Socket Events (Keep your existing logic + improvements)
  useEffect(() => {
    if (!socket) return;
    initMedia();

    socket.on("incoming_call", (data) => {
      if (data.receiverId !== astroId) return;
      setCurrentRequest(data);
      setCallerName(data.callerId?.slice(0, 8) || "User"); // You can send real name from backend
      setCallState("ringing");
      ringtoneRef.current?.play().catch(() => {});
    });

    // ... keep your other socket handlers (offer, ice-candidate, etc.)

    return () => {
      socket.off("incoming_call");
      // off other events
    };
  }, [socket]);

  const handleAccept = async () => {
    if (!currentRequest?.room_id) return;

    const roomId = currentRequest.room_id;
    ringtoneRef.current?.pause();

    socket.emit("join_call", { roomId });

    setTimeout(() => {
      socket.emit("callAcceptedByAstrologer", { roomId, astroId });
      setCallState("connecting");
    }, 400);
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  const handleEndCall = () => {
    socket.emit("call_ended_by_astrologer", { roomId: currentRequest?.room_id });
    cleanupCall();
  };

  const cleanupCall = () => {
    setCallState("idle");
    setCallTime(0);
    setCurrentRequest(null);
    setIsMuted(false);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    ringtoneRef.current?.pause();
  };

  return (
    <>
      <audio ref={ringtoneRef} src="/sounds/ringtone.mp3" preload="auto" loop />
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <AnimatePresence>
        {/* ==================== INCOMING CALL UI ==================== */}
        {callState === "ringing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold shadow-xl">
                {callerName[0]}
              </div>
              <h2 className="text-3xl font-semibold text-white mt-6">Incoming Call</h2>
              <p className="text-gray-400 mt-2 text-lg">{callerName}</p>

              <div className="flex justify-center gap-8 mt-12">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={cleanupCall}
                  className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <PhoneOff size={36} className="text-white" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAccept}
                  className="w-20 h-20 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Phone size={36} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================== CONNECTED CALL UI (Main Screen) ==================== */}
        {callState === "connected" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-gray-950 via-purple-950 to-black flex flex-col items-center justify-center text-white"
          >
            {/* Caller Info */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-6xl font-bold shadow-2xl border-4 border-white/20">
                {callerName[0]}
              </div>
              <h2 className="text-3xl font-semibold mt-6">{callerName}</h2>
              <p className="text-green-400 flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </p>
            </div>

            {/* Call Timer */}
            <div className="mt-8 flex items-center gap-2 text-xl font-mono">
              <Clock size={20} />
              {formatTime(callTime)}
            </div>

            {/* Control Buttons */}
            <div className="absolute bottom-12 flex gap-6">
              {/* Mute Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={toggleMute}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isMuted 
                    ? "bg-yellow-500 text-black" 
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
              </motion.button>

              {/* End Call Button */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleEndCall}
                className="w-20 h-20 bg-red-600 hover:bg-red-700 rounded-2xl flex items-center justify-center shadow-xl transition-all"
              >
                <PhoneOff size={34} />
              </motion.button>
            </div>

            {/* Subtle hint */}
            <p className="absolute bottom-6 text-xs text-gray-500">
              Call is being recorded for quality purposes
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Calling;