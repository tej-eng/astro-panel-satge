"use client";

import { useMemo, useState } from "react";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

import {
  Search,
  Phone,
  Clock3,
  Coins,
  CalendarDays,
  IndianRupee,
  BadgeCheck,
  Globe,
  Activity,
} from "lucide-react";
import { GET_ASTROLOGER_CALL_HISTORY, GET_REMEDIES, SEND_REMEDY } from "@/app/utils/panelQueries";

export default function AstrologerCallHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("COMPLETED");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
const [showModal, setShowModal] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [remedyText, setRemedyText] = useState("");
const [selectedRemedy, setSelectedRemedy] = useState(null);
const { data: remediesData, loading: remediesLoading } =
  useQuery(GET_REMEDIES);

const [sendRemedyMutation] = useMutation(SEND_REMEDY);
const handleSubmitRemedy = async () => {
  const finalRemedy = remedyText?.trim() || selectedRemedy?.description;

  if (!finalRemedy) {
    toast.error("Please enter or select a remedy");
    return;
  }

  setSubmitting(true);

  try {
    const { data } = await sendRemedyMutation({
      variables: {
        sessionId: selectedOrderId,
        remedyText: finalRemedy,
      },
    });

    if (data?.sendRemedy?.success) {
      toast.success(data.sendRemedy.message);

      setShowModal(false);
      setRemedyText("");
      setSelectedRemedy(null);
    }
  } catch (error) {
    toast.error(error?.message || "Something went wrong");
  } finally {
    setSubmitting(false);
  }
};

  const limit = 10;

  // APOLLO QUERY - Updated with source filter
  const { data, loading, error } = useQuery(GET_ASTROLOGER_CALL_HISTORY, {
    variables: {
      page,
      limit,
      status: statusFilter === "ALL" ? null : statusFilter,
      source: sourceFilter !== "ALL" ? sourceFilter : undefined,
    },
    fetchPolicy: "network-only",
  });

  const callHistory = data?.getAstrologerCallHistory;

  // SEARCH + FILTER
  const filteredCalls = useMemo(() => {
    if (!callHistory?.data) return [];

    return callHistory.data.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item?.userName?.toLowerCase().includes(searchValue) ||
        item?.sessionId?.toLowerCase().includes(searchValue) ||
        item?.roomId?.toLowerCase().includes(searchValue);
      // ❌ Removed: item?.userMobile?.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || item?.status === statusFilter;

      const matchesSource =
        sourceFilter === "ALL" || item?.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [callHistory, search, statusFilter, sourceFilter]);

  if (error) {
    return <div className="p-6 text-red-500">Error loading call history</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Call History
        </h1>

        <p className="text-gray-500 mt-1">
          Track all customer call sessions & earnings
        </p>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {/* TOTAL CALLS */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Calls</p>
            <Phone className="w-5 h-5 text-blue-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {callHistory?.totalCount || 0}
          </h2>
        </div>

        {/* CURRENT PAGE */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Current Page</p>
            <CalendarDays className="w-5 h-5 text-purple-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {callHistory?.currentPage || 1}
          </h2>
        </div>

        {/* TOTAL PAGES */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Total Pages</p>
            <Clock3 className="w-5 h-5 text-orange-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {callHistory?.totalPages || 1}
          </h2>
        </div>

        {/* TOTAL EARNINGS */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Amount Earned</p>
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>

          <h2 className="text-3xl font-bold mt-3 text-gray-800">
            {filteredCalls.reduce(
              (acc, item) => acc + (item.coinsEarned || 0),
              0,
            )}
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
              placeholder="Search by user name, session ID, room ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black min-w-[140px]"
          >
            <option value="ALL">All Sources</option>
            <option value="WEB">Web</option>
            <option value="ANDROID">Android</option>
            <option value="IOS">iOS</option>
          </select>

          {/* SOURCE FILTER */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black min-w-[140px]"
          >
            <option value="ALL">All Sources</option>
             <option value="WEB">Web</option>
            <option value="ANDROID">Android</option>
            <option value="IOS">iOS</option>
            {/* Add more source options as needed */}
          </select>
        </div>
      </div>

      {/* TABLE */}
   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {loading ? (
    <div className="col-span-full text-center py-10">
      Loading call history...
    </div>
  ) : filteredCalls.length > 0 ? (
    filteredCalls.map((call) => (
      <div
        key={call.sessionId}
        className="bg-white rounded-2xl border border-purple-200 shadow-sm overflow-hidden"
      >
        <div className="p-5">

          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm">
                <span className="font-bold text-purple-700">
                  Session :
                </span>{" "}
                <span className="text-gray-700">
                  {call.sessionId}
                </span>
              </p>

              <p className="mt-1">
                <span className="font-bold text-purple-700">
                  User :
                </span>{" "}
                {call.userName}
              </p>

              <p className="mt-1 text-sm">
                <span className="font-bold text-purple-700">
                  Source :
                </span>{" "}
                {call.source || "N/A"}
              </p>
            </div>

            <Phone className="text-purple-500" size={20} />
          </div>

          <p className="text-sm mb-2">
            <span className="font-bold text-purple-700">
              Date :
            </span>{" "}
            {new Date(call.createdAt).toLocaleString()}
          </p>

          <p className="text-sm mb-2">
            <span className="font-bold text-purple-700">
              Duration :
            </span>{" "}
            {call.durationMinutes} min
          </p>

          <p className="text-sm mb-2">
            <span className="font-bold text-purple-700">
              Rate :
            </span>{" "}
            ₹ {call.ratePerMin}/min
          </p>

          <p className="text-sm mb-2">
            <span className="font-bold text-purple-700">
              Earned :
            </span>{" "}
            ₹ {call.coinsEarned}
          </p>

          <p className="text-sm mb-2">
            <span className="font-bold text-purple-700">
              Commission :
            </span>{" "}
            ₹ {call.commission}
          </p>

          <div className="flex justify-between items-center mt-5">

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                call.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : call.status === "ONGOING"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {call.status}
            </span>

            {/* <button
              onClick={() => handleDownloadRecording(call.sessionId)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Download Recording
            </button> */}
              <button
    onClick={() => {
      setSelectedOrderId(call.sessionId);
      setShowModal(true);
    }}
    className="flex items-center justify-center gap-2 border border-purple-500 text-purple-700 rounded-xl py-2 hover:bg-purple-50"
  >
    <Activity size={16} />
    Suggest Remedy
  </button>

          </div>
     {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0000009a] bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-[90%] max-w-md max-h-[80vh] overflow-y-auto">
            <div className="text-[1rem] justify-self-center font-semibold mb-4">
              Suggest Remedy for Order ID:
              {selectedOrderId}
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Select Existing Remedy</h4>

              {remediesLoading ? (
                <p>Loading remedies...</p>
              ) : (
                <div className="max-h-[200px] overflow-y-auto border rounded">
                  {remediesData?.getRemedies?.data
                    ?.filter((item) => item.isActive)
                    ?.map((remedy) => (
                      <div
                        key={remedy.id}
                        onClick={() => {
                          setSelectedRemedy(remedy);
                          setRemedyText(remedy.description);
                        }}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                          selectedRemedy?.id === remedy.id
                            ? "bg-indigo-100"
                            : ""
                        }`}
                      >
                        <div className="font-medium">{remedy.title}</div>

                        <div className="text-sm text-gray-600">
                          {remedy.description}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="font-medium block mb-2">
                Or Write New Remedy
              </label>

              <textarea
                disabled={submitting}
                className="w-full border p-2 rounded"
                rows={4}
                placeholder="Enter remedy..."
                value={remedyText}
                onChange={(e) => setRemedyText(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRemedyText("");
                  setSelectedRemedy(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmitRemedy}
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {submitting ? "Submitting..." : "Send Remedy"}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    ))
  ) : (
    <div className="col-span-full text-center py-10 text-gray-500">
      No call history found
    </div>
  )}
</div>
    </div>
  );
}