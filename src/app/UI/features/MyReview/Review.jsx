"use client";
import styles from "@/app/UI/features/MyReview/review.module.css";
import { FaFlag, FaReply } from "react-icons/fa6";
import { MdPushPin } from "react-icons/md";
import { useState, useEffect } from "react";
import Link from "next/link";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import BasicPagination from "../../PaginationUI/Pagination";
import useFilteredSearch from "@/hooks/useFilteredSearch";
import { toast } from "react-toastify";

import {
  useGetReviewApiQuery,
  usePostReplyMutation,
  useDeleteReplyMutation,
} from "@/app/redux/slice/getReviewSlice";
import { FadeLoader } from "react-spinners";

export default function Review() {
  const [postReply, { isLoading: isSubmitting }] = usePostReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();

  const [page, setPage] = useState(1);
  const [perPage] = useState(12);
  const {
    data = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetReviewApiQuery({ page, per_page: perPage });
  const recordList = data?.data || [];
  const filteredData = useFilteredSearch(recordList, [
    "user.name",
    "user_id",
    "orderid",
    "item_type",
  ]);
  const pagination = data || {};

  const [filter, setFilter] = useState("all");
  const [isMounted, setIsMounted] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState({});
  const [replies, setReplies] = useState({});
  const [editingReply, setEditingReply] = useState({});
  const [replyTimestamps, setReplyTimestamps] = useState({});
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (Array.isArray(data?.data)) {
      const initialReplies = {};
      data.data.forEach((review) => {
        initialReplies[review.id] = review.Astroreply || "";
      });

      setReplies((prevReplies) => {
        const isSame =
          JSON.stringify(prevReplies) === JSON.stringify(initialReplies);
        return isSame ? prevReplies : initialReplies;
      });
    }
  }, [data]);
  const handleReplyClick = (reviewId) => {
    setShowReplyBox((prev) => ({ ...prev, [reviewId]: true }));
    setEditingReply((prev) => ({ ...prev, [reviewId]: false }));
  };

  const handleCancelReply = (reviewId) => {
    setShowReplyBox((prev) => ({ ...prev, [reviewId]: false }));
    setEditingReply((prev) => ({ ...prev, [reviewId]: false }));
  };

  const handleReplyChange = (reviewId, text) => {
    const currentTime = new Date().toLocaleString();
    setReplies((prev) => ({ ...prev, [reviewId]: text }));
    setReplyTimestamps((prev) => ({ ...prev, [reviewId]: currentTime }));
  };
  const handleSubmitReply = async (reviewId) => {
    const replyText = replies[reviewId]?.trim();

    if (!replyText) {
      return toast.error("Please enter a reply before submitting.");
    }

    // console.log("Reply to send:", replyText);

    try {
      const response = await postReply({
        review_id: reviewId,
        astroreply: replyText,
      }).unwrap();

      setReplies((prev) => ({
        ...prev,
        [reviewId]: replyText,
      }));

      setShowReplyBox((prev) => ({ ...prev, [reviewId]: false }));

      toast.success("Reply submitted successfully!");
    } catch (error) {
      // console.error("RTK error submitting reply:", error);
      toast.error("Failed to submit reply. Please try again.");
    }
  };

  const handleEditReply = (reviewId) => {
    setEditingReply((prev) => ({ ...prev, [reviewId]: true }));
    setShowReplyBox((prev) => ({ ...prev, [reviewId]: true }));
    setReplies((prev) => ({ ...prev, [reviewId]: prev[reviewId] || "" }));
  };

  const handleDeleteReply = async (reviewId) => {
    if (!reviewId) return toast.error("Invalid reply ID.");
    if (confirmingDeleteId !== reviewId) {
      setConfirmingDeleteId(reviewId);
      toast.info("Click Delete again to confirm.");
      return;
    }
    setConfirmingDeleteId(null);
    setReplies((prev) => ({ ...prev, [reviewId]: "" }));
    try {
      await deleteReply({ review_id: reviewId }).unwrap();
      setReplies((prev) => ({ ...prev, [reviewId]: "" }));
      await refetch();
      toast.success("Reply deleted successfully!");
    } catch (err) {
      setReplies((prev) => ({
        ...prev,
        [reviewId]: recordList.find((r) => r.id === reviewId)?.Astroreply || "",
      }));
      toast.error("Failed to delete reply.");
    }
  };

  if (!isMounted) return null;
  if (isLoading)
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <FadeLoader color="#2f1254" height={17} width={5} />
        <div className="mt-2">Loading call history...</div>
      </div>
    );

  return (
    <div
      className={`${styles["my-review-main"]} flex flex-col items-center justify-center `}
    >
      <h2 className={`${styles["wallet-head"]} text-center`}>My Reviews</h2>

      <div className={`${styles["top-down"]} flex items-center flex-col`}>
        <div
          className={`${styles["review-select"]} flex gap-2 md:gap-[15rem]  justify-between p-0`}
        >
          <select
            className={`${styles["custom-select"]} bg-white border border-gray-300 rounded p-2`}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Show All Reviews</option>
            <option value="Chat">Chat</option>
            <option value="Call">Call</option>
          </select>
          <select
            className={`${styles["custom-select"]} bg-white border border-gray-300 rounded p-2`}
            defaultValue="all"
          >
            <option>My Reviews</option>
            <option value="Positive">Positive</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </div>

      <div className={`${styles["review-cond"]}`}>
        <span className="flex items-center justify-between">
          <span className={`${styles["fl-spn"]}`}>Flagged Review</span>
          <span className={`${styles["fl-spn"]}`}>Excluded PO & SO</span>
          <span className={`${styles["fl-spn"]}`}>3</span>
        </span>
        <span className="flex items-center justify-between">
          <span className={`${styles["fl-spn"]}`}>
            Missed Call & Chat Review
          </span>
          <span className={`${styles["fl-spn"]}`}>13</span>
        </span>
        <span className="flex items-center justify-between">
          <span className={`${styles["fl-spn"]}`}>
            <b>Used Balance</b>
          </span>
          <span className={`${styles["fl-spn"]}`}>
            <b>15/16</b>
          </span>
        </span>
        <span className="flex items-center justify-between">
          <span className={`${styles["fl-spn"]}`}>
            <b>Note:</b> System gives you a maximum of 90 flags. Inclusive of
            missed call and chat.
          </span>
        </span>
      </div>

      <div
        className={`${styles["store-his-box"]} flex items-start flex-wrap py-3 gap-10`}
      >
        {filteredData.map((review) => {
          const finalRating = parseFloat(review.rating) || 0;
          const ratingColor =
            finalRating < 3 ? "red" : finalRating > 3.5 ? "#32cd32" : "default";
          return (
            <div
              key={review.id}
              className={`${styles["card-review"]} flex flex-col`}
            >
              <div
                className={`${styles["call-top"]} flex items-center justify-between`}
              >
                <div className="flex items-start justify-between flex-col">
                  <span className={`${styles["store-top"]} flex items-center`}>
                    <span className={`${styles["odr-sp"]}`}>Name:</span>{" "}
                    <span className={`${styles["id-nm"]}`}>
                      {review.user?.name || "Unknown"} ({review.user_id})
                    </span>
                  </span>
                  <span className={`${styles["store-top"]} flex items-center`}>
                    <span className={`${styles["odr-sp"]}`}>Order ID :</span>{" "}
                    <span className={`${styles["id-nm"]}`}>
                      {review.orderid || "N/A"}
                    </span>
                  </span>
                </div>
                <div
                  className={`${styles["cal-od-id"]} flex items-end justify-between flex-col`}
                >
                  <Link href="#" className={`${styles["rev-det"]}`}>
                    <FaFlag />
                  </Link>
                  <Link href="#" className={`${styles["rev-det"]}`}>
                    <MdPushPin />
                  </Link>
                </div>
              </div>
              <hr style={{ margin: ".1rem" }} />
              <div
                className={`${styles["cal-od-rev"]}  flex items-center justify-between`}
              >
                <div className="">
                  <span className={`${styles["odr-sp"]} `}>Type :</span>{" "}
                  <span className={`${styles["id-nm"]} `}>
                    {review.item_type}
                  </span>
                </div>
                <div>
                  <Stack spacing={1}>
                    <Rating
                      name="half-rating-read"
                      value={finalRating}
                      precision={0.5}
                      readOnly
                      sx={{
                        "& .MuiRating-iconFilled": { color: ratingColor },
                      }}
                    />
                  </Stack>
                </div>
              </div>
              <div
                className={`${styles["cal-od-id"]} flex items-center justify-between`}
              >
                <span className={`${styles["odr-sp"]}`}>
                  {review.updated_at
                    ? new Date(review.updated_at).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "N/A"}
                  {/* {console.log(review.user?.updated_at)} */}
                </span>
              </div>
              <div className={`${styles["call-card-det"]} flex flex-col`}>
                <span className={`${styles["rev-span"]}`}>
                  <b>Comment:</b>
                </span>
                <div
                  className={`${styles["rev-astro"]} mb-0 max-h-16 overflow-y-auto break-words text-xs p-1 `}
                  style={{ wordBreak: "break-word", minHeight: "1.5rem" }}
                >
                  {(!review.comments || review.comments === "Null")
                    ? "No comments available."
                    : review.comments}
                </div>
              </div>
              <div
                className={`${styles["xtra-rem"]} flex items-center justify-between w-[100%]`}
              >
                {!replies[review.id] && !showReplyBox[review.id] && (
                  <button
                    onClick={() => handleReplyClick(review.id)}
                    className={`${styles["xtra-rev23"]} mt-2 bg-success cursor-pointer text-xs text-white py-1 px-3 rounded-lg bg-[#7e60bf] `}
                  >
                    Reply
                  </button>
                )}

                {(review.Astroreply || replies[review.id]) && (
                  <>
                    {!showReplyBox[review.id] && (
                      <div
                        className={`${styles["reply-section"]} mt-1 p-2 pt-0 rounded w-full bg-gray-300`}
                      >
                        <span className="font-semibold text-[.75rem]">
                          Reply:{" "}
                          <span className="font-light text-[.7rem]">
                            {replyTimestamps[review.id]
                              ? new Date(replyTimestamps[review.id]).toLocaleString(
                                  "en-IN",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : new Date(review.updated_at).toLocaleString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                          </span>
                        </span>

                        <div className="text-[.75rem] p-1 w-full overflow-x-auto break-words h-[3rem] ">
                          {replies[review.id] || review.Astroreply}
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => handleEditReply(review.id)}
                            className="mt-2 cursor-pointer text-xs text-white py-1 px-3 rounded-lg bg-[#7e60bf]"
                          >
                            Edit Reply
                          </button>
                          <button
                            onClick={() => handleDeleteReply(review.id)}
                            className={`mt-2 cursor-pointer text-xs text-white py-1 px-3 rounded-lg bg-gray-400 ${
                              confirmingDeleteId === review.id
                                ? "ring-2 ring-red-500"
                                : ""
                            }`}
                          >
                            {confirmingDeleteId === review.id
                              ? "Confirm Delete"
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {showReplyBox[review.id] && (
                  <div className="mt-2 w-full">
                    <textarea
                      className="w-full bg-white border p-2 rounded"
                      rows="3"
                      placeholder="Write your reply here..."
                      value={replies[review.id]}
                      onChange={(e) =>
                        handleReplyChange(review.id, e.target.value)
                      }
                    />
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      className="mt-2 bg-success cursor-pointer text-xs text-white py-1 px-3 rounded-lg bg-[#7e60bf]"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => handleCancelReply(review.id)}
                      className="bg-gray-400 cursor-pointer text-xs text-white py-1 px-3 mx-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
}
