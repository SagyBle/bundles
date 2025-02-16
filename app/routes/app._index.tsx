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
import { authenticate } from "../shopify.server";
import {
  createProduct,
  deleteProduct,
  updateProductVariants,
} from "app/services/product.service";
import BundlesPage from "./bundles";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    try {
      const product = await createProduct(request, {
        title: `just created: ${new Date().toLocaleString()}`,
      });

      const variantId = product.variants.edges[0]?.node?.id;

      if (!variantId) {
        throw new Error("Failed to retrieve product variant ID.");
      }

      const updatedVariant = await updateProductVariants(request, product.id, [
        { id: variantId, price: "100.00" },
      ]);

      return { success: true, product, variant: updatedVariant };
    } catch (error: any) {
      console.error("Error creating product or updating variant:", error);
      return { success: false, error: error.message };
    }
  }

  if (request.method === "DELETE") {
    try {
      const formData = await request.formData();
      const productId = formData.get("productId") as string;

      if (!productId) {
        throw new Error("Product ID is required to delete.");
      }

      const deletedProductId = await deleteProduct(
        request,
        `gid://shopify/Product/${productId}`,
      );

      return {
        success: true,
        deletedProductId,
      };
    } catch (error: any) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  }
};

export default function Index() {
  const [inputProductId, setInputProductId] = useState("");
  const fetcher = useFetcher<typeof action>();

  const shopify = useAppBridge();
  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";
  const productId = fetcher.data?.product?.id.replace(
    "gid://shopify/Product/",
    "",
  );
  const deletedProductId = fetcher.data?.deletedProductId;

  useEffect(() => {
    if (productId) {
      shopify.toast.show(`Product created with id: ${productId}`);
    }
  }, [productId, shopify]);

  useEffect(() => {
    if (deletedProductId) {
      shopify.toast.show(`Product deleted with id: ${deletedProductId}`);
    }
  }, [deletedProductId, shopify]);

  const generateProduct = () => fetcher.submit({}, { method: "POST" });

  const deleteProductById = () => {
    if (!inputProductId.trim()) return;
    const formData = new FormData();
    formData.append("productId", inputProductId);
    fetcher.submit(formData, { method: "DELETE" });
  };

  const getProductById = (productId: string) => {
    fetcher.load(`/product/${productId}`);
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Create, Edit and Delete proudcts
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Make it out of two new generated products
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate product
                  </Button>
                  <InlineStack gap="300">
                    <TextField
                      label="Enter Product ID:"
                      value={inputProductId}
                      onChange={(value) => setInputProductId(value)}
                      autoComplete="off"
                      placeholder="e.g., 10066918539551"
                    />
                    <Button onClick={deleteProductById}>Delete Product</Button>
                  </InlineStack>

                  <Button
                    loading={fetcher.state === "loading"}
                    onClick={() => getProductById(inputProductId)}
                  >
                    Get Product
                  </Button>

                  {fetcher.data?.product && (
                    <pre>{JSON.stringify(fetcher.data.product, null, 2)}</pre>
                  )}
                  {fetcher.data?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {fetcher.data?.product && (
                  <>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productCreate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.product, null, 2)}
                        </code>
                      </pre>
                    </Box>
                    <Text as="h3" variant="headingMd">
                      {" "}
                      productVariantsBulkUpdate mutation
                    </Text>
                    <Box
                      padding="400"
                      background="bg-surface-active"
                      borderWidth="025"
                      borderRadius="200"
                      borderColor="border"
                      overflowX="scroll"
                    >
                      <pre style={{ margin: 0 }}>
                        <code>
                          {JSON.stringify(fetcher.data.variant, null, 2)}
                        </code>
                      </pre>
                    </Box>
                  </>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500"></BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
      <BundlesPage />
    </Page>
  );
}
