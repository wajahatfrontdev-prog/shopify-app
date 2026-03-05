

const products = [
  // Men's Products
  { title: "Men's Classic T-Shirt", category: "Men", price: "29.99" },
  { title: "Men's Denim Jeans", category: "Men", price: "59.99" },
  { title: "Men's Casual Shirt", category: "Men", price: "39.99" },
  { title: "Men's Sports Shoes", category: "Men", price: "79.99" },
  
  // Women's Products
  { title: "Women's Summer Dress", category: "Women", price: "49.99" },
  { title: "Women's Skinny Jeans", category: "Women", price: "54.99" },
  { title: "Women's Blouse", category: "Women", price: "34.99" },
  { title: "Women's Heels", category: "Women", price: "69.99" },
  
  // Kids' Products
  { title: "Kids' Cotton T-Shirt", category: "Kids", price: "19.99" },
  { title: "Kids' Denim Shorts", category: "Kids", price: "24.99" },
  { title: "Kids' Hoodie", category: "Kids", price: "29.99" },
  { title: "Kids' Sneakers", category: "Kids", price: "39.99" },
];

async function addProducts() {
  console.log("Adding products to Shopify...\n");
  
  const SHOP_DOMAIN = process.env.SHOP_DOMAIN || "wajahatecom.myshopify.com";
  const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || "";
  
  for (const product of products) {
    try {
      const response = await fetch(`https://${SHOP_DOMAIN}/admin/api/2023-10/products.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify({
          product: {
            title: product.title,
            product_type: product.category,
            vendor: "Your Store",
            variants: [{
              price: product.price,
              inventory_quantity: 100,
            }],
          },
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Added: ${product.title}`);
      } else {
        const error = await response.text();
        console.log(`✗ Failed: ${product.title} - ${response.status}: ${error}`);
      }
    } catch (error) {
      console.log(`✗ Failed: ${product.title} - ${error.message}`);
    }
  }
  
  console.log("\nDone! Check your Shopify admin.");
}

addProducts();
