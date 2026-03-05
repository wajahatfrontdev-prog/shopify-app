import { useState } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const price = formData.get("price");
  const category = formData.get("category");

  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            productType
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: title,
          productType: category,
          vendor: "Your Store",
        },
      },
    }
  );

  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  
  if (!product || !product.variants || !product.variants.edges || product.variants.edges.length === 0) {
    throw new Error("Product creation failed or no variants found");
  }
  
  const variantId = product.variants.edges[0].node.id;

  await admin.graphql(
    `#graphql
    mutation updateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: price }],
      },
    }
  );

  return { product };
};

export default function Products() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");

  const isLoading = fetcher.state === "submitting";

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    fetcher.submit(formData, { method: "POST" });
    setTitle("");
    setPrice("");
  };

  const quickAddProducts = () => {
    const products = [
      { title: "Men's Classic T-Shirt", category: "Men", price: "29.99" },
      { title: "Men's Denim Jeans", category: "Men", price: "59.99" },
      { title: "Men's Casual Shirt", category: "Men", price: "39.99" },
      { title: "Men's Sports Shoes", category: "Men", price: "79.99" },
      { title: "Women's Summer Dress", category: "Women", price: "49.99" },
      { title: "Women's Skinny Jeans", category: "Women", price: "54.99" },
      { title: "Women's Blouse", category: "Women", price: "34.99" },
      { title: "Women's Heels", category: "Women", price: "69.99" },
      { title: "Kids' Cotton T-Shirt", category: "Kids", price: "19.99" },
      { title: "Kids' Denim Shorts", category: "Kids", price: "24.99" },
      { title: "Kids' Hoodie", category: "Kids", price: "29.99" },
      { title: "Kids' Sneakers", category: "Kids", price: "39.99" },
    ];

    products.forEach((product, index) => {
      setTimeout(() => {
        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("price", product.price);
        formData.append("category", product.category);
        fetcher.submit(formData, { method: "POST" });
      }, index * 1000);
    });

    shopify.toast.show("Adding 12 products...");
  };

  return (
    <s-page heading="Product Management">
      <s-button slot="primary-action" onClick={quickAddProducts}>
        Add All 12 Products
      </s-button>

      <s-section heading="Add Single Product">
        <s-stack direction="block" gap="base">
          <s-text-field
            label="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Men's Classic T-Shirt"
          />

          <s-text-field
            label="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29.99"
            type="number"
          />

          <s-select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </s-select>

          <s-button
            onClick={handleSubmit}
            {...(isLoading ? { loading: true } : {})}
          >
            Add Product
          </s-button>
        </s-stack>
      </s-section>

      {fetcher.data?.product && (
        <s-section heading="Product Created Successfully">
          <s-stack direction="block" gap="base">
            <s-paragraph>
              <s-text weight="bold">{fetcher.data.product.title}</s-text> has
              been created!
            </s-paragraph>
            <s-button
              onClick={() => {
                shopify.intents.invoke?.("edit:shopify/Product", {
                  value: fetcher.data.product.id,
                });
              }}
              variant="primary"
            >
              Add Images & Edit
            </s-button>
          </s-stack>
        </s-section>
      )}

      <s-section slot="aside" heading="Quick Add Products">
        <s-paragraph>
          Click "Add All 12 Products" to automatically add:
        </s-paragraph>
        <s-unordered-list>
          <s-list-item>4 Men's products</s-list-item>
          <s-list-item>4 Women's products</s-list-item>
          <s-list-item>4 Kids' products</s-list-item>
        </s-unordered-list>
        <s-paragraph>
          After adding, you can edit each product to add images.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
