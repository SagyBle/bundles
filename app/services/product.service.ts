import { authenticate } from "app/shopify.server";
import { ProductDataInput } from "app/types/product.types";

export const createProduct = async (
  request: Request,
  productData: ProductDataInput,
) => {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];

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
