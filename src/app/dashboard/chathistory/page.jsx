"use client";

import { useMemo, useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import {
  Search,
  MessageCircle,
  Clock3,
  Coins,
  IndianRupee,
  Phone,
  CalendarDays,
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
        roomId
        userName
        userMobile
        userCountryCode
        startedAt
        endedAt
        createdAt
        status
        durationSec
        durationMinutes
        ratePerMin
        coinsEarned
        commission
        lastMessage
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
        item?.roomId?.toLowerCase().includes(searchValue) ||
        item?.userMobile?.includes(searchValue) ||
        item?.lastMessage?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || item?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [chatHistory, search, statusFilter]);

  if (error) {
    return <div className="p-6 text-red-500">Error loading chat history</div>;
  }

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
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  User
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Session
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Duration
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Rate/Min
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Coins
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Commission
                </th>

                <th className="p-4 text-left text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    Loading chat history...
                  </td>
                </tr>
              ) : filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <tr
                    key={chat.sessionId}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* USER */}
                    <td className="p-4">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {chat.userName}
                        </h3>

                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Phone className="w-3 h-3" />

                          <span>
                            {chat.userCountryCode} {chat.userMobile}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* SESSION */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          {chat.sessionId}
                        </p>

                        <p className="text-xs text-gray-500">{chat.roomId}</p>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          chat.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : chat.status === "ONGOING"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {chat.status}
                      </span>
                    </td>

                    {/* DURATION */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock3 className="w-4 h-4" />

                        <span>{chat.durationMinutes} min</span>
                      </div>
                    </td>

                    {/* RATE */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 font-medium text-gray-800">
                        <IndianRupee className="w-4 h-4" />

                        {chat.ratePerMin}
                      </div>
                    </td>

                    {/* COINS */}
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-yellow-600 font-semibold">
                        <Coins className="w-4 h-4" />

                        {chat.coinsEarned}
                      </div>
                    </td>

                    {/* COMMISSION */}
                    <td className="p-4 font-semibold text-red-500">
                      ₹{chat.commission}
                    </td>

                    <td className="p-4 font-semibold text-red-500">
                      <button
                        onClick={() => {
                          setSelectedSession(chat.sessionId);

                          setOpenModal(true);
                        }}
                      >
                        View Chat
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-gray-500">
                    No chat history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <SessionMessagesModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          sessionId={selectedSession}
        />

        {/* PAGINATION */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <p className="text-sm text-gray-500">
            Page {chatHistory?.currentPage || 1} of{" "}
            {chatHistory?.totalPages || 1}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            <button
              disabled={page === chatHistory?.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
