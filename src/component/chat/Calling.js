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

  const handledOfferRef = useRef(false); // ✅ NEW

  const [callState, setCallState] = useState("idle");
  const [currentRequest, setCurrentRequest] = useState(null);

  const roomIdRef = useRef(null);

  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user"))?.id
      : null;

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // =========================
  // INIT MIC
  // =========================
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      localStreamRef.current = stream;
      console.log("🎤 Mic ready");
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  // =========================
  // CREATE PEER (ONLY ONCE)
  // =========================
  const createPeerConnection = (roomId) => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current; // ✅ prevent duplicate
    }

    const pc = new RTCPeerConnection(config);

    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      console.log("🎧 Remote stream received");
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
  // SOCKET EVENTS
  // =========================
  useEffect(() => {
    if (!socket) return;

    initMedia();

    // =========================
    // INCOMING CALL
    // =========================
    socket.on("incoming_call", (data) => {
      if (data.receiverId !== astroId) return;

      console.log("📞 Incoming call:", data);

      roomIdRef.current = data.room_id;
      handledOfferRef.current = false; // reset

      socket.emit("join_call", { roomId: data.room_id });

      setCurrentRequest(data);
      setCallState("ringing");

      audioRef.current?.play().catch(() => {});
    });

    // =========================
    // OFFER HANDLER (FIXED)
    // =========================
    socket.on("offer", async (data) => {
      console.log("📥 Offer received:", data.room_id);

      // ❌ ignore wrong room
      if (data.room_id !== roomIdRef.current) {
        console.log("❌ Ignoring stale offer:", data.room_id);
        return;
      }

      // ❌ ignore duplicate
      if (handledOfferRef.current) {
        console.log("⚠️ Offer already handled");
        return;
      }

      handledOfferRef.current = true; // ✅ lock

      const roomId = roomIdRef.current;

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

      console.log("✅ Answer sent");
      setCallState("connecting");
    });

    // =========================
    // ICE
    // =========================
    socket.on("ice-candidate", async (data) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error("ICE error:", err);
      }
    });

    socket.on("call_ended_by_user", cleanupCall);

    return () => {
      socket.off("incoming_call");
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("call_ended_by_user");
    };
  }, [socket]);

  // =========================
  // ACCEPT
  // =========================
  const handleAccept = () => {
    const roomId = roomIdRef.current;

    console.log("✅ Call accepted");

    socket.emit("callAcceptedByAstrologer", {
      roomId,
      astroId,
    });

    setCallState("connecting");
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanupCall = () => {
    setCallState("idle");

    handledOfferRef.current = false;

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    setCurrentRequest(null);
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
                  onClick={cleanupCall}
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
            <h2>Connecting...</h2>
          </motion.div>
        )}

        {callState === "connected" && (
          <motion.div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 text-white">
            <h2>Call Connected</h2>

            <button
              onClick={cleanupCall}
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