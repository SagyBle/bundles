import ProductService from "app/services/product.service";

const createProduct = async (request: Request) => {
  try {
    console.log("sagy3");
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

const deleteProduct = async (request: Request) => {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    if (!productId) throw new Error("Product ID is required to delete.");

    const deletedProductId = await ProductService.deleteProduct(request, {
      id: productId,
    });

    return { success: true, deletedProductId };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }
};

const updateProduct = async (request: Request) => {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const newTitle = formData.get("newTitle") as string;

    if (!productId || !newTitle) {
      throw new Error("Product ID and new title are required.");
    }

    const updatedProduct = await ProductService.updateProduct(request, {
      id: productId,
      title: newTitle,
    });

    return { success: true, updatedProduct };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
};

const updateProductStatus = async (request: Request) => {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const status = formData.get("status") as string;

    // ✅ Type Guard: Ensure `status` is either "ACTIVE" or "DRAFT"
    if (!productId || !["ACTIVE", "DRAFT"].includes(status)) {
      throw new Error(
        "Product ID and valid status (ACTIVE or DRAFT) are required.",
      );
    }

    const updatedProduct = await ProductService.updateProduct(request, {
      id: productId,
      status: status as "ACTIVE" | "DRAFT",
    });

    return { success: true, updatedProduct };
  } catch (error: any) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }
};

export default {
  createProduct,
  deleteProduct,
  updateProduct,
  updateProductStatus,
};
