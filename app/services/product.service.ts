import {
  GRAPHQL_CREATE_PRODUCT,
  GRAPHQL_DELETE_PRODUCT,
  GRAPHQL_GET_PRODUCT_BY_ID,
  GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID,
  GRAPHQL_GET_PRODUCT_METAFIELDS,
  GRAPHQL_GET_PRODUCT_OPTIONS,
  GRAPHQL_POPULATE_PRODUCT,
  GRAPHQL_UPDATE_PRODUCT,
  GRAPHQL_UPDATE_PRODUCT_VARIANTS,
} from "app/graphql/product.queries";
import { authenticate } from "app/shopify.server";
import { ProductVariantUpdateInput } from "app/types/product.types";
import { AdminShopifyService } from "./api/adminShopify.api.service";
import { checkRequestType } from "app/utils/auth.util";
import { SessionShopifyService } from "./api/sessionShopify.api.service";

const createProduct = async (request: Request, input: any) => {
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
  try {
    // ✅ Step 1: Check request type
    const { isAdmin, isSession } = await checkRequestType(request);

    let data: any = null;

    if (isAdmin) {
      // ✅ Step 2: Execute Admin API request
      data = await AdminShopifyService.executeGraphQL(
        request,
        GRAPHQL_UPDATE_PRODUCT,
        { input },
      );
    } else if (isSession) {
      // ✅ Step 3: Execute Session API request
      data = await SessionShopifyService.executeGraphQL(
        request,
        GRAPHQL_UPDATE_PRODUCT,
        { input },
      );
    } else {
      throw new Error("Unauthorized: No valid admin or session.");
    }

    // ✅ Step 4: Return updated product data
    return data?.productUpdate?.product || null;
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
};

const updateProductVariants = async (
  request: Request,
  input: { productId: string; variants: ProductVariantUpdateInput[] },
) => {
  try {
    // ✅ Step 1: Check request type
    const { isAdmin, isSession } = await checkRequestType(request);

    let data: any = null;

    if (isAdmin) {
      // ✅ Step 2: Execute Admin API request
      data = await AdminShopifyService.executeGraphQL(
        request,
        GRAPHQL_UPDATE_PRODUCT_VARIANTS,
        {
          productId: input.productId,
          variants: input.variants,
        },
      );
    } else if (isSession) {
      // ✅ Step 3: Execute Session API request
      data = await SessionShopifyService.executeGraphQL(
        request,
        GRAPHQL_UPDATE_PRODUCT_VARIANTS,
        {
          productId: input.productId,
          variants: input.variants,
        },
      );
    } else {
      throw new Error("Unauthorized: No valid admin or session.");
    }

    // ✅ Step 4: Return updated product variants
    return data?.productVariantsBulkUpdate?.productVariants || null;
  } catch (error) {
    console.error("❌ Error updating product variants:", error);
    return null;
  }
};

const deleteProduct = async (request: Request, input: { id: string }) => {
  try {
    // Check request type (admin or session)
    const { isAdmin } = await checkRequestType(request);

    if (!isAdmin) {
      throw new Error("Unauthorized: Only admin users can delete products.");
    }

    // Execute the GraphQL mutation via Admin API
    const data: any = await AdminShopifyService.executeGraphQL(
      request,
      GRAPHQL_DELETE_PRODUCT,
      { id: input.id },
    );

    // Check for GraphQL user errors
    const errors = data?.productDelete?.userErrors;
    if (errors?.length) {
      throw new Error(
        `Failed to delete product: ${errors.map((e: any) => e.message).join(", ")}`,
      );
    }

    return data?.productDelete?.deletedProductId || null;
  } catch (error) {
    console.error("Error deleting product:", error);
    return null;
  }
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
  console.log("sagy19");

  const { admin } = await authenticate.admin(request);

  console.log("sagy200", input);

  const response = await admin.graphql(GRAPHQL_GET_PRODUCT_METAFIELDS, {
    variables: { input: input.productId },
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
  try {
    // ✅ Step 1: Determine if the request is from Admin or Session
    const { isAdmin, isSession } = await checkRequestType(request);

    if (!isAdmin && !isSession) {
      throw new Error("Unauthorized: No valid admin or session.");
    }

    // ✅ Step 2: Choose API Service Based on Request Type
    const apiService = isAdmin ? AdminShopifyService : SessionShopifyService;

    // ✅ Step 3: Execute GraphQL Query
    const data: any = await apiService.executeGraphQL(
      request,
      GRAPHQL_GET_PRODUCT_OPTIONS,
      { id: input.id },
    );

    // ✅ Step 4: Handle API Errors
    if (!data?.product?.options) {
      console.error("❌ GraphQL Error - No product options returned:", data);
      return [];
    }

    // ✅ Step 5: Return Product Options
    return data.product.options.map((option: any) => ({
      componentOptionId: option.id,
      name: option.name,
      values: option.values,
    }));
  } catch (error) {
    console.error("❌ Error fetching product options:", error);
    return [];
  }
};

export const getProductDefaultVariantId = async (
  request: Request,
  apiService: typeof AdminShopifyService | typeof SessionShopifyService,
  input: { productId: string },
) => {
  try {
    // Execute GraphQL query using the provided API service
    const data: any = await apiService.executeGraphQL(
      request,
      GRAPHQL_GET_PRODUCT_DEFAULT_VARIANT_ID,
      { productId: input.productId },
    );
    console.log("sagy29", data);

    // Extract and return the default variant ID
    return data?.product?.variants?.edges?.[0]?.node?.id || null;
  } catch (error) {
    console.error("❌ Error fetching default variant ID:", error);
    return null;
  }
};

export const populateProduct = async (
  request: Request,
  input: { id: string },
) => {
  try {
    const { isAdmin, isSession } = await checkRequestType(request);

    if (!isAdmin && !isSession) {
      throw new Error("Unauthorized: No valid admin or session.");
    }

    // ✅ Step 2: Determine API service based on request type
    const apiService = isAdmin ? AdminShopifyService : SessionShopifyService;

    // ✅ Step 3: Execute the GraphQL query
    const data: any = await apiService.executeGraphQL(
      request,
      GRAPHQL_POPULATE_PRODUCT,
      { id: input.id },
    );

    // ✅ Step 4: Handle errors or return the product data
    if (!data?.product) {
      console.error("❌ GraphQL Error - No product returned:", data);
      return null;
    }

    return data.product;
  } catch (error) {
    console.error(
      "❌ Error fetching product details including metafields:",
      error,
    );
    return null;
  }
};

export default {
  createProduct,
  updateProductVariants,
  deleteProduct,
  updateProduct,
  getProductMetafields,
  populateProduct,
};
