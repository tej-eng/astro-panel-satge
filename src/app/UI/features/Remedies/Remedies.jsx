"use client"
import { useGetRemedyApiQuery } from '@/app/redux/slice/remedySlice';
import styles from '@/app/UI/features/Remedies/remdies.module.css'
import React, { useState} from 'react';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import BasicPagination from "../../PaginationUI/Pagination";
import useFilteredSearch from "@/hooks/useFilteredSearch";

dayjs.extend(utc);
dayjs.extend(timezone);

const Remedy = () => {
   const [page, setPage] = useState(1);
  const { data, error, isLoading , isFetching } = useGetRemedyApiQuery({ page });

  const massege = data?.message || [];
  const filteredData = useFilteredSearch(massege, [
    "updated_at",
    "type",
    "order_id",
  ]);
  
  const sortedData = filteredData?.slice().sort((a, b) => {
    return new Date(b.updated_at) - new Date(a.updated_at);
  });
  
  
 
  
 
  const pagination = data?.pagination || {};
  if (isLoading) return <p>Loading Remedy...</p>;
  if (error) return <p>Error fetching Remedy data.</p>;
  if (!data) return <p>API Response is undefined</p>;
  if (!sortedData || sortedData.length === 0) return <p>No Remedy Data Found</p>;
// if (!filteredData) return <p>No Remedy Data Found</p>;


  return (
    <div className={`${styles["calling-his"]} flex items-center flex-col gap-4 `}>
      <h2 className={`${styles["wallet-head"]} text-center`}>Suggested Remedies</h2>

      <div className={`${styles["store-his-box"]} flex gap-[3rem] justify-center md:justify-start flex-wrap py-5`}>
        {sortedData?.map((remedy, index) => (
                        
          <div key={index} className={`${styles["card-rem"]} flex flex-col`}>
            <div className={`${styles["call-top"]} flex items-start justify-between`}>
              <div className={`${styles["cal-od-rem"]} flex items-start justify-between flex-col`}>
                <span className={`${styles["store-top"]} flex items-center`}>
                  <span className={`${styles["odr-sp"]} flex`}>Order ID:</span>
                  <span className={styles["id-nm"]}>{remedy.order_id}</span>
                </span>
               
              </div>
            </div>
            <hr style={{ margin: ".1rem" }} />

            <div className={`${styles["call-card-det"]} flex items-start justify-between flex-col`}>
              <div className={`${styles["cal-od-id"]} flex items-center justify-between`}>
                <span className={styles["odr-sp"]}>Type:</span>
                <span className={styles["id-nm"]}>{remedy.type}</span>
              </div>
              <div className={`${styles["cal-od-id"]} flex items-center justify-between`}>

                <span className={styles["odr-sp"]}>{dayjs.utc(remedy.updated_at).tz("Asia/Kolkata").format("DD-MM-YYYY hh:mm A")}
                </span>
           
              </div>
              {/* <hr style={{ margin: ".1rem" }} /> */}
              <div className={`${styles["card-rev"]} flex flex-col`}>
                <span className={styles["rev-span"]}>
                  <b>Description:</b>
                </span>
                <p className={`overflow-x-hidden  ${styles["rev-astro"]} ${styles["card-rev"]} mb-0`}>
                {remedy.message}
                </p>
              </div>
            </div>
       
          </div>
        ))}
      </div>
      <BasicPagination
        currentPage={pagination?.current_page || 1}
        totalPages={pagination?.last_page || 1}
        onPageChange={(newPage) => setPage(newPage)}
        siblingCount={1}
  boundaryCount={1}
  showInfo={true}
  isLoading={isFetching}
      />
      {isFetching && (
        <div className="mt-2 text-sm text-gray-500">Loading Page...</div>
      )}
    </div>
  );
};

export default Remedy;
