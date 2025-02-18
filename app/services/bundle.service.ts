import { CreateBundleInput } from "app/types/budnle.types";
import { authenticate } from "../shopify.server";
import { extractProductIds, flattenProductIds } from "app/utils/bundle.util";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";

export const createBundle = async (
  // TODO: fix this types issue!
  request: any,
  input: any,
) => {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(
      `#graphql
      mutation ProductBundleCreate($input: ProductBundleCreateInput!) {
        productBundleCreate(input: $input) {
            productBundleOperation {
                id
                status
        }
        userErrors {
            message
            field
        }
    }
    }
      `,
      { variables: input },
    );

    const responseJson = await response.json();
    const bundleOperationId =
      await responseJson.data?.productBundleCreate?.productBundleOperation?.id;
    let bundleProductId = await getProductIdFromBundleOperation(
      request,
      bundleOperationId,
    );
    // TODO: how to make sure that i get the bundleProductId
    // and if not, what is the best thing to do here?
    if (!bundleProductId) bundleProductId = "";

    const userErrors = responseJson.data?.bundleCreate?.userErrors;

    const productsIds = extractProductIds(input);
    console.log("sagy200", { productsIds });

    // Update bundle product metafield.
    const res = await updateBundleMetafield(
      request,
      bundleProductId + "a",
      productsIds,
    );

    if (userErrors?.length) {
      throw new Error(
        `Bundle creation failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
      );
    }

    return bundleProductId;
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw new Error("Failed to create bundle.");
  }
};

export const updateBundleMetafield = async (
  request: Request,
  productId: string,
  bundledProductIds: string[],
) => {
  const { admin } = await authenticate.admin(request);

  // const formattedProductId = `gid://shopify/Product/${productId}`;
  const formattedProductId = formatGid(productId, ShopifyResourceType.Product);
  const formattedBundledProducts = bundledProductIds
    .map((id) => formatGid(id, ShopifyResourceType.Product))
    .join(", ");

  const mutation = `#graphql
    mutation ProductUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          metafields(first: 10) {
            edges {
              node {
                namespace
                key
                value
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

  const variables = {
    input: {
      id: formattedProductId,
      metafields: [
        {
          namespace: "custom",
          key: "product_bundles",
          type: "single_line_text_field",
          value: formattedBundledProducts,
        },
      ],
    },
  };

  try {
    const response = await admin.graphql(mutation, { variables });
    const responseJson = await response.json();

    const userErrors = responseJson.data?.productUpdate?.userErrors;
    if (userErrors?.length) {
      throw new Error(
        `Metafield update failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
      );
    }

    return responseJson.data?.productUpdate?.product?.metafields.edges.map(
      (edge: any) => edge.node,
    );
  } catch (error) {
    console.error("Error updating bundle metafield:", error);
    throw new Error("Failed to update bundle metafield.");
  }
};

export const getProductIdFromBundleOperation = async (
  request: Request,
  bundleOperationId: string,
): Promise<string | null> => {
  const { admin } = await authenticate.admin(request);

  let attempts = 0;
  // TODO: think about it!! maybe it's not the right way to do it
  const maxAttempts = 10;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  while (attempts < maxAttempts) {
    const response = await admin.graphql(
      `#graphql
      query productBundleOperation($id: ID!) {
        productOperation(id: $id) {
          ... on ProductBundleOperation {
            id
            status
            product {
              id
            }
            userErrors {
              field
              message
              code
            }
          }
        }
      }`,
      { variables: { id: bundleOperationId } },
    );

    const responseJson = await response.json();
    console.log(
      "sagy100 Response JSON:",
      JSON.stringify(responseJson, null, 2),
    );

    const product = responseJson.data?.productOperation?.product;

    if (product) {
      return product.id;
    }

    attempts += 1;
    console.log(`Retrying... (${attempts}/${maxAttempts})`);
    await delay(2000);
  }

  console.error("❌ Product creation timed out.");
  return null;
};
