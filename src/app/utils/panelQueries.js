import { gql } from "@apollo/client";

export const GET_OFFERS = gql`
  query GetOffers {
    getOffers {
      success
      message
      data {
        id
        offerName
        price
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const UPDATE_OFFER_STATUS = gql`
  mutation UpdateOfferStatus(
    $offerId: String!
    $isActive: Boolean!
  ) {
    updateOfferStatus(
      offerId: $offerId
      isActive: $isActive
    ) {
      success
      message
    }
  }
`;

export const GET_REMEDIES = gql`
  query GetRemedies {
    getRemedies {
      success
      message
      data {
        id
        title
        description
        isActive
        createdAt
        updatedAt
      }
    }
  }
`;

export const SEND_REMEDY = gql`
  mutation SendRemedy(
    $sessionId: String!
    $remedyText: String!
  ) {
    sendRemedy(
      sessionId: $sessionId
      remedyText: $remedyText
    ) {
      success
      message
    }
  }
`;

export const GET_SESSION_REMEDIES = gql`
  query GetSessionRemedies($filter: SessionRemedyFilterInput) {
    getSessionRemedies(filter: $filter) {
      success
      message
      totalCount
      currentPage
      totalPages
      data {
        id
        sessionId
        sessionType
        remedyText
        createdAt
      }
    }
  }
`;