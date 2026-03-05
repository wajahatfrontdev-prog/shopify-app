const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mock products data
const mockProducts = [
  {
    id: '1',
    title: 'Premium Cotton T-Shirt',
    productType: 'Clothing',
    price: '29.99',
    featuredImage: { url: '/men.webp' }
  },
  {
    id: '2', 
    title: 'Designer Handbag',
    productType: 'Accessories',
    price: '89.99',
    featuredImage: { url: '/beauty.jpg' }
  },
  {
    id: '3',
    title: 'Kids Sneakers',
    productType: 'Footwear', 
    price: '45.99',
    featuredImage: { url: '/Kid.jpg' }
  },
  {
    id: '4',
    title: 'Casual Jeans',
    productType: 'Clothing',
    price: '59.99',
    featuredImage: { url: '/men.webp' }
  }
];

// HTML template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diversified Shipping App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 400px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .search-bar { margin: 20px; padding: 12px; border: 1px solid #ddd; border-radius: 25px; width: calc(100% - 40px); }
        .categories { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px; }
        .category-card { position: relative; border-radius: 16px; overflow: hidden; height: 120px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer; }
        .category-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
        .category-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; text-align: center; }
        .products { margin: 20px; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); cursor: pointer; }
        .product-image { width: 100%; height: 140px; object-fit: cover; }
        .product-info { padding: 12px; }
        .product-title { font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 4px; }
        .product-type { font-size: 12px; color: #7f8c8d; margin-bottom: 8px; }
        .product-price { font-size: 16px; font-weight: 700; color: #e74c3c; }
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 400px; background: white; border-top: 1px solid rgba(0,0,0,0.1); padding: 12px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; z-index: 100; }
        .nav-item { text-align: center; cursor: pointer; }
        .nav-icon { font-size: 20px; margin-bottom: 4px; }
        .nav-text { font-size: 10px; color: #7f8c8d; font-weight: 600; }
        .nav-item.active .nav-text { color: #667eea; }
        .features { margin: 32px 20px 100px; padding: 24px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; text-align: center; }
        .feature-icon { font-size: 24px; margin-bottom: 8px; }
        .feature-title { font-size: 12px; font-weight: 600; color: #2c3e50; }
        .feature-desc { font-size: 10px; color: #7f8c8d; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Diversified Store</h1>
            <p style="font-size: 14px; opacity: 0.9;">Your one-stop shopping destination</p>
        </div>

        <!-- Search Bar -->
        <input type="text" class="search-bar" placeholder="🔍 Search products...">

        <!-- Categories -->
        <div class="categories">
            <div class="category-card">
                <div class="category-bg" style="background-image: url('/men.webp');"></div>
                <div class="category-overlay">
                    <div>
                        <div style="font-size: 24px; margin-bottom: 4px;">👔</div>
                        <div style="font-size: 14px; font-weight: 600;">Men's</div>
                    </div>
                </div>
            </div>
            <div class="category-card">
                <div class="category-bg" style="background-image: url('/beauty.jpg');"></div>
                <div class="category-overlay">
                    <div>
                        <div style="font-size: 24px; margin-bottom: 4px;">👗</div>
                        <div style="font-size: 14px; font-weight: 600;">Women's</div>
                    </div>
                </div>
            </div>
            <div class="category-card">
                <div class="category-bg" style="background-image: url('/Kid.jpg');"></div>
                <div class="category-overlay">
                    <div>
                        <div style="font-size: 24px; margin-bottom: 4px;">👶</div>
                        <div style="font-size: 14px; font-weight: 600;">Kids</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Featured Products -->
        <div class="products">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="font-size: 20px; font-weight: 700; color: #2c3e50;">Featured Products</h3>
                <span style="color: #667eea; font-size: 14px; font-weight: 600; cursor: pointer;">View All</span>
            </div>
            <div class="products-grid" id="products-grid">
                <!-- Products will be loaded here -->
            </div>
        </div>

        <!-- Features -->
        <div class="features">
            <div class="features-grid">
                <div>
                    <div class="feature-icon">🚚</div>
                    <div class="feature-title">Free Shipping</div>
                    <div class="feature-desc">On orders $50+</div>
                </div>
                <div>
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">Easy Returns</div>
                    <div class="feature-desc">30-day policy</div>
                </div>
                <div>
                    <div class="feature-icon">🛡️</div>
                    <div class="feature-title">Secure Pay</div>
                    <div class="feature-desc">100% secure</div>
                </div>
                <div>
                    <div class="feature-icon">📞</div>
                    <div class="feature-title">24/7 Support</div>
                    <div class="feature-desc">Always here</div>
                </div>
            </div>
        </div>

        <!-- Bottom Navigation -->
        <div class="bottom-nav">
            <div class="nav-item active">
                <div class="nav-icon">🏠</div>
                <div class="nav-text">Home</div>
            </div>
            <div class="nav-item">
                <div class="nav-icon">🛍️</div>
                <div class="nav-text">Shop</div>
            </div>
            <div class="nav-item">
                <div class="nav-icon">🛒</div>
                <div class="nav-text">Cart</div>
            </div>
            <div class="nav-item">
                <div class="nav-icon">👤</div>
                <div class="nav-text">Profile</div>
            </div>
        </div>
    </div>

    <script>
        // Load products
        const products = ${JSON.stringify(mockProducts)};
        const productsGrid = document.getElementById('products-grid');
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = \`
                <img src="\${product.featuredImage.url}" alt="\${product.title}" class="product-image">
                <div class="product-info">
                    <div class="product-title">\${product.title}</div>
                    <div class="product-type">\${product.productType}</div>
                    <div class="product-price">$\${product.price}</div>
                </div>
            \`;
            productsGrid.appendChild(productCard);
        });

        // Add click handlers
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req, res) => {
    res.send(htmlTemplate);
});

app.get('/api/products', (req, res) => {
    res.json(mockProducts);
});

app.listen(PORT, () => {
    console.log(`🚀 Standalone server running at http://localhost:${PORT}`);
    console.log(`📱 Mobile-optimized UI ready!`);
});