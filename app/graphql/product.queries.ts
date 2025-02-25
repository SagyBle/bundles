export const GRAPHQL_CREATE_PRODUCT = `#graphql
  mutation CreateProduct($input: ProductCreateInput!) {
    productCreate(product: $input) {
      product {
        id
        title
        handle
        status
        variants(first: 10) {
          edges {
            node {
              id
              price
              barcode
              createdAt
            }
          }
        }
      }
    }
  }
`;

export const GRAPHQL_UPDATE_PRODUCT = `#graphql
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        media(first: 10) {
          nodes {
            alt
            mediaContentType
            preview {
              status
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_DELETE_PRODUCT = `#graphql
  mutation DeleteProduct($id: ID!) {
    productDelete(input: { id: $id }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

export const GRAPHQL_UPDATE_PRODUCT_VARIANTS = `#graphql
  mutation UpdateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      productVariants {
        id
        price
        barcode
        createdAt
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_OPTIONS = `#graphql
  query GetProductOptions($id: ID!) {
    product(id: $id) { 
      options {
        id
        name
        values
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_BY_ID = `#graphql
  query GetProduct($id: ID!) {
    product(id: $id) { 
      id
      title
      description
      options {
        name
        values
      }
      variants(first: 10) {
        edges {
          node {
            id
            price
            barcode
            createdAt
          }
        }
      }
    }
  }
`;

export const GRAPHQL_GET_PRODUCT_METAFIELDS = `#graphql
    query GetProductMetafields($input: ID!) {
      product(id: $input) {
        metafields(first: 10) {
          edges {
            node {
              id
              namespace
              key
              value
              type
              description
            }
          }
        }
      }
    }`;

export const GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID = `#graphql
  query GetProductDefaultVariantId($productId: ID!) {
    product(id: $productId) {
      id
      title
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;
