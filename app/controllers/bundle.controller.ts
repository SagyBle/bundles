import { ShopifyResourceType } from "app/enums/gid.enums";

import BundleService from "app/services/bundle.service";
import { getProductOptions } from "app/services/product.service";
import { formatGid } from "app/utils/gid.util";
import { stringify } from "querystring";

const createBundle = async (request: Request) => {
  // const formData = await request.formData();
  // const firstProductId = formData.get("firstProductId") as string;
  // const secondProductId = formData.get("secondProductId") as string;
  // const title = formData.get("title") as string;

  const firstProductId = "10080749355295";
  const secondProductId = "10080731726111";
  const title = "public bundle";

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

  const firstProductOptions = await getProductOptions(request, {
    id: firstProductGid,
  });

  const secondProductOptions = await getProductOptions(request, {
    id: secondProductGid,
  });

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

  const bundleCreated = await BundleService.createBundle(request, bundleInput);

  return {
    success: true,
    message: `Bundle created with ${firstProductId} & ${secondProductId}`,
  };
};

export default { createBundle };
