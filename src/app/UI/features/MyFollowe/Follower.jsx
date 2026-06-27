"use client";

import styles from "@/app/UI/features/MyFollowe/follower.module.css";
import useFilteredSearch from "@/hooks/useFilteredSearch";
import { GET_ASTROLOGER_FOLLOWERS } from "@/app/utils/panelQueries";
import { useQuery } from "@apollo/client/react";

export default function Followers() {
const astroUser =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("astro_user"))
    : null;

const astrologerId = astroUser?.id;

  const { data, loading, error } = useQuery(
    GET_ASTROLOGER_FOLLOWERS,
    {
      variables: {
        astrologerId,
        page: 1,
        limit: 20,
      },
      skip: !astrologerId,
      fetchPolicy: "network-only",
    }
  );
const totalFollowers =
  data?.getAstrologerFollowers?.total || 0;

console.log("astroUser", astroUser);
console.log("astrologerId", astrologerId);
Object.keys(localStorage).forEach(key => {
  console.log(key, localStorage.getItem(key));
});

  const followers =
    data?.getAstrologerFollowers?.followers || [];

  const filteredData = useFilteredSearch(followers, [
    "user.name",
    "user.mobile",
  ]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading followers</p>;



  return (
    <div
      className={`${styles["astro-follower"]} flex flex-col justify-center items-center sm:gap-4 py-2 sm:py-5`}
    >
      <div className="flex justify-self-center">
        <h2 className={`${styles["wallet-head"]} text-center`}>
          My Followerss
        </h2>
          <p className="text-sm text-gray-600">
    Total Followers: {totalFollowers}
  </p>
      </div>

      <div
        className={`${styles["follower-box"]} grid grid-cols-2 py-5 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-[3.6rem] gap-5`}
      >
        {filteredData.map((follower) => (
          <div
            key={follower.id}
            className={`${styles["follow-card"]} h-[180px] md:h-[200px]`}
          >
            <div className="flex flex-col items-center justify-between h-full">
              <div
                className={`${styles["f-img"]} flex items-center justify-center w-15 h-15 md:w-20 md:h-20 rounded-full bg-gray-200`}
              >
                👤
              </div>

              <div
                className={`${styles["f-card-con"]} flex flex-col items-start justify-between`}
              >
                <h3
                  className={`${styles["top-fll"]} text-black mb-0`}
                >
                  {follower.user?.name || "No Name"}
                </h3>

                <small
                  className={`${styles["top-fll"]} text-black`}
                >
                  User ID: {follower.user?.id}
                </small>

                <small
                  className={`${styles["top-fll"]} text-black`}
                >
                  {/* {follower.user?.countryCode}
                  {follower.user?.mobile} */}
                </small>

                <small
                  className={`${styles["top-fll"]} text-black`}
                >
                  Followed:{" "}
                  {new Date(
                    follower.createdAt
                  ).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}