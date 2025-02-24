import { ActionFunctionArgs } from "@remix-run/node";
import {
  GRAPHQL_PRODUCT_BUNDLE_CREATE,
  GRAPHQL_PRODUCT_BUNDLE_OPERATION,
} from "app/graphql/bundle.queries";
import { GRAPHQL_GET_PRODUCT_OPTIONS } from "app/graphql/product.queries";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const url = new URL(request.url);
  const actionType = url.searchParams.get("action");
  const { session } = await authenticate.public.appProxy(request);

  const firstProductGid = "gid://shopify/Product/10080172409119";
  const secondProductGid = "gid://shopify/Product/10080171163935";

  if (!session) {
    throw new Error("Authorization error!");
  }

  if (request.method === "POST") {
    console.log("------------- authorized POST request arrived -------------");

    const response1 = await fetch(
      `https://${session.shop}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken || "",
        },
        body: JSON.stringify({
          query: GRAPHQL_GET_PRODUCT_OPTIONS,
          variables: { id: "gid://shopify/Product/10080172409119" },
        }),
      },
    );

    const responseJson1 = await response1.json();

    const firstProductOptions = responseJson1.data.product.options;

    const response2 = await fetch(
      `https://${session.shop}/admin/api/2023-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken || "",
        },
        body: JSON.stringify({
          query: GRAPHQL_GET_PRODUCT_OPTIONS,
          variables: { id: "gid://shopify/Product/10080172409119" },
        }),
      },
    );

    console.log("sagy1", session.shop, "sagy2", session.accessToken);

    const responseJson2 = await response2.json();

    const secondProductOptions = responseJson2.data.product.options;

    console.log(
      `********s*** ${JSON.stringify(firstProductOptions)} ***********`,
      `********s*** ${JSON.stringify(secondProductOptions)} ***********`,
    );

    // const bundleInput = {
    //   input: {
    //     title: "bundle from the store front",
    //     components: [
    //       {
    //         quantity: 1,
    //         productId: firstProductGid,
    //         optionSelections: firstProductOptions.map((option: any) => ({
    //           componentOptionId: option.componentOptionId,
    //           name: option.name,
    //           values: option.values,
    //         })),
    //       },
    //       {
    //         quantity: 1,
    //         productId: secondProductGid,
    //         optionSelections: secondProductOptions.map((option: any) => ({
    //           componentOptionId: option.componentOptionId,
    //           name: option.name,
    //           values: option.values,
    //         })),
    //       },
    //     ],
    //   },
    // };

    const response3 = await fetch(
      `https://${session.shop}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken || "",
        },
        body: JSON.stringify({
          query: `mutation ProductBundleCreate($input: ProductBundleCreateInput!) {
  productBundleCreate(input: $input) {
    productBundleOperation {
      id
      status
      product{
        id
        title
      }
      
    }
    userErrors {
      message
      field
    }
  }
}`,
          variables: {
            input: {
              title: "sagy bundle 11",
              components: [
                {
                  quantity: 1,
                  productId: "gid://shopify/Product/10080172409119",
                  optionSelections: [
                    {
                      componentOptionId:
                        "gid://shopify/ProductOption/12518256345375",
                      name: "Title",
                      values: ["Default Title"],
                    },
                  ],
                },
                {
                  quantity: 1,
                  productId: "gid://shopify/Product/10080171163935",

                  optionSelections: [
                    {
                      componentOptionId:
                        "gid://shopify/ProductOption/12518255034655",
                      name: "Title",
                      values: ["Default Title"],
                    },
                  ],
                },
              ],
            },
          },
        }),
      },
    );

    console.log("------------- POST request ended -------------");
    console.log("response3:", JSON.stringify(response3));
    console.log("response3:", response3);
    const responseText = await response3.text();
    console.log("Raw Response Text:", responseText);
    let responseJson3: any;
    try {
      const responseJson3 = JSON.parse(responseText);
      console.log(
        "Parsed Response JSON:",
        JSON.stringify(responseJson3, null, 2),
      );

      if (responseJson3.errors) {
        console.error(
          "GraphQL Errors:",
          JSON.stringify(responseJson3.errors, null, 2),
        );
      }

      if (responseJson3.data?.productBundleCreate?.userErrors.length) {
        console.error(
          "User Errors:",
          JSON.stringify(
            responseJson3.data.productBundleCreate.userErrors,
            null,
            2,
          ),
        );
      }
    } catch (error) {
      console.error("Error parsing response JSON:", error);
    }

    const productBundleOperation =
      responseJson3.productBundleCreate.productBundleOperation.id;

    const response4 = await fetch(
      `https://${session.shop}/admin/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken || "",
        },
        body: JSON.stringify({
          query: GRAPHQL_PRODUCT_BUNDLE_OPERATION,
          variables: { id: productBundleOperation },
        }),
      },
    );

    console.log({ response4 });

    return {
      success: true,
      responseJson1,
      responseJson2,
      response3,
      response4,
    };
  }
  return { success: false };
};
