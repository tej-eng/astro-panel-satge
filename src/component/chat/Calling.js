"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import { PhoneOff, Phone, Mic, MicOff, Clock, User } from "lucide-react";
import SocketContext from "../SocketClient";

const Calling = () => {
  const socket = useContext(SocketContext);

  // Refs
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // States
  const [callState, setCallState] = useState("idle");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [callerName, setCallerName] = useState("Client");
  const hasEndedRef = useRef(false);

  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user") || "{}")?.id
      : null;

  // ====================== CALL TIMER ======================
 useEffect(() => {
  let interval;

  if (callState === "connected" && callTime > 0) {
    interval = setInterval(() => {
      setCallTime((prev) => prev - 1);
    }, 1000);
  }

  // AUTO END CALL
  if (callTime <= 0 && !hasEndedRef.current) {
  hasEndedRef.current = true;
  handleEndCall();
  }

  return () => {
    if (interval) clearInterval(interval);
  };
}, [callState, callTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ====================== INITIALIZE MIC ======================
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
    } catch (err) {
      console.error("❌ Mic access failed:", err);
    }
  };

  // ====================== CREATE PEER CONNECTION ======================
  const createPeerConnection = (roomId) => {
    if (peerConnectionRef.current) return peerConnectionRef.current;


    const iceConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
      iceCandidatePoolSize: 10,
    };

    const pc = new RTCPeerConnection(iceConfig);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
        console.log("➕ Added local audio track");
      });
    }

    pc.ontrack = async (event) => {
      console.log("🎧 Remote track received (Astrologer)");
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
        try {
          await remoteAudioRef.current.play();
        } catch (e) {
          console.error("Autoplay blocked", e);
        }
      }
      setCallState("connected");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          room_id: roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("🧊 ICE State (Astro):", pc.iceConnectionState);
    };
    pc.onconnectionstatechange = () => {
      console.log("🔥 Connection State (Astro):", pc.connectionState);
    };

    return pc;
  };

  // ====================== SOCKET EVENTS ======================
  useEffect(() => {
    if (!socket) return;
    initMedia();

    socket.on("incoming_call", (data) => {
      if (data.receiverId !== astroId) return;
      console.log("📞 Incoming call:", data);
      setCurrentRequest(data);
      setCallerName(data.callerId?.slice(0, 8) || "Client");
      setCallState("ringing");
      setCallTime(data.callTime*60 || 0);
      ringtoneRef.current?.play().catch(() => {});
    });

    socket.on("offer", async (data) => {
      try {
        if (data.room_id !== currentRequest?.room_id) return;
        const pc = createPeerConnection(data.room_id);
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { room_id: data.room_id, answer });
      } catch (err) {
        console.error("❌ Offer Error:", err);
      }
    });

    socket.on("ice-candidate", async (data) => { 
      console.log("🧊 ICE Candidate received:", data?.room_id); 
      
       if (data?.room_id === currentRequest?.room_id) {
      try {
        if (peerConnectionRef.current && data.candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        }
      } catch (err) {
        console.error("❌ ICE Error:", err);
      }
    }
    });

    socket.on("call_ended_by_user", (data) => {
     if (JSON.parse(data)?.room_id === currentRequest?.room_id) {
      cleanupCall();
    }
    });

    socket.on("call_cancel_by_user", (data) => { 
       if (JSON.parse(data)?.roomId === currentRequest?.room_id) {
      cleanupCall();
    }
    });

    socket.on("call_reject_auto", (data) => { 
       if (JSON.parse(data)?.roomId === currentRequest?.room_id) {
      cleanupCall();
    }
    });

    

    return () => {
      socket.off("incoming_call");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("call_ended_by_user");
      socket.off("call_cancel_by_user");
    };
  }, [socket, astroId, currentRequest]);

  // ====================== HANDLERS ======================
  const handleAccept = async () => {
    if (!currentRequest?.room_id) return;
    const roomId = currentRequest.room_id;

    ringtoneRef.current?.pause();
    socket?.emit("join_call", { roomId });

    setTimeout(() => {
      socket?.emit("callAcceptedByAstrologer", { roomId, astroId ,callTime});
      setCallState("connecting");
    }, 400);
  };

  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    }
  };

  const handleEndCall = () => {
    socket?.emit("call_ended_by_astrologer", {
      roomId: currentRequest?.room_id,
      astroId: astroId,
    });
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
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    ringtoneRef.current?.pause();
      socket?.emit("call_cancel_by_astrologer", {
      roomId: currentRequest?.room_id,
    });
  };

  return (
    <>
      <audio ref={ringtoneRef} src="/sounds/ringtone.mp3" preload="auto" loop />
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <AnimatePresence mode="wait">
        {/* Ringing Screen */}
        {callState === "ringing" && (
          <motion.div
            key="ringing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="w-36 h-36 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-7xl font-bold shadow-2xl"
              >
                {callerName[0]}
              </motion.div>

              <h1 className="text-4xl font-semibold text-white mt-10">Incoming Call</h1>
              <p className="text-2xl text-purple-300 mt-4">{callerName}</p>

              <div className="flex justify-center gap-12 mt-16">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={cleanupCall}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700"
                >
                  <PhoneOff size={42} className="text-white" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAccept}
                  className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700"
                >
                  <Phone size={42} className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Connecting Screen */}
        {callState === "connecting" && (
          <motion.div
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-950 to-black flex flex-col items-center justify-center text-white"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-6">
              <User size={60} />
            </div>
            <h2 className="text-3xl font-medium">Connecting...</h2>
            <p className="text-gray-400 mt-3">Please wait</p>
          </motion.div>
        )}

        {/* Connected Call Screen */}
        {callState === "connected" && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-gradient-to-br from-gray-950 via-purple-950 to-black flex flex-col items-center justify-center text-white"
          >
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-500 flex items-center justify-center text-8xl font-bold shadow-2xl border-4 border-white/30"
              >
                {callerName[0]}
              </motion.div>

              <h2 className="text-4xl font-semibold mt-8">{callerName}</h2>
              <div className="flex items-center gap-2 mt-4 text-green-400">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                Connected
              </div>
            </div>

            <div className="mt-12 flex items-center gap-3 text-3xl font-mono">
              <Clock size={32} />
              {formatTime(callTime)}
            </div>

            <div className="absolute bottom-16 flex gap-8">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={toggleMute}
                className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all ${
                  isMuted ? "bg-yellow-500 text-black" : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {isMuted ? <MicOff /> : <Mic />}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleEndCall}
                className="w-24 h-24 bg-red-600 hover:bg-red-700 rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <PhoneOff size={42} />
              </motion.button>
            </div>

            <p className="absolute bottom-6 text-xs text-gray-500">
              This call may be recorded for quality purposes
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Calling;