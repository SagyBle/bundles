import { Page } from "@shopify/polaris";
import BundlesPage from "./bundles";
import ProductsPage from "./products";
import ApiTest from "app/components/ApiTest";
import RingPage from "./ring";

export default function Index() {
  return (
    <Page>
      <ProductsPage />
      <BundlesPage />
      <RingPage />
      {/* <ApiTest /> */}
    </Page>
  );
}
