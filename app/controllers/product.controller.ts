import ProductService from "app/services/product.service";

const createProduct = async (request: Request) => {
  try {
    const product = await ProductService.createProduct(request, {
      title: `just created: ${new Date().toLocaleString()}`,
    });

    const variantId = product.variants.edges[0]?.node?.id;
    if (!variantId) throw new Error("Failed to retrieve product variant ID.");

    const updatedVariant = await ProductService.updateProductVariants(request, {
      productId: product.id,
      variants: [{ id: variantId, price: "100.00" }],
    });

    return { success: true, product, variant: updatedVariant };
  } catch (error: any) {
    console.error("Error creating product or updating variant:", error);
    return { success: false, error: error.message };
  }
};

export default { createProduct };
