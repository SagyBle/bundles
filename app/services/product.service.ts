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

export const updateProductVariant = async (
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
