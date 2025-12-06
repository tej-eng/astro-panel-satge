"use client";

import React, { useState } from "react";
import { useGetKundaliQuery } from "@/app/redux/slice/kundaliSlice";
import FreeReportSection from "./FreeReport";
import BasicDetails from "./BasicDetails";
import Kundli from "./KundliTab";
import Charts from "./Charts";

function PlanetsDetails({ planetsData }) {
  return (
    <section>
      <div className="space-y-10 p-6 bg-white rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Planets Data</h2>

        <div className="w-full overflow-x-auto">
          <div className="w-[70vw]">
            <table className="lg:w-[77vw] w-[100vw] text-sm">
              {/* <table className="w-full table-auto border-collapse overflow-hidden shadow-sm"> */}
              <thead className="bg-[#7e60bf]">
                <tr>
                  {["Name", "Sign", "Degree", "House", "Nakshatra", "Retro", "Sign Lord"].map((title) => (
                    <th key={title} className="border border-black px-4 py-2 text-sm font-semibold text-white">
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(planetsData || []).map((p, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{p.name}</td>
                    <td className="border px-4 py-2">{p.sign}</td>
                    <td className="border px-4 py-2">{p.normDegree?.toFixed?.(2) || "—"}</td>
                    <td className="border px-4 py-2">{p.house}</td>
                    <td className="border px-4 py-2">{p.nakshatra}</td>
                    <td className="border px-4 py-2">{p.isRetro === "true" || p.isRetro === true ? "Yes" : "No"}</td>
                    <td className="border px-4 py-2">{p.signLord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
    </section>
  );
}

export default function KundaliPage({ orderId }) {
  const { data, error, isLoading } = useGetKundaliQuery(orderId);
  const [activeTab, setActiveTab] = useState("basic");

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-500">Error loading Kundali data.</div>;

  const {
    request_session_id,
    user_name = "",
    data: kundaliData = {}
  } = data || {};

  const {
    user_data = {},
    postData = {},
    BirthData = {},
    Avakhada = {},
    AscendantData1 = {},
    AscendantData2 = {},
    PlanetsData = [],
    charts = {},
    planetaryReport = [],
    KalsarpaData = {},
    ManglikData = {},
    VimMahaDasha = [],
  } = kundaliData;

  const tabs = [
    {
      id: "basic",
      label: "Basic",
      component: (
        <BasicDetails
          birthData={{ ...BirthData, ...user_data }}
          avakhada={Avakhada}
          user_name={user_name}
          postData={postData}
          signs={PlanetsData}
        />
      ),
    },
    {
      id: "kundli",
      label: "Kundli",
      component: <Kundli planetsData={PlanetsData} charts={charts} VimMahaDasha={VimMahaDasha} />,
    },
    {
      id: "planets",
      label: "Planets",
      component: <PlanetsDetails planetsData={PlanetsData} />,
    },
    {
      id: "divcharts",
      label: "Divisional Charts",
      component: <Charts charts={charts} />,
    },
    {
      id: "freereport",
      label: "Free Report",
      component: (
        <FreeReportSection
          basicData={AscendantData1?.asc_report?.ascendant || ""}
          BasicReport={AscendantData1?.asc_report?.report || ""}
          planetaryReport={planetaryReport}
          AscendantData2={AscendantData2}
          KalsarpaData={KalsarpaData}
          ManglikData={ManglikData}
        />
      ),
    },
  ];

  return (
    <div className="w-full mx-auto space-y-8">
      <header>
        <h2 className="wallet-head mx-auto text-center">Kundali Page</h2>
        <p className="text-bold text-gray-900">Order ID: {request_session_id}</p>
      </header>

      <div className="bg-[#2f1254] px-4 py-3 font-semibold rounded-lg">
        <ul className="grid md:grid-cols-5 grid-cols-3 justify-between gap-5">
          {tabs.map((tab) => (
            <li
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer text-white text-[0.8rem] sm:text-base px-2 pt-3 pb-3 text-center rounded-full ${activeTab === tab.id ? "bg-purple-500" : ""
                }`}
            >
              {tab.label}
            </li>
          ))}
        </ul>
      </div>

      <div>{tabs.find((tab) => tab.id === activeTab)?.component}</div>
    </div>
  );
}