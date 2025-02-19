import { authenticate } from "../shopify.server";
import { extractProductIds, flattenProductIds } from "app/utils/bundle.util";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";
import { BundleInput } from "app/types/budnle.types";
import {
  GRAPHQL_PRODUCT_BUNDLE_CREATE,
  GRAPHQL_PRODUCT_BUNDLE_OPERATION,
  GRAPHQL_PRODUCT_UPDATE_METAFIELDS,
} from "app/graphql/bundle.queries";
import { retryWithDelay } from "app/utils/general.util";
import productService from "./product.service";

const createBundle = async (
  // TODO: fix this types issue!
  request: any,
  input: BundleInput,
) => {
  const { admin } = await authenticate.admin(request);

  try {
    const response = await admin.graphql(GRAPHQL_PRODUCT_BUNDLE_CREATE, {
      variables: input,
    });

    const responseJson = await response.json();
    const bundleOperationId =
      await responseJson.data?.productBundleCreate?.productBundleOperation?.id;
    let bundleProductId = await getProductIdFromBundleOperation(
      request,
      bundleOperationId,
    );

    if (!bundleProductId) bundleProductId = "";

    const userErrors = responseJson.data?.bundleCreate?.userErrors;

    const productsIds = extractProductIds(input);

    // Update bundle product metafield.
    const res = await updateBundleMetafieldProductsIds(
      request,
      bundleProductId,
      productsIds,
    );

    if (userErrors?.length) {
      throw new Error(
        `Bundle creation failed: ${userErrors.map((e: any) => e.message).join(", ")}`,
      );
    }

    const updatedBundleStatus = await productService.updateProduct(request, {
      id: bundleProductId,
      status: "ACTIVE",
    });

    return bundleProductId;
  } catch (error) {
    console.error("Error creating bundle:", error);
    throw new Error("Failed to create bundle.");
  }
};

const updateBundleMetafieldProductsIds = async (
  request: Request,
  productId: string,
  bundledProductIds: string[],
) => {
  const { admin } = await authenticate.admin(request);

  const formattedProductId = formatGid(productId, ShopifyResourceType.Product);
  const formattedBundledProducts = bundledProductIds
    .map((id) => formatGid(id, ShopifyResourceType.Product))
    .join(", ");

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
    const response = await admin.graphql(GRAPHQL_PRODUCT_UPDATE_METAFIELDS, {
      variables,
    });
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

const getProductIdFromBundleOperation = async (
  request: Request,
  bundleOperationId: string,
): Promise<string | null> => {
  const { admin } = await authenticate.admin(request);

  return retryWithDelay(async () => {
    const response = await admin.graphql(GRAPHQL_PRODUCT_BUNDLE_OPERATION, {
      variables: { id: bundleOperationId },
    });

    const responseJson = await response.json();
    return responseJson.data?.productOperation?.product?.id || null;
  });
};

export default {
  createBundle,
  updateBundleMetafieldProductsIds,
  getProductIdFromBundleOperation,
};
