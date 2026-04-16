"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";
import SocketContext from "./SocketClient";
import { useRouter } from "next/navigation";
import PopUp from "@/app/common/PopUp";
import { encryptParams } from "@/app/utils/crypto";

const ChatRequest = () => {
  const router = useRouter();
  const audioRef = useRef(null);

  const socket = useContext(SocketContext);
  const [chatRequests, setChatRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [acceptchat, setAcceptChat] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [message, setMessage] = useState("");
  const [reject, setReject] = useState(false);
  const [autoReject, setAutoReject] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedValue = localStorage.getItem("userInteracted");

    if (storedValue === "true") {
      setUserInteracted(true);
      return;
    }

    const handleUserClick = () => {
      setUserInteracted(true);
      localStorage.setItem("userInteracted", "true");
      window.removeEventListener("click", handleUserClick);
    };

    window.addEventListener("click", handleUserClick);

    return () => {
      window.removeEventListener("click", handleUserClick);
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      console.log("Socket not connected");
      return;
    }
    //const astroId = localStorage.getItem("USER");//astro_user
    const astroId = JSON.parse(localStorage.getItem("astro_user"))?.id;
    console.log("Listening for chat requests for astroId:", astroId);
    socket.on("new_chat_request", (data) => {
      if (data.astro_id == astroId) {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("🔇 Audio play failed:", err.message);
          });
        }
        setTimeout(() => {
          setChatRequests((prevRequests) => [...prevRequests, data]);
          setCurrentRequest(data);
          setIsModalOpen(true);
        }, 10);
      }
    });

   socket.on("chat_started_astrologer", (data) => {
      if (data.roomid === currentRequest.room_id) {
        const chatParams = {
          userName: currentRequest.userName,
          roomId: currentRequest.room_id,
          chattime: currentRequest.maximum_time?.toString(),
          userId: currentRequest.user_id,
          place: currentRequest.location,
          time: currentRequest.timeOfBirth?.toString(),
          bod: currentRequest.dateOfBirth,
          gender: currentRequest.gender,
          occupationuser: currentRequest.occupation,
          userimage: currentRequest.user_image || ''
        };
        const encrypted = encryptParams(chatParams);
        const ischatTransfer = localStorage.getItem("ischatTransfer");
        if(ischatTransfer == "true"){
           if (transfer_from ==astroId) {
            localStorage.setItem("ischatTransfer", false);
            localStorage.setItem("transfer_from", "");
           }
        }
        else{
         router.push(`/astrologerchat?data=${encrypted}`);
        }
      }
    });

    socket.on("chat_rejected_astrologer", async (data) => {
      if (data.roomid === currentRequest.room_id) {
        setAcceptChat(false);
        setReject(true);

        setTimeout(() => {
          setReject(false);
        }, 3000);
      }
    });

    socket.on("chat_reject_auto", async (data) => {
      if (data.roomId === currentRequest?.room_id) {
        setIsModalOpen(false);
        setAutoReject(true);
        setAcceptChat(false);
        setMessage("The User has rejected the chat request");
        setTimeout(() => {
          setAutoReject(false);
        }, 3000);
      }
    });

     socket.on("chat_transfer", async (data) => {
       if (data.transfer_from ==astroId) {
        localStorage.setItem("transfer_from", astroId);
        localStorage.setItem("ischatTransfer", true);
        setIsModalOpen(false);
       }
    });
    return () => {
      socket.off("new_chat_request");
      socket.off("chat_started_astrologer");
      socket.off("chat_reject_auto");
      socket.off("chat_rejected_astrologer");
      socket.off("chat_transfer");

    };
  }, [socket, currentRequest]);



  const handleAccept = () => {
    const { room_id } = currentRequest;
  

    socket.emit("chat_accepted_astrologer", { room_id }, (response) => {});

  

    setIsModalOpen(false);  
    setAcceptChat(true);    
  };

  const handleReject = async () => {
    const { room_id, astro_id } = currentRequest;

    socket.emit(
      "chat_rejected_astrologer",
      { room_id, astro_id },
      (response) => {}
    );
    setIsModalOpen(false);
    setAcceptChat(false);
  };

  return (
    <>
      <div>
        <audio ref={audioRef} src="/sounds/sound2.mp3" preload="auto" />

        {!userInteracted && (
          <PopUp
            title="Enable Ringtone Notifications "
            buttontype={1}
            buttonname="Enable Notifications"
            onClick={() => setUserInteracted(true)}
          />
        )}

        {reject && (
          <PopUp
            title="Chat Rejected"
            subtitle="Chat rejected by User"
            buttontype={0}
          />
        )}

        {autoReject && (
          <PopUp title="Chat Rejected" subtitle={message} buttontype={0} />
        )}
      </div>
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleReject}
            />

            {/* Modal box */}

            {currentRequest && (
              <motion.div
                className="fixed z-50 w-full max-w-sm p-6 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg top-1/2 left-1/2 rounded-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h2 className="mb-3 text-xl font-bold">
                  Incoming Chat Request
                </h2>
                <p className="mb-3 text-sm text-gray-600">
                  Do you want to accept this chat?
                </p>
                <p className="text-sm text-gray-800">
                  Name: {currentRequest.userName}
                </p>
                <p className="mb-6 text-sm text-gray-600">
                  Chat Id: {currentRequest.room_id}
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 text-red-700 bg-red-100 rounded hover:bg-red-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Accept
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {acceptchat && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleReject}
            />

            <motion.div
              className="fixed z-50 w-full max-w-sm p-6 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg top-1/2 left-1/2 rounded-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="mb-3 text-xl font-bold">
                Chat : Please Wait ... 
              </h2>
              
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatRequest;
