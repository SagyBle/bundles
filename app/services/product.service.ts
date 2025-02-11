import { authenticate } from "app/shopify.server";
import {
  ProductDataInput,
  ProductVariantUpdateInput,
} from "app/types/product.types";

export const createProduct = async (
  request: Request,
  productData: ProductDataInput,
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
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
      }`,
    {
      variables: {
        product: productData,
      },
    },
  );

  const responseJson = await response.json();
  const product = responseJson.data!.productCreate!.product!;

  if (!product) {
    throw new Error("Failed to create product");
  }

  return product;
};

export const updateProductVariants = async (
  request: Request,
  productId: string,
  variants: ProductVariantUpdateInput[],
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    mutation shopifyRemixTemplateUpdateVariant(
      $productId: ID!,
      $variants: [ProductVariantsBulkInput!]!
    ) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId,
        variants,
      },
    },
  );

  const responseJson = await response.json();
  const updatedVariants =
    responseJson.data?.productVariantsBulkUpdate?.productVariants;

  if (!updatedVariants) {
    throw new Error("Failed to update product variant");
  }

  return updatedVariants;
};

export const deleteProduct = async (request: Request, productId: string) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    mutation deleteProduct($id: ID!) {
      productDelete(input: { id: $id }) {
        deletedProductId
        userErrors {
          field
          message
        }
      }
    }`,
    { variables: { id: productId } },
  );

  const responseJson = await response.json();
  const deletedProductId = responseJson.data?.productDelete?.deletedProductId;
  const errors = responseJson.data?.productDelete?.userErrors;

  if (errors?.length) {
    throw new Error(
      `Failed to delete product: ${errors.map((e: any) => e.message).join(", ")}`,
    );
  }

  if (!deletedProductId) {
    throw new Error("Product deletion failed");
  }

  return deletedProductId;
};

export const getProductById = async (request: Request, productId: string) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query getProduct($id: ID!) {
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
    }`,
    { variables: { id: productId } },
  );

  const responseJson = await response.json();
  const product = responseJson.data?.product ?? null;
  if (!product) {
    throw new Error(`Product with id: ${productId} was not found`);
  }

  return product;
};
