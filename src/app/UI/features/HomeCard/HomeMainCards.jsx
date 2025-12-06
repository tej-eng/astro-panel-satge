"use client";
import { useRouter } from "next/navigation"; 
import styles from "@/app/UI/features/HomeCard/homemaincard.module.css";
import {
  useGetdosAndDontApiQuery,
  useGetNoticeBoardQuery,
} from "@/app/redux/slice/doesDont";

const HomeMainCards = () => {
  const router = useRouter();
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
  
  
  

  const {
    data: noticeData,
    isLoading: isNoticeLoading,
    error: noticeError,
  } = useGetNoticeBoardQuery();
  const {
    data: dosDontData,
    isLoading: isDosDontLoading,
    error: dosDontError,
  } = useGetdosAndDontApiQuery();

  const cards = [
    {
      title: "Notice Board",
      content: (
        <>
          {isNoticeLoading ? (
            <p>Loading...</p>
          ) : noticeError ? (
            <p className="text-red-500">Failed to load notice board data.</p>
          ) : (
            <div className="space-y-2">
            
              {noticeData?.data?.data?.filter((notice) => isToday(notice.created_at)).length > 0 ? (
                noticeData?.data?.data
                  ?.filter((notice) => isToday(notice.created_at))
                  ?.slice(0, 1)
                  ?.map((notice) => (
                    <div key={notice.id} className="">
                      <h4 className="font-semibold">{notice.heading}</h4>
                      <p className="text-[1rem]">{notice.text}</p>
                      <small className="text-gray-500 text-[1rem]">
                        {formatDateTime(notice.created_at)}
                      </small>
                    </div>
                  ))
              ) : (
             
                [...noticeData?.data?.data]
                ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) 
                  ?.slice(0, 3)
                  ?.map((notice) => (
                    <div key={notice.id} className="">
                      <div className="flex justify-between">
                      <h4 className="font-semibold text-sm">{notice.heading}</h4>
                      <small className="text-[1rem]">
                        {formatDateTime(notice.created_at)}
                      </small>
                      </div>
                      <p className="text-[1rem]">{notice.text}</p>
                      
                    </div>
                  ))
              )}
              {/* <b className="block pt-2 text-center text-gray-700">Dhwani Astro</b> */}
            </div>
          )}
        </>
      ),
      button: {
        label: "View All",
        onClick: () => router.push("dashboard/noticeBoard"),
        buttonClass: " bg-opacity-50",
      },
      cardClass: " bg-opacity-25",
    }
    ,
    
    {
      title: `Do's and Don't`,
      content: (
        <>
          {isDosDontLoading ? (
            <p>Loading...</p>
          ) : dosDontError ? (
            <p className="text-red-500">Failed to load content.</p>
          ) : (
            <div className="text-[1rem]">
              <div
                dangerouslySetInnerHTML={{
                  __html: `${dosDontData?.dos?.slice(0, 200)}...`,
                }}
              />
            {/* <b className="block pt-1 text-center text-gray-700">Dhwani Astro</b> */}
            </div>
          )}
        </>
      ),
      button: {
        label: "View All",
        onClick: () => router.push("dashboard/dosDonts"),
 
        buttonClass: " bg-opacity-50",
      },
      cardClass: "bg-blue-500 bg-opacity-25",
    },
   

  ];

  return (
  
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
  {cards.map((card, index) => (
    <div
      key={index}
      className="bg-gradient-to-br from-purple-300 to-purple-400 rounded-2xl shadow-lg p-6 transition-transform duration-300 hover:-translate-y-1"
    >
      <span className="text-xl font-bold text-purple-950 mb-3 block">
        {card.title}
      </span>

      {card.content && (
        <>
          <div className="text-base text-gray-800 leading-relaxed mb-4">
            {card.content}
          </div>

          {card.button && (
            <button
              onClick={card.button.onClick}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition duration-200 flex place-self-center"
            >
              <div className="flex items-center justify-center space-x-2 ">
                {card.button.label}
              </div>
            </button>
          )}
        </>
      )}
    </div>
  ))}
</div>

  );
};

export default HomeMainCards;
