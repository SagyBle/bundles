import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Button,
  Card,
  BlockStack,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { formatGid } from "app/utils/gid.util";
import { ShopifyResourceType } from "app/enums/gid.enums";
import { getProductOptions } from "app/services/product.service";
import { createBundle } from "app/services/bundle.service";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const formData = await request.formData();
    const firstProductId = formData.get("firstProductId") as string;
    const secondProductId = formData.get("secondProductId") as string;
    const title = formData.get("title") as string;
    if (!firstProductId || !secondProductId) {
      return { success: false, error: "Both product IDs are required" };
    }
    const firstProductGid = formatGid(
      firstProductId,
      ShopifyResourceType.Product,
    );
    const secondProductGid = formatGid(
      secondProductId,
      ShopifyResourceType.Product,
    );

    const firstProductOptions = await getProductOptions(
      request,
      firstProductGid,
    );
    const secondProductOptions = await getProductOptions(
      request,
      secondProductGid,
    );

    const bundleInput = {
      input: {
        title,
        components: [
          {
            quantity: 1,
            productId: firstProductGid,
            optionSelections: firstProductOptions.map((option: any) => ({
              componentOptionId: option.componentOptionId,
              name: option.name,
              values: option.values,
            })),
          },
          {
            quantity: 1,
            productId: secondProductGid,
            optionSelections: secondProductOptions.map((option: any) => ({
              componentOptionId: option.componentOptionId,
              name: option.name,
              values: option.values,
            })),
          },
        ],
      },
    };

    const bundleCreated = await createBundle(request, bundleInput);
    return {
      success: true,
      message: `Bundle created with ${firstProductId} & ${secondProductId}`,
    };
  }

  return { success: false, error: "Invalid request method" };
};

export default function BundlesPage() {
  const fetcher = useFetcher<typeof action>();

  const [firstProductId, setFirstProductId] = useState("");
  const [secondProductId, setSecondProductId] = useState("");

  const isLoading = fetcher.state === "loading";

  const createBundleHandler = () => {
    const formData = new FormData();
    formData.append("firstProductId", firstProductId);
    formData.append("secondProductId", secondProductId);
    formData.append("title", "bundle with metafields?");

    fetcher.submit(formData, {
      method: "POST",
      action: "/bundles",
    });
  };

  return (
    <Page>
      <BlockStack gap="500">
        <Card>
          <Text as="h2" variant="headingMd">
            Bundles Page
          </Text>

          <BlockStack gap="300">
            <TextField
              label="First Product ID"
              value={firstProductId}
              onChange={setFirstProductId}
              autoComplete="off"
              placeholder="Enter first product ID"
            />
            <TextField
              label="Second Product ID"
              value={secondProductId}
              onChange={setSecondProductId}
              autoComplete="off"
              placeholder="Enter second product ID"
            />
          </BlockStack>

          <Button
            loading={isLoading}
            onClick={createBundleHandler}
            disabled={!firstProductId.trim() || !secondProductId.trim()}
          >
            Create Bundle!
          </Button>
        </Card>
      </BlockStack>
    </Page>
  );
}
