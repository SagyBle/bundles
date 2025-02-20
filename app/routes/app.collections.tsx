import { Card, Layout, Page } from "@shopify/polaris";
import React from "react";

import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

import { apiVersion, authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async ({ request }) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const data = await response.json();

  return data;
};

const Collections = () => {
  const collections: any = useLoaderData();
  console.log(collections, "collections");
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <h1>Hello world</h1>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Collections;
