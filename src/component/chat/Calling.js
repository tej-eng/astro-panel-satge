"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import SocketContext from "../SocketClient";

const Calling = () => {
  const socket = useContext(SocketContext);

  const audioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const pendingOfferRef = useRef(null);
  const roomIdRef = useRef(null);

  const [callState, setCallState] = useState("idle"); 
  // idle | ringing | connecting | connected

  const [currentRequest, setCurrentRequest] = useState(null);

  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user"))?.id
      : null;

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // =========================
  // INIT MEDIA
  // =========================
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      localStreamRef.current = stream;

      console.log("🎤 Mic ready");

      // ✅ If offer already came → process now
      if (pendingOfferRef.current) {
        console.log("⚡ Processing buffered offer");
        handleOffer(pendingOfferRef.current);
        pendingOfferRef.current = null;
      }

    } catch (err) {
      console.error("❌ Mic error:", err);
    }
  };

  // =========================
  // CREATE PEER CONNECTION
  // =========================
  const createPeerConnection = (roomId) => {
    if (peerConnectionRef.current) {
      console.log("⚠️ Peer already exists");
      return peerConnectionRef.current;
    }

    console.log("📞 Creating PeerConnection");

    const pc = new RTCPeerConnection(config);

    // add local tracks
    localStreamRef.current?.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      console.log("🔊 Remote stream received");
      remoteAudioRef.current.srcObject = event.streams[0];
      setCallState("connected");
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          room_id: roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // =========================
  // HANDLE OFFER
  // =========================
  const handleOffer = async (data) => {
    try {
      console.log("📞 Handling offer:", data);

      const roomId = roomIdRef.current;
      if (!roomId) return;

      const pc = createPeerConnection(roomId);

      await pc.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", {
        room_id: roomId,
        answer,
      });

      setCallState("connecting");

    } catch (err) {
      console.error("❌ Offer handling error:", err);
    }
  };

  // =========================
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    initMedia();

    // DEBUG (VERY IMPORTANT)
    socket.onAny((event, ...args) => {
      console.log("📡 ASTRO EVENT:", event, args);
    });

    // 🔔 INCOMING CALL
    socket.on("incoming_call", (data) => {
      if (data.receiverId == astroId) {
        console.log("📞 Incoming call:", data);

        roomIdRef.current = data.room_id;

        // ✅ JOIN ROOM IMMEDIATELY
        socket.emit("join_call", { roomId: data.room_id });

        setCurrentRequest(data);
        setCallState("ringing");

        audioRef.current?.play().catch(() => {});
      }
    });

    // 📞 OFFER
    socket.on("offer", async (data) => {
      console.log("📞 Offer received:", data);

      if (data.room_id !== roomIdRef.current) {
        console.log("❌ Wrong room, ignoring offer");
        return;
      }

      // ❗ If mic not ready → buffer offer
      if (!localStreamRef.current) {
        console.log("⏳ Buffering offer (media not ready)");
        pendingOfferRef.current = data;
        return;
      }

      handleOffer(data);
    });

    // ❄ ICE
    socket.on("ice-candidate", async (data) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error("❌ ICE error:", err);
      }
    });

    // 👥 DEBUG
    socket.on("peer_joined", () => {
      console.log("👥 Peer joined");
    });

    // ❌ CALL END
    socket.on("call_ended_by_user", () => {
      cleanupCall();
    });

    return () => {
      socket.off("incoming_call");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("call_ended_by_user");
      socket.offAny();
    };
  }, [socket]);

  // =========================
  // ACCEPT
  // =========================
  const handleAccept = () => {
    const roomId = roomIdRef.current;

    console.log("✅ Call accepted");

    setCallState("connecting");

    socket.emit("callAcceptedByAstrologer", {
      roomId,
      astroId,
    });
  };

  // =========================
  // REJECT
  // =========================
  const handleReject = () => {
    console.log("❌ Call rejected");

    setCallState("idle");
    setCurrentRequest(null);
  };

  // =========================
  // END CALL
  // =========================
  const handleEndCall = () => {
    socket.emit("call_ended_by_astrologer", {
      room_id: roomIdRef.current,
    });

    cleanupCall();
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanupCall = () => {
    console.log("🧹 Cleaning call");

    setCallState("idle");

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    setCurrentRequest(null);
    pendingOfferRef.current = null;
  };

  // =========================
  // UI
  // =========================
  return (
    <>
      <audio ref={audioRef} src="/sounds/sound2.mp3" preload="auto" />
      <audio ref={remoteAudioRef} autoPlay />

      <AnimatePresence>
        {callState === "ringing" && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white p-6 rounded-xl text-center">
              <h2 className="text-lg font-bold mb-2">Incoming Call</h2>
              <p>{currentRequest?.callerId}</p>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleReject}
                  className="bg-red-500 px-4 py-2 text-white rounded"
                >
                  Reject
                </button>

                <button
                  onClick={handleAccept}
                  className="bg-green-600 px-4 py-2 text-white rounded"
                >
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {callState === "connecting" && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 text-white">
            <h2 className="text-xl">Connecting...</h2>
          </motion.div>
        )}

        {callState === "connected" && (
          <motion.div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 text-white">
            <h2 className="text-xl mb-4">Call Connected</h2>

            <button
              onClick={handleEndCall}
              className="bg-red-600 px-6 py-3 rounded-full"
            >
              End Call
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Calling;