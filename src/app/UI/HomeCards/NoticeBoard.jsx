"use client";
import { useGetNoticeBoardQuery } from "@/app/redux/slice/doesDont";

export default function NoticeBoardPage() {
    const isToday = (dateString) => {
        const today = new Date();
        const date = new Date(dateString);
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      };
      
      const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
     };
      
  const { data, isLoading, error } = useGetNoticeBoardQuery();

  if (isLoading) return <p>Loading notices...</p>;
  if (error) return <p className="text-red-500">Failed to load notices.</p>;

  const allNotices = data?.data?.data || [];

  const todayNotices = allNotices.filter((notice) => isToday(notice.created_at));
  const olderNotices = allNotices.filter((notice) => !isToday(notice.created_at));

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🗓️ Notice Board</h1>

      {todayNotices.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-green-600">Today</h2>
          {todayNotices.map((notice) => (
            <div key={notice.id} className="mb-4 p-4 border rounded shadow bg-green-50">
             <div className="flex justify-between"> 
              <h3 className="text-lg font-semibold">{notice.heading}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(notice.created_at)}
              </p>
              </div>
              <p className="text-gray-700">{notice.text}</p>
              {/* <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(notice.created_at)}
              </p> */}
            </div>
          ))}
        </div>
      )}

      {olderNotices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Previous Notices</h2>
          {olderNotices.map((notice) => (
            <div key={notice.id} className="mb-4  bg-gray-100 p-4 rounded-xl">
              <div className="flex justify-between"> 
              <h3 className="text-lg font-semibold">{notice.heading}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(notice.created_at)}
              </p>
              </div>
              <p className="text-gray-700">{notice.text}</p>
              {/* <p className="text-sm text-gray-500 mt-1">
                {formatDateTime(notice.created_at)}
              </p> */}
            </div>
          ))}
        </div>
      )}

      {todayNotices.length === 0 && olderNotices.length === 0 && (
        <p className="text-gray-500">No notices available.</p>
      )}
    </div>
  );
}
