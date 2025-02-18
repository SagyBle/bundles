import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  InlineStack,
  TextField,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "app/shopify.server";
import {
  // createProduct,
  deleteProduct,
  // updateProductVariants,
  updateProduct,
} from "app/services/product.service";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";

import ProductController from "app/controllers/product.controller";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    return ProductController.createProduct(request);
  }

  if (request.method === "DELETE") {
    return ProductController.deleteProduct(request);
  }

  if (request.method === "PUT") {
    try {
      const formData = await request.formData();
      const productId = formData.get("productId") as string;
      const newTitle = formData.get("newTitle") as string;
      if (!productId || !newTitle)
        throw new Error("Product ID and new title are required.");

      const updatedProduct = await updateProduct(request, {
        id: productId,
        title: newTitle,
      });

      return { success: true, updatedProduct };
    } catch (error: any) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: false, error: "Invalid method" };
};

export default function ProductsPage() {
  const [inputProductId, setInputProductId] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const fetcher = useFetcher<any>();
  const shopify = useAppBridge();

  useEffect(() => {
    if (fetcher.data?.product) {
      shopify.toast.show(
        `Product created with id: ${fetcher.data.product.id.replace("gid://shopify/Product/", "")}`,
      );
    }
    if (fetcher.data?.deletedProductId) {
      shopify.toast.show(
        `Product deleted with id: ${fetcher.data.deletedProductId}`,
      );
    }
  }, [fetcher.data, shopify]);

  const handleGenerateProduct = () => {
    fetcher.submit({}, { method: "POST", action: "/products" });
  };

  const handleDeleteProduct = () => {
    if (!inputProductId.trim()) return;
    const formData = new FormData();
    formData.append(
      "productId",
      formatGid(inputProductId, ShopifyResourceType.Product),
    );
    fetcher.submit(formData, { method: "DELETE", action: "/products" });
  };

  const handleUpdateProduct = () => {
    if (!inputProductId.trim() || !newTitle.trim()) return;
    const formData = new FormData();
    formData.append(
      "productId",
      formatGid(inputProductId, ShopifyResourceType.Product),
    );
    formData.append("newTitle", newTitle);
    fetcher.submit(formData, { method: "PUT", action: "/products" });
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Create, Edit and Delete Products
                </Text>
                <InlineStack gap="300">
                  <Button
                    loading={
                      fetcher.state === "loading" &&
                      fetcher.formMethod === "POST"
                    }
                    onClick={handleGenerateProduct}
                  >
                    Generate Product
                  </Button>
                  <TextField
                    label="Enter Product ID:"
                    value={inputProductId}
                    onChange={(value) => setInputProductId(value)}
                    autoComplete="off"
                    placeholder="e.g., 10066918539551"
                  />
                  <Button onClick={handleDeleteProduct}>Delete Product</Button>
                  <TextField
                    label="New Product Title:"
                    value={newTitle}
                    onChange={(value) => setNewTitle(value)}
                    autoComplete="off"
                    placeholder="Enter new title"
                  />
                  <Button onClick={handleUpdateProduct}>
                    Update Product Title
                  </Button>
                </InlineStack>
                {fetcher.data?.product && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                  >
                    <Text as="h3" variant="headingMd">
                      Product Data
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
