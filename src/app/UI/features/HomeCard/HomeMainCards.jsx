"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import { GetAstrologerNotices } from "@/app/utils/panelQueries";
import { useGetdosAndDontApiQuery } from "@/app/redux/slice/doesDont";

const HomeMainCards = () => {
  const router = useRouter();

  const astroUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("astro_user") || "null")
      : null;

  const astrologerId = astroUser?.id;

  const {
    data: noticeData,
    loading: isNoticeLoading,
    error: noticeError,
  } = useQuery(GetAstrologerNotices, {
    variables: {
      astrologerId,
    },
    skip: !astrologerId,
    fetchPolicy: "network-only",
  });

  const {
    data: dosDontData,
    isLoading: isDosDontLoading,
    error: dosDontError,
  } = useGetdosAndDontApiQuery();

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

  const notices = noticeData?.getAstrologerNotices || [];

  const todayNotices = notices.filter((notice) => isToday(notice.createdAt));

  const latestNotices = [...notices]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const cards = [
    {
      title: "Notice Board",

      content: (
        <>
          {isNoticeLoading ? (
            <p>Loading...</p>
          ) : noticeError ? (
            <p className="text-red-500">Failed to load notices.</p>
          ) : notices.length === 0 ? (
            <p className="text-gray-500">No notices available.</p>
          ) : (
            <div className="space-y-3">
              {todayNotices.length > 0
                ? todayNotices.slice(0, 1).map((notice) => (
                    <div key={notice.id}>
                      <div className="flex items-center gap-2">
                        {notice.isPinned && (
                          <span className="text-red-500">📌</span>
                        )}

                        <h4 className="font-semibold text-sm">
                          {notice.title}
                        </h4>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">
                        {notice.description.length > 120
                          ? `${notice.description.slice(0, 120)}...`
                          : notice.description}
                      </p>

                      <small className="text-gray-500">
                        {/* {formatDateTime(notice.createdAt)} */}
                      </small>
                    </div>
                  ))
                : latestNotices.map((notice) => (
                    <div
                      key={notice.id}
                      className="border-b pb-2 last:border-b-0"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          {notice.isPinned && (
                            <span className="text-red-500">📌</span>
                          )}

                          <h4 className="font-semibold text-sm">
                            {notice.title}
                          </h4>
                        </div>

                        <small className="text-gray-500 whitespace-nowrap">
                          {/* {new Date(notice.createdAt).toLocaleDateString()} */}
                        </small>
                      </div>

                      <p className="text-sm text-gray-700 mt-1">
                        {notice.description.length > 80
                          ? `${notice.description.slice(0, 80)}...`
                          : notice.description}
                      </p>
                    </div>
                  ))}
            </div>
          )}
        </>
      ),

      button: {
        label: "View All",
        onClick: () => router.push("/dashboard/noticeBoard"),
      },
    },

    {
      title: "Do's and Don't",

      content: (
        <>
          {isDosDontLoading ? (
            <p>Loading...</p>
          ) : dosDontError ? (
            <p className="text-red-500">Failed to load content.</p>
          ) : (
            <div className="text-sm">
              <div
                dangerouslySetInnerHTML={{
                  __html: `${dosDontData?.dos?.slice(0, 200)}...`,
                }}
              />
            </div>
          )}
        </>
      ),

      button: {
        label: "View All",
        onClick: () => router.push("/dashboard/dosDonts"),
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-2xl shadow-lg p-6 transition-transform duration-300 hover:-translate-y-1"
        >
          <span className="text-xl font-bold text-purple-950 mb-3 block">
            {card.title}
          </span>

          <div className="text-base text-gray-800 leading-relaxed mb-4 min-h-[140px]">
            {card.content}
          </div>

          <button
            onClick={card.button.onClick}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-200 flex place-self-center"
          >
            {card.button.label}
          </button>
        </div>
      ))}
    </div>
  );
};

export default HomeMainCards;
