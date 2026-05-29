"use client";

import { useMemo, useState } from "react";

import { gql } from "@apollo/client";
import {
  useMutation,
  useQuery,
} from "@apollo/client/react";

import {
  Search,
  Star,
  MessageSquare,
  Send,
  CalendarDays,
} from "lucide-react";

const GET_ASTROLOGER_REVIEWS = gql`
  query GetAstrologerReviews(
    $page: Int!
    $limit: Int!
  ) {
    getAstrologerReviews(
      filter: {
        page: $page
        limit: $limit
      }
    ) {
      success
      totalCount

      data {
        id
        userName
        rating
        comment
        reply
        createdAt
      }
    }
  }
`;

const REPLY_TO_REVIEW = gql`
  mutation ReplyToReview(
    $reviewId: String!
    $reply: String!
  ) {
    replyToReview(
      reviewId: $reviewId
      reply: $reply
    ) {
      success
      message
    }
  }
`;

export default function AstrologerReviews() {
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [replyInputs, setReplyInputs] =
    useState({});

  const limit = 10;

  // GET REVIEWS
  const {
    data,
    loading,
    refetch,
  } = useQuery(
    GET_ASTROLOGER_REVIEWS,
    {
      variables: {
        page,
        limit,
      },

      fetchPolicy: "network-only",
    }
  );

  // REPLY MUTATION
  const [replyToReview, { loading: replying }] =
    useMutation(REPLY_TO_REVIEW);

  const reviews =
    data?.getAstrologerReviews;

  // SEARCH FILTER
  const filteredReviews = useMemo(() => {
    if (!reviews?.data) return [];

    return reviews.data.filter(
      (item) => {
        const searchValue =
          search.toLowerCase();

        return (
          item?.userName
            ?.toLowerCase()
            .includes(
              searchValue
            ) ||
          item?.comment
            ?.toLowerCase()
            .includes(
              searchValue
            )
        );
      }
    );
  }, [reviews, search]);

  // HANDLE REPLY
  const handleReply = async (
    reviewId
  ) => {
    try {
      const reply =
        replyInputs[reviewId];

      if (!reply?.trim()) return;

      await replyToReview({
        variables: {
          reviewId,
          reply,
        },
      });

      await refetch();

      setReplyInputs((prev) => ({
        ...prev,
        [reviewId]: "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // RENDER STARS
  const renderStars = (rating) => {
    return [...Array(5)].map(
      (_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 ${
            index < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f3fb] p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#4b1d74]">
            My Reviews
          </h1>

          <p className="text-gray-500 mt-1">
            Customer feedback &
            ratings
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full md:w-[350px]">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="w-full bg-white border border-purple-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* TOTAL */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Total Reviews
            </p>

            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>

          <h2 className="text-3xl font-bold text-[#4b1d74] mt-3">
            {reviews?.totalCount ||
              0}
          </h2>
        </div>

        {/* AVG RATING */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Average Rating
            </p>

            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </div>

          <h2 className="text-3xl font-bold text-[#4b1d74] mt-3">
            {filteredReviews.length >
            0
              ? (
                  filteredReviews.reduce(
                    (acc, item) =>
                      acc +
                      item.rating,
                    0
                  ) /
                  filteredReviews.length
                ).toFixed(1)
              : "0"}
          </h2>
        </div>

        {/* CURRENT PAGE */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Current Page
            </p>

            <CalendarDays className="w-5 h-5 text-purple-500" />
          </div>

          <h2 className="text-3xl font-bold text-[#4b1d74] mt-3">
            {page}
          </h2>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">
          Loading reviews...
        </div>
      ) : (
        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.length >
            0 ? (
              filteredReviews.map(
                (review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md transition p-5"
                  >
                    {/* TOP */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#4b1d74] text-lg">
                          {
                            review.userName
                          }
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(
                            review.createdAt
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* STARS */}
                      <div className="flex items-center gap-1">
                        {renderStars(
                          review.rating
                        )}
                      </div>
                    </div>

                    {/* COMMENT */}
                    <div className="mt-5">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Comment
                      </p>

                      <div className="bg-gray-50 border rounded-xl p-3 text-gray-700 text-sm min-h-[90px]">
                        {
                          review.comment
                        }
                      </div>
                    </div>

                    {/* REPLY */}
                    {review.reply ? (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-[#4b1d74] mb-2">
                          Your Reply
                        </p>

                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-gray-700">
                          {
                            review.reply
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <p className="text-sm font-semibold text-[#4b1d74] mb-2">
                          Reply
                        </p>

                        <textarea
                          rows={3}
                          placeholder="Write your reply..."
                          value={
                            replyInputs[
                              review.id
                            ] || ""
                          }
                          onChange={(
                            e
                          ) =>
                            setReplyInputs(
                              (
                                prev
                              ) => ({
                                ...prev,
                                [review.id]:
                                  e
                                    .target
                                    .value,
                              })
                            )
                          }
                          className="w-full border border-purple-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                        />

                        <button
                          onClick={() =>
                            handleReply(
                              review.id
                            )
                          }
                          disabled={
                            replying
                          }
                          className="mt-3 flex items-center gap-2 bg-[#6d35a3] hover:bg-[#572987] text-white px-4 py-2 rounded-xl text-sm transition"
                        >
                          <Send className="w-4 h-4" />

                          {replying
                            ? "Replying..."
                            : "Send Reply"}
                        </button>
                      </div>
                    )}
                  </div>
                )
              )
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                No reviews found
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex items-center justify-between mt-10 bg-white border border-purple-100 rounded-2xl p-4">
            <p className="text-sm text-gray-500">
              Page {page}
            </p>

            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() =>
                  setPage(
                    (prev) =>
                      prev - 1
                  )
                }
                className="px-4 py-2 border rounded-xl disabled:opacity-50 hover:bg-gray-100"
              >
                Previous
              </button>

              <button
                onClick={() =>
                  setPage(
                    (prev) =>
                      prev + 1
                  )
                }
                className="px-4 py-2 bg-[#6d35a3] text-white rounded-xl hover:bg-[#572987]"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}