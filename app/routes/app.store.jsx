import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 50) {
          edges {
            node {
              id
              title
              description
              productType
              featuredImage {
                url
                altText
              }
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
        }
      }`
  );

  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map((edge) => edge.node);

  const menProducts = products.filter((p) => p.productType === "Men");
  const womenProducts = products.filter((p) => p.productType === "Women");
  const kidsProducts = products.filter((p) => p.productType === "Kids");

  return { menProducts, womenProducts, kidsProducts };
};

export default function Store() {
  const { menProducts, womenProducts, kidsProducts } = useLoaderData();
  const shopify = useAppBridge();

  const ProductCard = ({ product }) => {
    const productId = product.id.split("/").pop();
    const shopify = useAppBridge();
    
    const addToCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push({
        id: product.id,
        title: product.title,
        price: product.variants.edges[0].node.price,
        image: product.featuredImage?.url,
      });
      localStorage.setItem("cart", JSON.stringify(cart));
      shopify.toast.show("Added to cart!");
    };
    
    return (
      <s-card>
        {product.featuredImage && (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            style={{
              width: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "8px 8px 0 0",
            }}
          />
        )}
        <s-stack direction="block" gap="tight" style={{ padding: "16px" }}>
          <s-text weight="bold" size="large">
            {product.title}
          </s-text>
          <s-text size="large" style={{ color: "#2c6ecb" }}>
            ${product.variants.edges[0].node.price}
          </s-text>
          <s-button 
            variant="primary" 
            style={{ marginTop: "8px" }}
            onClick={addToCart}
          >
            Add to Cart
          </s-button>
        </s-stack>
      </s-card>
    );
  };

  return (
    <s-page heading="Shop">
      <s-section heading={`Men's Collection (${menProducts.length})`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "16px",
          }}
        >
          {menProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </s-section>

      <s-section heading={`Women's Collection (${womenProducts.length})`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "16px",
          }}
        >
          {womenProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </s-section>

      <s-section heading={`Kids' Collection (${kidsProducts.length})`}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "16px",
          }}
        >
          {kidsProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </s-section>
    </s-page>
  );
}
