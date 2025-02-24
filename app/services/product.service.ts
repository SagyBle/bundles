import {
  GRAPHQL_CREATE_PRODUCT,
  GRAPHQL_DELETE_PRODUCT,
  GRAPHQL_GET_PRODUCT_BY_ID,
  GRAPHQL_GET_PRODUCT_METAFIELDS,
  GRAPHQL_GET_PRODUCT_OPTIONS,
  GRAPHQL_UPDATE_PRODUCT,
  GRAPHQL_UPDATE_PRODUCT_VARIANTS,
} from "app/graphql/product.queries";
import { authenticate } from "app/shopify.server";
import { ProductVariantUpdateInput } from "app/types/product.types";
import { AdminShopifyService } from "./api/adminShopify.api.service";
import { checkRequestType } from "app/utils/auth.util";
import { SessionShopifyService } from "./api/sessionShopify.api.service";

const createProduct = async (request: Request, input: { title: string }) => {
  console.log("sagy700");

  try {
    const { isAdmin, isSession } = await checkRequestType(request);

    if (isAdmin) {
      const data: any = await AdminShopifyService.executeGraphQL(
        request,
        GRAPHQL_CREATE_PRODUCT,
        { input },
      );

      if (data?.productCreate?.product) {
        return data.productCreate.product;
      }
    } else if (isSession) {
      const sessionData: any = await SessionShopifyService.executeGraphQL(
        request,
        GRAPHQL_CREATE_PRODUCT,
        { input },
      );

      return sessionData?.productCreate?.product || null;
    }
    return null;
  } catch (error) {
    console.error("Error creating product:", error);
    return null;
  }
};

const updateProduct = async (
  request: Request,
  input: { id: string; title?: string; status?: "ACTIVE" | "DRAFT" },
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_UPDATE_PRODUCT, {
    variables: { input },
  });
  const responseJson = await response.json();

  return responseJson.data?.productUpdate?.product || null;
};

const updateProductVariants = async (
  request: Request,
  input: { productId: string; variants: ProductVariantUpdateInput[] },
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_UPDATE_PRODUCT_VARIANTS, {
    variables: { productId: input.productId, variants: input.variants },
  });

  const responseJson = await response.json();
  return responseJson.data?.productVariantsBulkUpdate?.productVariants || null;
};

const deleteProduct = async (request: Request, input: { id: string }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_DELETE_PRODUCT, {
    variables: { id: input.id },
  });

  const responseJson = await response.json();

  const errors = responseJson.data?.productDelete?.userErrors;
  if (errors?.length) {
    throw new Error(
      `Failed to delete product: ${errors.map((e: any) => e.message).join(", ")}`,
    );
  }

  return responseJson.data?.productDelete?.deletedProductId || null;
};

export const getProductById = async (
  request: Request,
  input: { id: string }, // ✅ Standardized input
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_BY_ID, {
    variables: { id: input.id },
  });

  const responseJson = await response.json();
  return responseJson.data?.product || null;
};

export const getProductMetafields = async (
  request: Request,
  input: { productId: string },
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_METAFIELDS, {
    variables: { input },
  });

  const responseJson = await response.json();
  return (
    responseJson.data?.product?.metafields?.edges.map(
      (edge: any) => edge.node,
    ) || []
  );
};

export const getProductOptions = async (
  request: Request,
  input: { id: string },
) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_OPTIONS, {
    variables: { id: input.id },
  });

  const responseJson = await response.json();

  return (
    responseJson.data?.product?.options?.map((option: any) => ({
      componentOptionId: option.id,
      name: option.name,
      values: option.values,
    })) || []
  );
};

export default {
  createProduct,
  updateProductVariants,
  deleteProduct,
  updateProduct,
};
