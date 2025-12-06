import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import API_BASE_URL from "../apiConfig";
import { API_END_POINT } from "@/constant";
import baseQueryWithErrorHandling from "./baseQuery"; 
export const offerPriceApi = createApi({
  reducerPath: "offerPriceApi",
  baseQuery: baseQueryWithErrorHandling,
  endpoints: (builder) => ({
    updateOfferPrice: builder.mutation({
      query: ({ astroid, status }) => ({
        url: "expert-offerprice",
        method: "POST",
        body: {
          astroid,
          status: status.toString(),
        },
      }),
    }),
  }),
});

export const { useUpdateOfferPriceMutation } = offerPriceApi;
