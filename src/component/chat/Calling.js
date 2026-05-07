"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
} from "lucide-react";

import SocketContext from "../SocketClient";

const Calling = () => {
  const socket = useContext(SocketContext);

  // =========================
  // REFS
  // =========================
  const ringtoneRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const handledOfferRef = useRef(false);
  const statsIntervalRef = useRef(null);

  const roomIdRef = useRef(null);

  // =========================
  // STATE
  // =========================
  const [callState, setCallState] = useState("idle");
  const [currentRequest, setCurrentRequest] = useState(null);

  const [isMuted, setIsMuted] = useState(false);

  const [callTime, setCallTime] = useState(0);

  // =========================
  // USER
  // =========================
  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user"))?.id
      : null;

  // =========================
  // CALL TIMER
  // =========================
  useEffect(() => {
    let interval;

    if (callState === "connected") {
      interval = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  };

  // =========================
  // WEBRTC CONFIG
  // =========================
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
    // Add more reliable ones if possible (e.g., your own coturn)
  ],
  iceCandidatePoolSize: 10,
};

  // =========================
  // INIT MIC
  // =========================
  const initMedia = async () => {
    try {
      console.log("🎤 Requesting microphone access...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      console.log("✅ Mic ready");
    } catch (err) {
      console.error("❌ Mic error:", err);
    }
  };

  // =========================
  // CREATE PEER CONNECTION
  // =========================
  // =========================
// CREATE PEER CONNECTION
// =========================
const createPeerConnection = (roomId) => {
  if (peerConnectionRef.current) {
    console.log("⚠️ Reusing existing peer");
    return peerConnectionRef.current;
  }

  console.log("🟢 Creating PeerConnection (Astrologer)");

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

  // Local tracks (already initialized in initMedia)
  if (localStreamRef.current) {
    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
      console.log("➕ Added local track on astrologer side");
    });
  }

  // Remote track
  pc.ontrack = async (event) => {
    console.log("🎧 Remote track received (Astrologer)");
    const remoteStream = event.streams[0];

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      try {
        await remoteAudioRef.current.play();
        console.log("🔊 Remote audio playing on astrologer");
      } catch (err) {
        console.error("❌ Autoplay blocked:", err);
      }
    }
    setCallState("connected");
  };

  // ICE
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", {
        room_id: roomId,
        candidate: event.candidate,
      });
    }
  };

  // States
  pc.oniceconnectionstatechange = () => {
    console.log("🧊 ICE State (Astro):", pc.iceConnectionState);
  };
  pc.onconnectionstatechange = () => {
    console.log("🔥 Connection State (Astro):", pc.connectionState);
  };

  return pc;
};
  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    initMedia();

    // INCOMING CALL
    socket.on("incoming_call", (data) => {
      if (data.receiverId !== astroId) return;

      console.log("📞 Incoming call:", data);

      roomIdRef.current = data.room_id;

      handledOfferRef.current = false;

      setCurrentRequest(data);

      setCallState("ringing");

      ringtoneRef.current?.play().catch((err) => {
        console.log(err);
      });
    });

    // OFFER
    socket.on("offer", async (data) => {
      try {
        console.log("📥 Offer received");

        if (data.room_id !== roomIdRef.current) {
          console.log("❌ Wrong room");
          return;
        }

        if (peerConnectionRef.current?.remoteDescription) {
          console.log("⚠️ Offer already handled");
          return;
        }

        handledOfferRef.current = true;

        const roomId = roomIdRef.current;

        const pc = createPeerConnection(roomId);

        await pc.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        console.log("✅ Remote Description Set");

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        console.log("✅ Local Description Set");

        socket.emit("answer", {
          room_id: roomId,
          answer,
        });

        console.log("✅ Answer sent");

        setCallState("connecting");
      } catch (err) {
        console.error("❌ Offer Error:", err);
      }
    });

    // ICE
    socket.on("ice-candidate", async (data) => {
      try {
        if (!peerConnectionRef.current) return;

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );

        console.log("✅ ICE Added");
      } catch (err) {
        console.error("❌ ICE Error:", err);
      }
    });

    // CALL END
    socket.on("call_ended_by_user", () => {
      cleanupCall();
    });

    return () => {
      socket.off("incoming_call");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("call_ended_by_user");
    };
  }, [socket]);

  // =========================
  // ACCEPT CALL
  // =========================
  const handleAccept = async () => {
    try {
      const roomId = roomIdRef.current;

      ringtoneRef.current?.pause();

      socket.emit("join_call", {
        roomId,
      });

      setTimeout(() => {
        socket.emit("callAcceptedByAstrologer", {
          roomId,
          astroId,
        });

        setCallState("connecting");
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // TOGGLE MUTE
  // =========================
  const toggleMute = () => {
    if (!localStreamRef.current) return;

    const audioTrack =
      localStreamRef.current.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setIsMuted(!audioTrack.enabled);

    console.log(
      audioTrack.enabled
        ? "🎤 Mic Unmuted"
        : "🔇 Mic Muted"
    );
  };

  // =========================
  // END CALL
  // =========================
  const handleEndCall = () => {
    socket.emit("call_ended_by_astrologer", {
      roomId: roomIdRef.current,
    });

    cleanupCall();
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanupCall = () => {
    console.log("🧹 Cleanup Call");

    setCallState("idle");

    setCurrentRequest(null);

    setCallTime(0);

    handledOfferRef.current = false;

    // CLEAR STATS
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    // CLOSE PEER
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();

      peerConnectionRef.current = null;
    }

    // REMOTE AUDIO
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();

      remoteAudioRef.current.srcObject = null;
    }

    // STOP RINGTONE
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();

      ringtoneRef.current.currentTime = 0;
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      {/* RINGTONE */}
      <audio
        ref={ringtoneRef}
        src="/sounds/sound2.mp3"
        preload="auto"
      />

      {/* REMOTE AUDIO */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
      />

      <AnimatePresence>
        {/* INCOMING CALL */}
        {callState === "ringing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
          >
            <div className="bg-white w-[350px] rounded-3xl p-8 text-center shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-purple-100 mx-auto flex items-center justify-center text-3xl font-bold text-purple-700">
                {currentRequest?.callerId?.slice(0, 1)}
              </div>

              <h2 className="text-2xl font-bold mt-5">
                Incoming Call
              </h2>

              <p className="text-gray-500 mt-2 break-all">
                {currentRequest?.callerId}
              </p>

              <div className="flex justify-center gap-5 mt-8">
                {/* REJECT */}
                <button
                  onClick={cleanupCall}
                  className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white"
                >
                  <PhoneOff size={28} />
                </button>

                {/* ACCEPT */}
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white"
                >
                  <Phone size={28} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* CONNECTING */}
        {callState === "connecting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white"
          >
            <div className="animate-pulse text-2xl font-semibold">
              Connecting...
            </div>
          </motion.div>
        )}

        {/* CONNECTED */}
        {callState === "connected" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center text-white"
          >
            {/* USER */}
            <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-5xl font-bold shadow-2xl">
              {currentRequest?.callerId?.slice(0, 1)}
            </div>

            <h2 className="text-3xl font-bold mt-6">
              Call Connected
            </h2>

            <p className="text-gray-300 mt-2">
              {formatTime(callTime)}
            </p>

            {/* BUTTONS */}
            <div className="flex items-center gap-8 mt-12">
              {/* MUTE */}
              <button
                onClick={toggleMute}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition ${
                  isMuted
                    ? "bg-yellow-500"
                    : "bg-gray-700"
                }`}
              >
                {isMuted ? (
                  <MicOff size={32} />
                ) : (
                  <Mic size={32} />
                )}
              </button>

              {/* END CALL */}
              <button
                onClick={handleEndCall}
                className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center shadow-2xl"
              >
                <PhoneOff size={40} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Calling;