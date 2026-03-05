"""
Flask Backend for Diversified Shipping App
Deploy to Hugging Face Spaces
"""
from flask import Flask, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder='public')

# Port for Hugging Face (default 7860)
PORT = int(os.environ.get('PORT', 7860))

# Mock products data (from standalone-server.js)
mock_products = [
    {
        'id': '1',
        'title': 'Premium Cotton T-Shirt',
        'productType': 'Clothing',
        'price': '29.99',
        'featuredImage': {'url': '/men.webp'}
    },
    {
        'id': '2', 
        'title': 'Designer Handbag',
        'productType': 'Accessories',
        'price': '89.99',
        'featuredImage': {'url': '/beauty.jpg'}
    },
    {
        'id': '3',
        'title': 'Kids Sneakers',
        'productType': 'Footwear', 
        'price': '45.99',
        'featuredImage': {'url': '/Kid.jpg'}
    },
    {
        'id': '4',
        'title': 'Casual Jeans',
        'productType': 'Clothing',
        'price': '59.99',
        'featuredImage': {'url': '/men.webp'}
    }
]

# HTML Template
html_template = """
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
                        <div style="fontpx; font-weight-size: 14: 600;">Women's</div>
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
        // Load products from API
        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                const productsGrid = document.getElementById('products-grid');
                products.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${product.featuredImage.url}" alt="${product.title}" class="product-image">
                        <div class="product-info">
                            <div class="product-title">${product.title}</div>
                            <div class="product-type">${product.productType}</div>
                            <div class="product-price">$${product.price}</div>
                        </div>
                    `;
                    productsGrid.appendChild(productCard);
                });
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
"""

# Shop Page Template
shop_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop - Diversified Store</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 400px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .products-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px; }
        .product-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛍️ Shop</h1>
            <p>Browse all products</p>
        </div>
        <div class="products-grid" id="products"></div>
        <div class="bottom-nav">
            <div class="nav-item"><div class="nav-icon">🏠</div><div class="nav-text"><a href="/">Home</a></div></div>
            <div class="nav-item active"><div class="nav-icon">🛍️</div><div class="nav-text">Shop</div></div>
            <div class="nav-item"><div class="nav-icon">🛒</div><div class="nav-text"><a href="/cart" style="color:#7f8c8d;text-decoration:none;">Cart</a></div></div>
            <div class="nav-item"><div class="nav-icon">👤</div><div class="nav-text"><a href="/profile" style="color:#7f8c8d;text-decoration:none;">Profile</a></div></div>
        </div>
    </div>
    <script>
        fetch('/api/products').then(r=>r.json()).then(products=>{
            document.getElementById('products').innerHTML = products.map(p =>
                `<div class="product-card"><img src="${p.featuredImage.url}" class="product-image"><div class="product-info"><div class="product-title">${p.title}</div><div class="product-type">${p.productType}</div><div class="product-price">${p.price}</div></div></div>`
            ).join('');
        });
    </script>
</body>
</html>
"""

# Cart Page Template
cart_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cart - Diversified Store</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 400px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .cart-items { padding: 20px; }
        .cart-item { display: flex; gap: 12px; padding: 12px; background: #f8f9fa; border-radius: 12px; margin-bottom: 12px; }
        .cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
        .cart-item-info { flex: 1; }
        .cart-item-title { font-weight: 600; font-size: 14px; }
        .cart-item-price { color: #e74c3c; font-weight: 700; }
        .empty-cart { text-align: center; padding: 40px; color: #7f8c8d; }
        .checkout-btn { display: block; width: calc(100% - 40px); margin: 20px; padding: 16px; background: #667eea; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; }
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 400px; background: white; border-top: 1px solid rgba(0,0,0,0.1); padding: 12px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; z-index: 100; }
        .nav-item { text-align: center; }
        .nav-icon { font-size: 20px; margin-bottom: 4px; }
        .nav-text { font-size: 10px; color: #7f8c8d; font-weight: 600; }
        .nav-item.active .nav-text { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛒 Cart</h1>
            <p>Your shopping cart</p>
        </div>
        <div class="cart-items">
            <div class="empty-cart">
                <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
                <p>Your cart is empty</p>
                <a href="/shop" style="color: #667eea; margin-top: 16px; display: block;">Continue Shopping</a>
            </div>
        </div>
        <button class="checkout-btn">Proceed to Checkout</button>
        <div class="bottom-nav">
            <div class="nav-item"><div class="nav-icon">🏠</div><div class="nav-text"><a href="/" style="color:#7f8c8d;text-decoration:none;">Home</a></div></div>
            <div class="nav-item"><div class="nav-icon">🛍️</div><div class="nav-text"><a href="/shop" style="color:#7f8c8d;text-decoration:none;">Shop</a></div></div>
            <div class="nav-item active"><div class="nav-icon">🛒</div><div class="nav-text">Cart</div></div>
            <div class="nav-item"><div class="nav-icon">👤</div><div class="nav-text"><a href="/profile" style="color:#7f8c8d;text-decoration:none;">Profile</a></div></div>
        </div>
    </div>
</body>
</html>
"""

# Profile Page Template
profile_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - Diversified Store</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; }
        .container { max-width: 400px; margin: 0 auto; background: white; min-height: 100vh; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .avatar { width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; }
        .profile-name { font-size: 20px; font-weight: 700; }
        .profile-email { font-size: 14px; opacity: 0.9; }
        .menu { padding: 20px; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 16px; background: #f8f9fa; border-radius: 12px; margin-bottom: 12px; cursor: pointer; }
        .menu-icon { font-size: 20px; }
        .menu-text { flex: 1; font-weight: 500; }
        .bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 400px; background: white; border-top: 1px solid rgba(0,0,0,0.1); padding: 12px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; z-index: 100; }
        .nav-item { text-align: center; }
        .nav-icon { font-size: 20px; margin-bottom: 4px; }
        .nav-text { font-size: 10px; color: #7f8c8d; font-weight: 600; }
        .nav-item.active .nav-text { color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="avatar">👤</div>
            <div class="profile-name">Guest User</div>
            <div class="profile-email">guest@example.com</div>
        </div>
        <div class="menu">
            <div class="menu-item"><span class="menu-icon">📦</span><span class="menu-text">My Orders</span></div>
            <div class="menu-item"><span class="menu-icon">📍</span><span class="menu-text">Shipping Addresses</span></div>
            <div class="menu-item"><span class="menu-icon">💳</span><span class="menu-text">Payment Methods</span></div>
            <div class="menu-item"><span class="menu-icon">⚙️</span><span class="menu-text">Settings</span></div>
            <div class="menu-item"><span class="menu-icon">❓</span><span class="menu-text">Help & Support</span></div>
        </div>
        <div class="bottom-nav">
            <div class="nav-item"><div class="nav-icon">🏠</div><div class="nav-text"><a href="/" style="color:#7f8c8d;text-decoration:none;">Home</a></div></div>
            <div class="nav-item"><div class="nav-icon">🛍️</div><div class="nav-text"><a href="/shop" style="color:#7f8c8d;text-decoration:none;">Shop</a></div></div>
            <div class="nav-item"><div class="nav-icon">🛒</div><div class="nav-text"><a href="/cart" style="color:#7f8c8d;text-decoration:none;">Cart</a></div></div>
            <div class="nav-item active"><div class="nav-icon">👤</div><div class="nav-text">Profile</div></div>
        </div>
    </div>
</body>
</html>
"""

# Routes
@app.route('/')
def home():
    """Serve main page"""
    return html_template

@app.route('/shop')
def shop():
    """Shop page"""
    return shop_template

@app.route('/cart')
def cart():
    """Cart page"""
    return cart_template

@app.route('/profile')
def profile():
    """Profile page"""
    return profile_template

@app.route('/api/products')
def get_products():
    """API endpoint to get products"""
    return jsonify(mock_products)

@app.route('/public/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('public', filename)

# Serve images from public folder
@app.route('/men.webp')
def serve_men():
    return send_from_directory('public', 'men.webp')

@app.route('/beauty.jpg')
def serve_beauty():
    return send_from_directory('public', 'beauty.jpg')

@app.route('/Kid.jpg')
def serve_kid():
    return send_from_directory('public', 'Kid.jpg')

@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory('public', 'favicon.ico')

# Health check endpoint
@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'app': 'diversified-shipping-app'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=False)
