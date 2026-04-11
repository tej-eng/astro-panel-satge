"use client";

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  makeVar,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

export const authTokenVar = makeVar(null);

const httpLink = createHttpLink({
  uri: "http://192.168.1.10:4000/graphql",
  credentials: "include", 
});

const authLink = setContext((_, { headers }) => {
  const token = authTokenVar();

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // ✅ auth FIRST
  cache: new InMemoryCache(),
});

export default client;