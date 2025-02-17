import { Page } from "@shopify/polaris";
import BundlesPage from "./bundles";
import ProductsPage from "./products";

export default function Index() {
  return (
    <Page>
      {/* <BlockStack gap="500">
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
      </BlockStack> */}
      <ProductsPage />
      <BundlesPage />
    </Page>
  );
}
