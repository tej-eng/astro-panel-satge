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