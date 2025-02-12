import { ShopifyResourceType } from "app/enums/gid.enums";

export function formatGid(
  id: string | number,
  resourceType: ShopifyResourceType,
): string {
  const idStr = String(id);

  if (idStr.startsWith("gid://shopify/")) {
    const existingId = idStr.split("/").pop();
    return `gid://shopify/${resourceType}/${existingId}`;
  }

  return `gid://shopify/${resourceType}/${idStr}`;
}
