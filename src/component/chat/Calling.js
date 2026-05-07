"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
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

  // =========================
  // USER
  // =========================
  const astroId =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user"))?.id
      : null;

  // =========================
  // WEBRTC CONFIG
  // =========================
  const config = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },

      // TURN SERVER
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

      const tracks = stream.getAudioTracks();

      console.log("🎤 Local tracks:", tracks);

      tracks.forEach((track) => {
        console.log("Track enabled:", track.enabled);
        console.log("Track muted:", track.muted);
        console.log("Track readyState:", track.readyState);
      });
    } catch (err) {
      console.error("❌ Mic error:", err);
    }
  };

  // =========================
  // CREATE PEER CONNECTION
  // =========================
  const createPeerConnection = (roomId) => {
    if (peerConnectionRef.current) {
      console.log("⚠️ Reusing existing peer connection");
      return peerConnectionRef.current;
    }

    console.log("🟢 Creating new RTCPeerConnection");

    const pc = new RTCPeerConnection(config);

    // =========================
    // ADD LOCAL TRACKS
    // =========================
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        console.log("➕ Adding local track:", track.kind);

        pc.addTrack(track, localStreamRef.current);
      });
    }

    // =========================
    // REMOTE TRACK
    // =========================
    pc.ontrack = async (event) => {
      console.log("🎧 Remote stream received");

      const remoteStream = event.streams[0];

      console.log(
        "🎵 Remote audio tracks:",
        remoteStream.getAudioTracks()
      );

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;

        try {
          await remoteAudioRef.current.play();

          console.log("🔊 Remote audio playing");
        } catch (err) {
          console.error("❌ Audio autoplay blocked:", err);
        }
      }

      setCallState("connected");
    };

    // =========================
    // ICE CANDIDATES
    // =========================
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("📡 Sending ICE candidate");

        socket.emit("ice-candidate", {
          room_id: roomId,
          candidate: event.candidate,
        });
      }
    };

    // =========================
    // CONNECTION STATES
    // =========================
    pc.onconnectionstatechange = () => {
      console.log(
        "🟢 PC Connection State:",
        pc.connectionState
      );
    };

    pc.oniceconnectionstatechange = () => {
      console.log(
        "🧊 ICE Connection State:",
        pc.iceConnectionState
      );
    };

    pc.onsignalingstatechange = () => {
      console.log(
        "📶 Signaling State:",
        pc.signalingState
      );
    };

    // =========================
    // DEBUG RTP AUDIO
    // =========================
    statsIntervalRef.current = setInterval(async () => {
      try {
        const stats = await pc.getStats();

        stats.forEach((report) => {
          if (
            report.type === "inbound-rtp" &&
            report.kind === "audio"
          ) {
            console.log(
              "🎵 Audio packets received:",
              report.packetsReceived
            );

            console.log(
              "🎵 Audio bytes received:",
              report.bytesReceived
            );
          }
        });
      } catch (err) {
        console.log("Stats error:", err);
      }
    }, 3000);

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

      handledOfferRef.current = false;

      setCurrentRequest(data);

      setCallState("ringing");

      ringtoneRef.current?.play().catch((err) => {
        console.log("Ringtone play blocked:", err);
      });
    });

    // =========================
    // OFFER
    // =========================
    socket.on("offer", async (data) => {
      try {
        console.log("📥 Offer received:", data.room_id);

        // WRONG ROOM
        if (data.room_id !== roomIdRef.current) {
          console.log("❌ Ignoring stale offer");
          return;
        }

        // DUPLICATE
        if (peerConnectionRef.current?.remoteDescription) {
          console.log("⚠️ Offer already handled");
          return;
        }

        handledOfferRef.current = true;

        const roomId = roomIdRef.current;

        const pc = createPeerConnection(roomId);

        // =========================
        // SET REMOTE OFFER
        // =========================
        await pc.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        console.log("✅ Remote description set");

        // =========================
        // CREATE ANSWER
        // =========================
        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        console.log("✅ Local description set");

        // =========================
        // SEND ANSWER
        // =========================
        socket.emit("answer", {
          room_id: roomId,
          answer,
        });

        console.log("✅ Answer sent");

        setCallState("connecting");
      } catch (err) {
        console.error("❌ Offer handling error:", err);
      }
    });

    // =========================
    // ICE CANDIDATE
    // =========================
    socket.on("ice-candidate", async (data) => {
      try {
        console.log("📡 ICE candidate received");

        if (!peerConnectionRef.current) {
          console.log("❌ No peer connection yet");
          return;
        }

        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );

        console.log("✅ ICE candidate added");
      } catch (err) {
        console.error("❌ ICE error:", err);
      }
    });

    // =========================
    // CALL ENDED
    // =========================
    socket.on("call_ended_by_user", () => {
      console.log("📴 Call ended by user");

      cleanupCall();
    });

    // =========================
    // CLEANUP SOCKETS
    // =========================
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

      console.log("✅ Call accepted");

      // STOP RINGTONE
      ringtoneRef.current?.pause();

      // JOIN ROOM
      socket.emit("join_call", {
        roomId,
      });

      console.log("🚪 Joined room:", roomId);

      setTimeout(() => {
        socket.emit("callAcceptedByAstrologer", {
          roomId,
          astroId,
        });

        console.log("📤 callAcceptedByAstrologer emitted");

        setCallState("connecting");
      }, 500);
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  // =========================
  // CLEANUP
  // =========================
  const cleanupCall = () => {
    console.log("🧹 Cleaning up call");

    setCallState("idle");

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

    // CLEAR REMOTE STREAM
    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }

    setCurrentRequest(null);
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
        {/* RINGING */}
        {callState === "ringing" && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-white p-6 rounded-xl text-center">
              <h2 className="text-lg font-bold mb-2">
                Incoming Call
              </h2>

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

        {/* CONNECTING */}
        {callState === "connecting" && (
          <motion.div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 text-white">
            <h2>Connecting...</h2>
          </motion.div>
        )}

        {/* CONNECTED */}
        {callState === "connected" && (
          <motion.div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50 text-white">
            <h2>Call Connected</h2>

            <button
              onClick={cleanupCall}
              className="bg-red-600 px-6 py-3 rounded-full mt-5"
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