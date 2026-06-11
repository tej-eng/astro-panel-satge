"use client";

import {
  GET_ASTROLOGER_CALL_HISTORY,
  GET_ASTROLOGER_CHAT_HISTORY,
  GET_ASTROLOGER_FOLLOWERS,
} from "@/app/utils/panelQueries";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const earningsData = [
  { day: "Mon", earnings: 1200 },
  { day: "Tue", earnings: 2200 },
  { day: "Wed", earnings: 1800 },
  { day: "Thu", earnings: 3000 },
  { day: "Fri", earnings: 2600 },
  { day: "Sat", earnings: 4200 },
  { day: "Sun", earnings: 3500 },
];

const callChatData = [
  { name: "Calls", total: 120 },
  { name: "Chats", total: 80 },
];

const revenueData = [
  { name: "Call", value: 45000 },
  { name: "Chat", value: 30000 },
  { name: "Remedies", value: 15000 },
  { name: "Store", value: 10000 },
];

const followersData = [
  { month: "Jan", followers: 120 },
  { month: "Feb", followers: 180 },
  { month: "Mar", followers: 260 },
  { month: "Apr", followers: 390 },
  { month: "May", followers: 520 },
  { month: "Jun", followers: 710 },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

const ButtonTileList = () => {
  const astroUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user"))
      : null;

  const astrologerId = astroUser?.id;
  const { data, loading, error } = useQuery(GET_ASTROLOGER_FOLLOWERS, {
    variables: {
      astrologerId,
      page: 1,
      limit: 100,
    },
    skip: !astrologerId,
    fetchPolicy: "network-only",
  });
  const followers = data?.getAstrologerFollowers?.followers || [];
  const groupedFollowers = followers.reduce((acc, follower) => {
    const date = new Date(follower.createdAt).toLocaleDateString("en-GB");

    acc[date] = (acc[date] || 0) + 1;

    return acc;
  }, {});
  let runningTotal = 0;

  const followersChartData = Object.entries(groupedFollowers)
    .sort(
      ([a], [b]) =>
        new Date(a.split("/").reverse().join("-")) -
        new Date(b.split("/").reverse().join("-")),
    )
    .map(([date, count]) => {
      runningTotal += count;

      return {
        date,
        followers: runningTotal,
      };
    });

  // chat call bar chart
  const [period, setPeriod] = useState("weekly");
  const { data: chatData } = useQuery(GET_ASTROLOGER_CHAT_HISTORY, {
    variables: {
      page: 1,
      limit: 1000,
    },
  });

  const { data: callData } = useQuery(GET_ASTROLOGER_CALL_HISTORY, {
    variables: {
      page: 1,
      limit: 1000,
    },
  });
  const chatHistory = chatData?.getAstrologerChatHistory?.data || [];

  const callHistory = callData?.getAstrologerCallHistory?.data || [];
  const filterByPeriod = (data, period) => {
    const now = new Date();

    return data.filter((item) => {
      const itemDate = new Date(item.createdAt);

      if (period === "weekly") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        return itemDate >= sevenDaysAgo;
      }

      if (period === "monthly") {
        return (
          itemDate.getMonth() === now.getMonth() &&
          itemDate.getFullYear() === now.getFullYear()
        );
      }

      return true; // all
    });
  };
  const filteredChats = filterByPeriod(chatHistory, period);

  const filteredCalls = filterByPeriod(callHistory, period);
  const chartData = [
    {
      service: "Chats",
      total: filteredChats.length,
    },
    {
      service: "Calls",
      total: filteredCalls.length,
    },
  ];
  {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Astrology Analytics Dashboard
        </h1>

        {/* Top Cards */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 shadow">
            <h3>Total Earnings</h3>
            <p className="text-2xl font-bold">₹1,00,000</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow">
            <h3>Followers</h3>
            <p className="text-2xl font-bold">710</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow">
            <h3>Calls</h3>
            <p className="text-2xl font-bold">120</p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow">
            <h3>Chats</h3>
            <p className="text-2xl font-bold">80</p>
          </div>
        </div>

        {/* Charts Grid */}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Earnings Trend */}

          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Earnings Trend</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={earningsData}>
                <CartesianGrid strokeDasharray="5 2" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Call vs Chat */}

          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Call vs Chat</h2>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setPeriod("weekly")}
                className="border px-3 py-1"
              >
                Weekly
              </button>

              <button
                onClick={() => setPeriod("monthly")}
                className="border px-3 py-1"
              >
                Monthly
              </button>

              <button
                onClick={() => setPeriod("all")}
                className="border px-3 py-1"
              >
                All Time
              </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="service" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar dataKey="total" name="Sessions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Followers Growth */}

          <div className="w-full bg-white rounded-lg shadow p-4 mb-8">
            <h2 className="text-lg font-semibold mb-4">Followers Growth</h2>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={followersChartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="date" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Distribution */}

          <div className="bg-white p-5 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Revenue Distribution</h2>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
};

export default ButtonTileList;
