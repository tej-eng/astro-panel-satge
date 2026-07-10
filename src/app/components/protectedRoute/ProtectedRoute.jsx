"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { gql } from "@apollo/client";
import { useLazyQuery } from "@apollo/client/react";

const GET_CURRENT_ASTROLOGER = gql`
  query GetCurrentAstrologer {
    getCurrentAstrologer {
      name
      contactNo
    }
  }
`;

export default function ProtectedRoute({ children }) {
  const router = useRouter();

  const [getCurrentAstrologer, { loading, data, error }] =
    useLazyQuery(GET_CURRENT_ASTROLOGER, {
      fetchPolicy: "network-only",
    });

  useEffect(() => {
    getCurrentAstrologer();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (error || !data?.getCurrentAstrologer) {
        router.replace("/");
      }
    }
  }, [loading, error, data]);

  if (loading) return <>Loading...</>;

  if (error || !data?.getCurrentAstrologer) return null;

  return children;
}