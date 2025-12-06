"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useContext, useRef } from "react";


import { useRouter } from "next/navigation";
import PopUp from "@/app/common/PopUp";
import SocketContext from "../SocketClient";
import { useGetKundaliQuery } from "@/app/redux/slice/kundaliSlice";

const Calling = () => {
  const router = useRouter();
  const audioRef = useRef(null);

  const socket = useContext(SocketContext);

  const [chatRequests, setChatRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [kundaliModal, setKundaliModal] = useState(false);
  const [kundaliRoomId, setKundaliRoomId] = useState(null);
  
  const { data: kundaliData, isLoading: isKundaliLoading, error: kundaliError } = useGetKundaliQuery(kundaliRoomId, { skip: !kundaliRoomId });

  useEffect(() => {
    if (!socket) {
      console.log("⛔ Socket not connected");
      return;
    }
    const astroId = localStorage.getItem("USER");
    socket.on("new_call_request", (data) => {

      // console.log("New call request received1:", data);
      if (data.astro_id == astroId) {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.warn("🔇 Audio play failed:", err.message);
          });
        }
        setTimeout(() => {
          setChatRequests((prevRequests) => [...prevRequests, data]);
          setCurrentRequest(data);
           console.log("New setCurrentRequest received:", setCurrentRequest);
          setIsModalOpen(true);
        }, 0);
      }
    });
    return () => {
      socket.off("new_chat_request");
    };
  }, [socket, currentRequest]);

  const handleAccept = () => {
    setIsModalOpen(false);
  };

  const handleReject = async () => {
    console.log("Rejecting chat request...");

    setIsModalOpen(false);
  };


  
  const OpenKundali = () => {
    if (currentRequest && currentRequest.room_id) {
      const url = `/dashboard/chathistory/kundli/${currentRequest.room_id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <div>
        <audio ref={audioRef} src="/sounds/sound2.mp3" preload="auto" />
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
                <h2 className="mb-3 text-xl font-bold">Incoming Call Request</h2>
                <p className="mb-3 text-sm text-gray-600">Do you want to accept this Call?</p>
                <p className="text-sm text-gray-800">Name: {currentRequest.userName}</p>
                <p className="text-sm text-gray-600 ">Gender: {currentRequest.gender}</p>
                <p className="text-sm text-gray-600 ">Dob: {currentRequest.dateofbirth}</p>
                <p className="text-sm text-gray-600 ">Time: {currentRequest.timeOfBirth}</p>
                <p className="text-sm text-gray-600 ">Location: {currentRequest.location}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={OpenKundali}
                    className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
                    Open Kundali
                  </button>
                  <button
                    onClick={handleAccept}
                    className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    Close
                  </button>
                </div>
                <div className="flex justify-end gap-3">
                  
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

     
    </>
  );
};

export default Calling;
