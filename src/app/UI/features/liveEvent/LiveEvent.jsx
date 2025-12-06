"use client";

import styles from "@/app/UI/features/ChatHistoryCard/chatHistory.module.css";
import { FadeLoader } from "react-spinners";
import { useState } from "react";
import { useGetLiveEventQuery } from "@/app/redux/slice/liveEvent";
import BasicPagination from "../../PaginationUI/Pagination";
import useFilteredSearch from "@/hooks/useFilteredSearch";

const LiveEvent = () => {
  const [page, setPage] = useState(1);
  const [perPage] = useState(12);

  const { data, error, isLoading, isFetching } = useGetLiveEventQuery({ page, per_page: perPage});

  
  const filteredData = useFilteredSearch(data?.data.recordList, [
        "form_meta.fullname",
        "user_id",
        "request_session_id",
        "topic_name",
        "webinar_type",
        "totalDuration",
        "request_status"
      ]);
  const pagination = data?.data?.pagination || {};

  if (isLoading && !data) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <FadeLoader color="#2f1254" height={17} width={5} />
        <div className="mt-2">Loading Live Webinar...</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.callingHis} flex flex-wrap items-center justify-center flex-col  gap-2`}
    >
      <h2 className="wallet-head text-center">Live Event</h2>

      <div className={`${styles.card} items-center flex flex-wrap justify-center md:justify-between py-5 gap-4`}>
        {filteredData.map((card, index) => (
          <div
            className={`${styles.cardChatt} h-fit flex flex-col`}
            key={index}
          >
            <div
              className={`${styles.callTop} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-evenly`}
              >
                <span className={styles.odrSp}>Session ID :</span>
                <span className={styles.idNm}>{card.request_session_id}</span>
              </div>
            </div>

            <hr style={{ margin: ".1rem" }} />

            <div className={styles.calMid}></div>

            <div
              className={`${styles.callCardDet} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-between`}
              >
                <span className={styles.odrSp}>Topic:</span>
                <span className={styles.idNm}>{card.topic_name}</span>
              </div>
            </div>

            <div
              className={`${styles.callRate} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-between`}
              >
                <span className={styles.odrSp}>Type :</span>
                <span className={styles.idNm}>{card.webinar_type}</span>
              </div>
            </div>

            <div className={`${styles.calOdId} flex items-center`}>
              <span className={styles.odrSp}>Start Session :</span>
              <span className={styles.idNm}>{card.start_session_date}</span>
            </div>

            <div
              className={`${styles.callRate} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-between`}
              >
                <span className={styles.odrSp}>End Session :</span>
                <span className={styles.idNm}>{card.end_session_date}</span>
              </div>
            </div>

            <div
              className={`${styles.callDr} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-between`}
              >
                <span className={styles.odrSp}>Duration :</span>
                <span className={styles.idNm}>{card.totalDuration}</span>
              </div>
            </div>

            <div
              className={`${styles.callRate} flex items-center justify-between`}
            >
              <div
                className={`${styles.calOdId} flex items-center justify-between`}
              >
                <span className={styles.odrSp}>Status :</span>
                <span
                  className={`${styles.idNm} ${
                    card.request_status === "Complete"
                      ? styles.textSuccess
                      : styles.textDanger
                  }`}
                >
                  {card.request_status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BasicPagination
        currentPage={page}
        totalPages={pagination?.last_page || 1}
        onPageChange={(newPage) => setPage(newPage)}
        siblingCount={1}
  boundaryCount={1}
  showInfo={true}
  isLoading={isFetching}
      />
      {isFetching && (
        <div className="mt-2 text-sm text-gray-500">Loading data...</div>
      )}
    </div>
  );
};

export default LiveEvent;
