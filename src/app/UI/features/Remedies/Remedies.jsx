"use client";

import { useState } from "react";
import { GET_SESSION_REMEDIES } from "@/app/utils/panelQueries";
import { useQuery } from "@apollo/client/react";

const Remedies = () => {
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    sessionId: "",
    startDate: "",
    endDate: "",
  });

  const { data, loading, refetch } = useQuery(
    GET_SESSION_REMEDIES,
    {
      variables: {
        filter: {
          page,
          limit: 10,
          ...(filters.sessionId && {
            sessionId: filters.sessionId,
          }),
          ...(filters.startDate && {
            startDate: new Date(
              filters.startDate
            ).toISOString(),
          }),
          ...(filters.endDate && {
            endDate: new Date(
              filters.endDate
            ).toISOString(),
          }),
        },
      },
      fetchPolicy: "network-only",
    }
  );

  const remedies =
    data?.getSessionRemedies?.data || [];

  const totalPages =
    data?.getSessionRemedies?.totalPages || 1;

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  return (
    <div className="w-full p-5">
      {/* Header */}
      <div className="flex justify-center mb-6">
        <h2 className="bg-purple-900 text-yellow-400 px-6 py-2 rounded-lg font-semibold">
          Suggested Remedies
        </h2>
      </div>

      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search Session ID"
            value={filters.sessionId}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sessionId: e.target.value,
              }))
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                startDate: e.target.value,
              }))
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                endDate: e.target.value,
              }))
            }
            className="border p-2 rounded"
          />

          <button
            onClick={handleSearch}
            className="bg-indigo-600 text-white rounded px-4"
          >
            Search
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          Loading...
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {remedies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md border p-4 min-h-[170px]"
              >
                <div className="text-sm text-gray-600">
                  Order ID:
                  <span className="ml-2 font-medium">
                    {item.sessionId}
                  </span>
                </div>

                <hr className="my-2" />

                <div className="text-sm">
                  <span className="font-semibold">
                    Type:
                  </span>{" "}
                  {item.sessionType}
                </div>

                <div className="text-xs text-purple-600 mt-1">
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </div>

                <div className="mt-3">
                  <h4 className="font-semibold">
                    Description:
                  </h4>

                  <p className="text-sm mt-1">
                    {item.remedyText}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {remedies.length === 0 && (
            <div className="text-center py-10">
              No remedies found
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-10">
            <div className="bg-white shadow rounded-xl px-6 py-4 flex items-center gap-4">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                className="disabled:opacity-50"
              >
                ◀
              </button>

              <span>
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((prev) => prev + 1)
                }
                className="disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Remedies;