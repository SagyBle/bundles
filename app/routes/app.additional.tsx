import { Box, Card, Layout, Page, Text, BlockStack } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import DiamondViewer from "app/components/DiamondViewer";

export default function AdditionalPage() {
  return (
    <Page>
      <TitleBar title="3D Viewer Playground" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p">Trying to render smartly 3D images</Text>
              <DiamondViewer />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
