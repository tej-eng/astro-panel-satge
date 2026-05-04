"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import SocketContext from "../SocketClient";

const Calling = () => {
  const router = useRouter();
  const socket = useContext(SocketContext);

  const audioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("USER"))?.id
      : null;

  // =========================
  // INIT MICROPHONE
  // =========================
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone permission required");
    }
  };

  // =========================
  // CREATE PEER CONNECTION
  // =========================
  const createPeerConnection = (roomId) => {
    const pc = new RTCPeerConnection(config);

    // add local tracks
    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    // receive remote stream
    pc.ontrack = (event) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    // ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          room_id: roomId,
          candidate: event.candidate,
        });
      }
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
      if (data.receiverId == astroId) {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        setCurrentRequest(data);
        setIsModalOpen(true);
      }
    });

    // OFFER FROM USER
    socket.on("offer", async (raw) => {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      if (!currentRequest) return;

      const roomId = currentRequest.room_id;

      console.log("📞 Offer received");

      const pc = createPeerConnection(roomId);
      peerConnectionRef.current = pc;

      await pc.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", {
        room_id: roomId,
        answer,
      });
    });

    // ICE FROM USER
    socket.on("ice-candidate", async (raw) => {
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;

      try {
        await peerConnectionRef.current?.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error("ICE error:", err);
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
  }, [socket, currentRequest]);

  // =========================
  // ACCEPT CALL
  // =========================
  const handleAccept = () => {
    setIsModalOpen(false);

    socket.emit("callAcceptedByAtrologer", {
      roomId: currentRequest.room_id,
      astroId,
    });
  };

  // =========================
  // REJECT CALL
  // =========================
  const handleReject = () => {
    setIsModalOpen(false);
    setCurrentRequest(null);
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanupCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  };

  return (
    <>
      {/* RING SOUND */}
      <audio ref={audioRef} src="/sounds/sound2.mp3" preload="auto" />

      {/* REMOTE AUDIO */}
      <audio ref={remoteAudioRef} autoPlay />

      <AnimatePresence>
        {isModalOpen && currentRequest && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleReject}
            />

            <motion.div
              className="fixed z-50 w-full max-w-sm p-6 bg-white shadow-lg top-1/2 left-1/2 rounded-xl -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-bold mb-3">
                Incoming Call Request
              </h2>

              <p className="text-sm">User: {currentRequest.callerId}</p>

              <div className="flex justify-between mt-5">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Reject
                </button>

                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Accept
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Calling;