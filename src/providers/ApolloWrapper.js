"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useEffect } from "react";
import client, { authTokenVar } from "../../utils/apolloClient";

export default function ApolloWrapper({ children }) {

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      authTokenVar(token);
      console.log("Hydrated token:", token); 
    }
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}