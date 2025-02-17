import { Page } from "@shopify/polaris";
import BundlesPage from "./bundles";
import ProductsPage from "./products";
import ApiTest from "app/components/ApiTest";

export default function Index() {
  return (
    <Page>
      <ProductsPage />
      <BundlesPage />
      <ApiTest />
    </Page>
  );
}
