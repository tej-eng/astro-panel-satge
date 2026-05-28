"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Wallet, ArrowDownCircle, ArrowUpCircle, Clock, MessageSquare } from "lucide-react";

const GRAPHQL_URL = "http://localhost:4000/graphql";

export default function AstrologerEarnings() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Replace with your auth token logic
  const token = "YOUR_ACCESS_TOKEN";

  const fetchEarnings = async () => {
    try {
      setLoading(true);

      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetAstrologerEarnings {
              getAstrologerEarnings {
                summary {
                  totalEarnings
                  totalWithdrawn
                  currentBalance
                  totalSessions
                  totalChatMinutes
                }
                transactions {
                  id
                  type
                  amount
                  coins
                  description
                  createdAt
                }
              }
            }
          `,
        }),
      });

      const data = await res.json();

      setEarnings(data?.data?.getAstrologerEarnings);
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  // SEARCH + FILTER
  const filteredTransactions = useMemo(() => {
    if (!earnings?.transactions) return [];

    return earnings.transactions.filter((item) => {
      const matchesSearch =
        item?.description
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item?.id?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "ALL" || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [earnings, search, typeFilter]);

  const summary = earnings?.summary;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Astrologer Earnings
        </h1>

        <p className="text-gray-500 mt-1">
          Track earnings, withdrawals & session revenue
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        {/* Total Earnings */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Total Earnings
            </span>

            <Wallet className="w-5 h-5 text-green-600" />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            ₹{summary?.totalEarnings || 0}
          </h2>
        </div>

        {/* Withdrawn */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Withdrawn
            </span>

            <ArrowUpCircle className="w-5 h-5 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            ₹{summary?.totalWithdrawn || 0}
          </h2>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Current Balance
            </span>

            <ArrowDownCircle className="w-5 h-5 text-blue-500" />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            ₹{summary?.currentBalance || 0}
          </h2>
        </div>

        {/* Sessions */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Sessions
            </span>

            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            {summary?.totalSessions || 0}
          </h2>
        </div>

        {/* Minutes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Chat Minutes
            </span>

            <Clock className="w-5 h-5 text-orange-500" />
          </div>

          <h2 className="text-2xl font-bold mt-3 text-gray-800">
            {summary?.totalChatMinutes || 0}
          </h2>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-2xl shadow-sm border p-4 mb-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search by description or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="ALL">All Types</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Transaction ID
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Type
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Coins
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Description
                </th>

                <th className="text-left p-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    Loading earnings...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* ID */}
                    <td className="p-4 text-sm font-medium text-gray-700">
                      {item.id}
                    </td>

                    {/* TYPE */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.type === "CREDIT"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>

                    {/* AMOUNT */}
                    <td className="p-4 font-semibold text-gray-800">
                      ₹{item.amount}
                    </td>

                    {/* COINS */}
                    <td className="p-4 text-gray-700">
                      {item.coins}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="p-4 text-gray-600">
                      {item.description}
                    </td>

                    {/* DATE */}
                    <td className="p-4 text-gray-500 text-sm">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}