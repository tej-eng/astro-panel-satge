"use client";

import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Search,
  MessageCircle,
  Clock3,
  CalendarDays,
  Star,
  Eye,
  FileText,
} from "lucide-react";
import SessionMessagesModal from "./sessionmodal";

const GET_ASTROLOGER_CHAT_HISTORY = gql`
  query GetAstrologerChatHistory($page: Int!, $limit: Int!) {
    getAstrologerChatHistory(filter: { page: $page, limit: $limit }) {
      success
      totalCount
      currentPage
      totalPages

      data {
        sessionId
        userName
        birthPlace
        rating
        reviewComment
        status
        durationMinutes
        coinsEarned
        createdAt
      }
    }
  }
`;

export default function AstrologerChatHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [openModal, setOpenModal] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);

  const [page, setPage] = useState(1);

  const limit = 10;

  // APOLLO QUERY
  const { data, loading, error } = useQuery(GET_ASTROLOGER_CHAT_HISTORY, {
    variables: {
      page,
      limit,
    },

    fetchPolicy: "network-only",
  });

  const chatHistory = data?.getAstrologerChatHistory;

  // SEARCH + FILTER
  const filteredChats = useMemo(() => {
    if (!chatHistory?.data) return [];

    return chatHistory.data.filter((item) => {
      const searchValue = search.toLowerCase();

   const matchesSearch =
  item?.userName?.toLowerCase().includes(searchValue) ||
  item?.sessionId?.toLowerCase().includes(searchValue) ||
  item?.birthPlace?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || item?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [chatHistory, search, statusFilter]);

  if (error) {
    return <div className="p-6 text-red-500">Error loading chat history</div>;
  }

  const renderStars = (rating = 0) => {
  return Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={16}
      className={
        index < rating
          ? "fill-yellow-400 text-yellow-400"
          : "fill-gray-200 text-gray-200"
      }
    />
  ));
};

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Astrologer Chat History
        </h1>

        <p className="text-gray-500 mt-1">
          View all customer chat sessions & earnings
        </p>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* TOTAL CHATS */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Chats</p>

            <MessageCircle className="w-5 h-5 text-blue-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {chatHistory?.totalCount || 0}
          </h2>
        </div>

        {/* CURRENT PAGE */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Current Page</p>

            <CalendarDays className="w-5 h-5 text-purple-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {chatHistory?.currentPage || 1}
          </h2>
        </div>

        {/* TOTAL PAGES */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Pages</p>

            <Clock3 className="w-5 h-5 text-orange-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {chatHistory?.totalPages || 1}
          </h2>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl border shadow-sm p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by user, mobile, room ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="ALL">All Status</option>

            <option value="COMPLETED">COMPLETED</option>

            <option value="ONGOING">ONGOING</option>

            <option value="MISSED">MISSED</option>

            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {loading ? (
    <div className="col-span-full text-center py-10">
      Loading chat history...
    </div>
  ) : filteredChats.length > 0 ? (
    filteredChats.map((chat) => (
      <div
        key={chat.sessionId}
        className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden"
      >
        <div className="p-5">
          {/* TOP */}

          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm">
                <span className="font-bold text-purple-700">
                  Order ID :
                </span>{" "}
                <span className="text-gray-600">
                  {chat.sessionId.slice(0, 12)}
                </span>
              </p>

              <p className="mt-1">
                <span className="font-bold text-purple-700">
                  Name :
                </span>{" "}
                <span className="text-gray-700">
                  {chat.userName}
                </span>
              </p>
            </div>

            <Eye
              size={18}
              className="text-gray-400"
            />
          </div>

          <p className="text-sm mb-1">
            <span className="font-bold text-purple-700">
              Date :
            </span>{" "}
            {new Date(chat.createdAt).toLocaleString()}
          </p>

          <p className="text-sm mb-1">
            <span className="font-bold text-purple-700">
              Birth Place :
            </span>{" "}
            {chat.birthPlace || "-"}
          </p>

          <p className="text-sm mb-1">
            <span className="font-bold text-purple-700">
              Earning :
            </span>{" "}
            ₹ {chat.coinsEarned}
          </p>

          <p className="text-sm mb-1">
            <span className="font-bold text-purple-700">
              Duration :
            </span>{" "}
            {chat.durationMinutes} min
          </p>

          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-1">
              <span className="font-bold text-purple-700">
                Rating:
              </span>

              {renderStars(chat.rating)}
            </div>

            <span
              className={`font-semibold ${
                chat.status === "COMPLETED"
                  ? "text-green-500"
                  : "text-orange-500"
              }`}
            >
              {chat.status}
            </span>
          </div>

          {/* REVIEW */}

          <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-4 min-h-[90px]">
            <p className="font-bold text-purple-700 mb-2">
              Review :
            </p>

            <p className="text-sm text-gray-600">
              {chat.reviewComment ||
                "No review available."}
            </p>
          </div>

          {/* BUTTONS */}

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              onClick={() => {
                setSelectedSession(chat.sessionId);
                setOpenModal(true);
              }}
              className="border border-blue-400 text-blue-500 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-blue-50"
            >
              <Eye size={16} />
              View Chat
            </button>

            <button
              className="bg-purple-600 text-white rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-purple-700"
            >
              <FileText size={16} />
              Open Kundli
            </button>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full text-center py-10 text-gray-500">
      No chat history found
    </div>
  )}
</div>

<SessionMessagesModal
  open={openModal}
  onClose={() => setOpenModal(false)}
  sessionId={selectedSession}
/>

<div className="flex items-center justify-between mt-8">
  <p className="text-sm text-gray-500">
    Page {chatHistory?.currentPage || 1} of{" "}
    {chatHistory?.totalPages || 1}
  </p>

  <div className="flex gap-2">
    <button
      disabled={page === 1}
      onClick={() => setPage((prev) => prev - 1)}
      className="px-4 py-2 border rounded-xl disabled:opacity-50"
    >
      Previous
    </button>

    <button
      disabled={page === chatHistory?.totalPages}
      onClick={() => setPage((prev) => prev + 1)}
      className="px-4 py-2 border rounded-xl disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>
    </div>
  );
}
