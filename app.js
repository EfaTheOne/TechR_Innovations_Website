/* 
   TechR Innovations - Protocol: STRUCTURE
   Engine: Professional, Debuggable, Secure
*/

// --- CONFIGURATION ---
// Credentials provided by User
const SUPABASE_URL = 'https://vmgiylwrpknufdddwcbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xLh_U2MxD-UatsepDCDAUg_9pix1V4f';
const SQUARE_APP_ID = 'sandbox-sq0idb-baAQrwCn8BjaayFVRoDUJA';
const SQUARE_LOC_ID = 'LHWBP0QGBDD1G';

// Initialize Clients
let supabase;
let supabaseChannel = null;

const logger = {
    log: (msg) => {
        console.log(`[TechR] ${msg}`);
        const logEl = document.getElementById('debug-log');
        if (logEl) {
            logEl.innerHTML += `> ${msg}\n`;
            logEl.scrollTop = logEl.scrollHeight;
        }
    },
    error: (msg) => {
        console.error(`[TechR] ERROR: ${msg}`);
        const logEl = document.getElementById('debug-log');
        if (logEl) {
            logEl.innerHTML += `> [ERROR] ${msg}\n`;
            logEl.scrollTop = logEl.scrollHeight;
        }
    }
};

try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase Online");
    }
} catch (e) {
    console.warn("Supabase Init Failed");
}

// --- STORE & STATE ---
const Store = {
    products: [],
    cart: [],

    init: async () => {
        const savedCart = localStorage.getItem('techr_cart_v2');
        if (savedCart) Store.cart = JSON.parse(savedCart);
        await Store.fetchProducts();
        Router.handleRoute();
    },

    fetchProducts: async () => {
        try {
            if (supabase) {
                const { data, error } = await supabase.from('products').select('*');
                if (!error && data && data.length > 0) {
                    Store.products = data;
                    return;
                }
            }
        } catch (e) { /* Ignore fallback */ }

        // Fallback Inventory
        Store.products = [
            { id: 1, name: "Techack1 Unit", price: 299.99, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", category: "techack", desc: "Portable pentesting framework." },
            { id: 2, name: "TechBox Starter", price: 49.99, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", category: "techbox", desc: "Complete STEM electronics kit." },
            { id: 3, name: "Rithim Biosensor", price: 149.99, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80", category: "rithim", desc: "Recovery monitoring wearable." }
        ];
    },

    addToCart: (id) => {
        const product = Store.products.find(p => p.id === id);
        if (product) {
            Store.cart.push(product);
            Store.persist();
            // Button feedback
            const btns = document.querySelectorAll(`button[data-id="${id}"]`);
            btns.forEach(b => {
                const old = b.innerHTML;
                b.innerHTML = "Added";
                b.classList.add('btn-primary');
                b.classList.remove('btn-secondary');
                setTimeout(() => {
                    b.innerHTML = old;
                    b.classList.remove('btn-primary');
                    b.classList.add('btn-secondary');
                }, 1000);
            });
            Auth.updateCartCount();
        }
    },

    removeFromCart: (index) => {
        Store.cart.splice(index, 1);
        Store.persist();
        Router.handleRoute();
    },

    clearCart: () => {
        Store.cart = [];
        Store.persist();
    },

    persist: () => {
        localStorage.setItem('techr_cart_v2', JSON.stringify(Store.cart));
    }
};

const Auth = {
    user: null,
    isAdmin: false,

    updateCartCount: () => {
        const btn = document.getElementById('cart-count');
        if (btn) btn.textContent = Store.cart.length;
    },

    // Check current session on load
    checkSession: async () => {
        if (!supabase) return false;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (session && !error) {
                Auth.user = session.user;
                Auth.isAdmin = true;
                return true;
            }
        } catch (e) {
            console.warn('Session check failed:', e);
        }
        return false;
    },

    // Login with email and password
    login: async (email, password) => {
        if (!supabase) {
            return { success: false, error: 'Database connection unavailable' };
        }
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                return { success: false, error: error.message };
            }
            Auth.user = data.user;
            Auth.isAdmin = true;
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Sign up new admin
    signup: async (email, password) => {
        if (!supabase) {
            return { success: false, error: 'Database connection unavailable' };
        }
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true, message: 'Check your email for verification link!' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Logout
    logout: async () => {
        if (!supabase) return;
        try {
            await supabase.auth.signOut();
            Auth.user = null;
            Auth.isAdmin = false;
            window.location.hash = '#/';
        } catch (e) {
            console.warn('Logout failed:', e);
        }
    }
};

// --- PRODUCT MANAGER (CRUD Operations) ---
const ProductManager = {
    // Create new product
    create: async (product) => {
        if (!supabase) {
            return { success: false, error: 'Database connection unavailable' };
        }
        try {
            const { data, error } = await supabase
                .from('products')
                .insert([{
                    name: product.name,
                    price: parseFloat(product.price),
                    image: product.image,
                    category: product.category,
                    desc: product.desc,
                    features: product.features || [],
                    specifications: product.specifications || {},
                    stock: product.stock || 0,
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) return { success: false, error: error.message };
            await Store.fetchProducts();
            return { success: true, data: data[0] };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Update existing product
    update: async (id, updates) => {
        if (!supabase) {
            return { success: false, error: 'Database connection unavailable' };
        }
        try {
            const { data, error } = await supabase
                .from('products')
                .update({
                    name: updates.name,
                    price: parseFloat(updates.price),
                    image: updates.image,
                    category: updates.category,
                    desc: updates.desc,
                    features: updates.features || [],
                    specifications: updates.specifications || {},
                    stock: updates.stock || 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();
            
            if (error) return { success: false, error: error.message };
            await Store.fetchProducts();
            return { success: true, data: data[0] };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Delete product
    delete: async (id) => {
        if (!supabase) {
            return { success: false, error: 'Database connection unavailable' };
        }
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);
            
            if (error) return { success: false, error: error.message };
            await Store.fetchProducts();
            return { success: true };
        } catch (e) {
            return { success: false, error: e.message };
        }
    },

    // Get single product
    getById: (id) => {
        return Store.products.find(p => p.id === parseInt(id));
    },

    // Subscribe to real-time updates
    subscribeToChanges: () => {
        if (!supabase) return;
        
        // Unsubscribe from existing channel if any
        if (supabaseChannel) {
            supabase.removeChannel(supabaseChannel);
        }

        supabaseChannel = supabase
            .channel('products-channel')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'products' },
                async (payload) => {
                    console.log('[TechR] Real-time update:', payload.eventType);
                    await Store.fetchProducts();
                    // Refresh current route if on products or admin page
                    const hash = window.location.hash.slice(1);
                    if (hash.includes('product') || hash.includes('admin') || hash === 'techack') {
                        Router.handleRoute();
                    }
                }
            )
            .subscribe();
    }
};

// --- COMPONENT FACTORY ---
const Components = {
    Header: () => `
        <nav class="nav-bar">
            <div class="container nav-container">
                <a href="#/" class="brand">
                    <i data-lucide="cpu"></i> TechR
                </a>
                <div class="nav-links">
                    <a href="#techack">Products</a>
                    ${Auth.isAdmin ? `
                        <a href="#admin-dashboard">Dashboard</a>
                        <a href="#/" onclick="Auth.logout()">Logout</a>
                    ` : `
                        <a href="#admin">Staff Portal</a>
                    `}
                    <a href="#checkout" class="btn btn-primary btn-sm">
                        Cart (<span id="cart-count">${Store.cart.length}</span>)
                    </a>
                </div>
            </div>
        </nav>
    `,

    ProductCard: (p) => `
        <div class="product-card reveal">
            <a href="#product/${p.id}" class="product-link">
                <img src="${p.image}" class="product-img" alt="${p.name}">
            </a>
            <div class="product-content">
                <a href="#product/${p.id}"><h3>${p.name}</h3></a>
                <p class="product-desc">${p.desc}</p>
                <span class="product-category">${p.category || 'General'}</span>
                <div class="product-meta">
                    <span class="price">$${parseFloat(p.price).toFixed(2)}</span>
                    <button class="btn btn-secondary" onclick="Store.addToCart(${p.id})" data-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `,

    AdminProductCard: (p) => `
        <div class="admin-product-card">
            <img src="${p.image}" class="admin-product-img" alt="${p.name}">
            <div class="admin-product-info">
                <h4>${p.name}</h4>
                <p>$${parseFloat(p.price).toFixed(2)} | ${p.category || 'General'}</p>
                <p class="stock-info">${p.stock !== undefined ? `Stock: ${p.stock}` : 'Stock: N/A'}</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-small btn-secondary" onclick="AdminUI.editProduct(${p.id})">
                    <i data-lucide="edit-2"></i> Edit
                </button>
                <button class="btn btn-small btn-danger" onclick="AdminUI.deleteProduct(${p.id})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
        </div>
    `,

    ProductForm: (product = null) => {
        const isEdit = !!product;
        return `
            <div class="product-form-container">
                <h3>${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
                <form id="product-form" class="product-form">
                    <input type="hidden" id="product-id" value="${product?.id || ''}">
                    
                    <div class="form-group">
                        <label for="product-name">Product Name *</label>
                        <input type="text" id="product-name" value="${product?.name || ''}" required placeholder="Enter product name">
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="product-price">Price ($) *</label>
                            <input type="number" id="product-price" step="0.01" min="0" value="${product?.price || ''}" required placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label for="product-stock">Stock Quantity</label>
                            <input type="number" id="product-stock" min="0" value="${product?.stock || 0}" placeholder="0">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="product-category">Category *</label>
                        <select id="product-category" required>
                            <option value="">Select Category</option>
                            <option value="techack" ${product?.category === 'techack' ? 'selected' : ''}>Techack (Security)</option>
                            <option value="techbox" ${product?.category === 'techbox' ? 'selected' : ''}>TechBox (Education)</option>
                            <option value="rithim" ${product?.category === 'rithim' ? 'selected' : ''}>Rithim (Recovery)</option>
                            <option value="studytech" ${product?.category === 'studytech' ? 'selected' : ''}>StudyTech (AI)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="product-image">Image URL *</label>
                        <input type="url" id="product-image" value="${product?.image || ''}" required placeholder="https://example.com/image.jpg">
                        <div class="image-preview" id="image-preview">
                            ${product?.image ? `<img src="${product.image}" alt="Preview">` : '<p>Image preview will appear here</p>'}
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="product-desc">Description *</label>
                        <textarea id="product-desc" rows="3" required placeholder="Enter product description">${product?.desc || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="product-features">Features (one per line)</label>
                        <textarea id="product-features" rows="4" placeholder="Feature 1&#10;Feature 2&#10;Feature 3">${(product?.features || []).join('\n')}</textarea>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="AdminUI.cancelForm()">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Update Product' : 'Add Product'}</button>
                    </div>
                </form>
            </div>
        `;
    }
};

// --- ROUTER ---
const Router = {
    routes: {
        '/': () => `
            <div class="fullscreen-section container">
                <h1 class="reveal">Precision Engineering<br>for the Modern Era.</h1>
                <p class="reveal" style="font-size: 1.5rem; margin-top: 1rem;">
                    TechR Innovations delivers enterprise-grade hardware solutions for security, education, and physiological monitoring.
                </p>
                <div class="reveal" style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <a href="#techack" class="btn btn-primary">View Products</a>
                    <a href="#checkout" class="btn btn-secondary">Order Now</a>
                </div>
            </div>
            
            <div class="container" style="padding-bottom: 6rem;">
                <div class="grid-3">
                    <div class="card reveal">
                        <div class="card-icon"><i data-lucide="shield"></i></div>
                        <h3>Techack Security</h3>
                        <p>Advanced penetration testing hardware designed for red team operations.</p>
                    </div>
                    <div class="card reveal">
                        <div class="card-icon"><i data-lucide="box"></i></div>
                        <h3>TechBox EDU</h3>
                        <p>Comprehensive STEM learning kits powering the next generation of engineers.</p>
                    </div>
                    <div class="card reveal">
                        <div class="card-icon"><i data-lucide="activity"></i></div>
                        <h3>Rithim Bio</h3>
                        <p>Clinical-grade biosensors for real-time recovery tracking.</p>
                    </div>
                </div>
            </div>
        `,
        'techack': () => `
            <div class="container" style="padding-top: 8rem; padding-bottom: 4rem;">
                <h2 class="reveal">Product Catalog</h2>
                <div class="product-grid reveal" style="margin-top: 2rem;">
                    ${Store.products.map(p => Components.ProductCard(p)).join('')}
                </div>
            </div>
        `,
        'checkout': async () => {
            const isSecure = window.location.protocol === 'https:';
            let alertHtml = '';

            if (!isSecure) {
                alertHtml = `
                    <div class="alert-box alert-error">
                        <i data-lucide="alert-triangle"></i>
                        <div>
                            <strong>Secure Environment Required</strong><br>
                            Payments are disabled on Localhost. Deploy to GitHub Pages (HTTPS) to enable Square.
                        </div>
                    </div>
                `;
            }

            return `
                <div class="container" style="padding-top: 8rem;">
                    <div class="checkout-container">
                        <h2>Secure Checkout</h2>
                        ${alertHtml}
                        
                        ${Store.cart.length === 0 ? '<div class="card">Your cart is empty.</div>' : `
                            <div class="card" style="margin-bottom: 2rem;">
                                ${Store.cart.map(item => `
                                    <div style="display:flex; justify-content:space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle);">
                                        <span>${item.name}</span>
                                        <span class="price">$${item.price}</span>
                                    </div>
                                `).join('')}
                                <div style="margin-top: 1rem; text-align: right; font-weight: 700; font-size: 1.25rem;">
                                    Total: $${Store.cart.reduce((a, b) => a + parseFloat(b.price), 0).toFixed(2)}
                                </div>
                            </div>

                            <div class="card">
                                <h3>Payment Details</h3>
                                <div id="card-container" style="background: white; padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; min-height: 50px;"></div>
                                <button id="pay-btn" class="btn btn-primary" style="width: 100%;">Pay Now</button>
                            </div>
                            
                            <div style="margin-top: 2rem;">
                                <h4>Debug Console</h4>
                                <pre id="debug-log" class="debug-log">Waiting for intialization...</pre>
                            </div>
                        `}
                    </div>
                </div>
            `;
        },

        // Admin Login Page
        'admin': () => `
            <div class="container admin-login-container">
                <div class="admin-login-card glass-panel">
                    <div class="admin-login-header">
                        <i data-lucide="shield-check"></i>
                        <h2>Staff Portal</h2>
                        <p>Access the TechR Admin Dashboard</p>
                    </div>
                    
                    <div id="auth-message" class="auth-message"></div>
                    
                    <form id="login-form" class="login-form">
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" required placeholder="admin@techr.io" autocomplete="email">
                        </div>
                        
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" required placeholder="••••••••" autocomplete="current-password">
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full" id="login-btn">
                            <i data-lucide="log-in"></i> Sign In
                        </button>
                    </form>
                    
                    <div class="auth-divider">
                        <span>or</span>
                    </div>
                    
                    <button class="btn btn-secondary btn-full" id="signup-toggle">
                        <i data-lucide="user-plus"></i> Create Account
                    </button>
                    
                    <div id="signup-section" class="signup-section hidden">
                        <form id="signup-form" class="login-form">
                            <div class="form-group">
                                <label for="signup-email">Email Address</label>
                                <input type="email" id="signup-email" required placeholder="your@email.com">
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-password">Password</label>
                                <input type="password" id="signup-password" required minlength="6" placeholder="Min. 6 characters">
                            </div>
                            
                            <div class="form-group">
                                <label for="signup-confirm">Confirm Password</label>
                                <input type="password" id="signup-confirm" required placeholder="Confirm password">
                            </div>
                            
                            <button type="submit" class="btn btn-primary btn-full">
                                <i data-lucide="check"></i> Create Account
                            </button>
                        </form>
                    </div>
                    
                    <div class="admin-login-footer">
                        <p><i data-lucide="lock"></i> Secured by Supabase Auth</p>
                    </div>
                </div>
            </div>
        `,

        // Admin Dashboard
        'admin-dashboard': async () => {
            // Check authentication
            if (!Auth.isAdmin) {
                const hasSession = await Auth.checkSession();
                if (!hasSession) {
                    window.location.hash = '#admin';
                    return '<p>Redirecting to login...</p>';
                }
            }

            return `
                <div class="container admin-dashboard">
                    <div class="admin-header">
                        <div class="admin-header-left">
                            <h2><i data-lucide="layout-dashboard"></i> Admin Dashboard</h2>
                            <p>Welcome, ${Auth.user?.email || 'Admin'}</p>
                        </div>
                        <div class="admin-header-right">
                            <span class="sync-indicator" id="sync-indicator">
                                <i data-lucide="radio-tower"></i> Real-time sync active
                            </span>
                            <button class="btn btn-secondary" onclick="Auth.logout()">
                                <i data-lucide="log-out"></i> Logout
                            </button>
                        </div>
                    </div>

                    <div class="admin-stats">
                        <div class="stat-card">
                            <i data-lucide="package"></i>
                            <div class="stat-info">
                                <span class="stat-value">${Store.products.length}</span>
                                <span class="stat-label">Products</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-value">${Store.products.filter(p => p.category === 'techack').length}</span>
                                <span class="stat-label">Techack Items</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-value">${Store.products.filter(p => p.category === 'techbox').length}</span>
                                <span class="stat-label">TechBox Items</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <span class="stat-value">${Store.products.filter(p => p.category === 'rithim').length}</span>
                                <span class="stat-label">Rithim Items</span>
                            </div>
                        </div>
                    </div>

                    <div class="admin-toolbar">
                        <h3><i data-lucide="boxes"></i> Product Management</h3>
                        <div class="toolbar-actions">
                            <input type="text" id="product-search" placeholder="Search products..." class="search-input" oninput="AdminUI.filterProducts(this.value)">
                            <select id="category-filter" onchange="AdminUI.filterByCategory(this.value)" class="category-filter">
                                <option value="">All Categories</option>
                                <option value="techack">Techack</option>
                                <option value="techbox">TechBox</option>
                                <option value="rithim">Rithim</option>
                                <option value="studytech">StudyTech</option>
                            </select>
                            <button class="btn btn-primary" onclick="AdminUI.showAddForm()">
                                <i data-lucide="plus"></i> Add Product
                            </button>
                        </div>
                    </div>

                    <div id="product-form-area"></div>

                    <div class="admin-products-list" id="admin-products-list">
                        ${Store.products.length === 0 ? 
                            '<p class="empty-state"><i data-lucide="inbox"></i> No products yet. Add your first product!</p>' :
                            Store.products.map(p => Components.AdminProductCard(p)).join('')
                        }
                    </div>
                </div>
            `;
        }
    }, // End Routes

    init: () => {
        window.addEventListener('hashchange', Router.handleRoute);
        Router.handleRoute();
    },

    handleRoute: async () => {
        const app = document.getElementById('app');
        const hash = window.location.hash.slice(1) || '/';
        
        // Handle dynamic routes (like product/123)
        let route = Router.routes[hash];
        let content = '';
        
        // Check for product detail route
        if (hash.startsWith('product/')) {
            const productId = hash.split('/')[1];
            content = Router.getProductPage(productId);
        } else if (route) {
            content = await route();
        } else {
            content = await Router.routes['/']();
        }

        app.innerHTML = Components.Header();
        app.innerHTML += content;

        if (window.lucide) lucide.createIcons();
        Router.observeReveal();

        // Initialize specific page handlers
        if (hash === 'checkout' && Store.cart.length > 0) {
            Router.initCheckout();
        }
        if (hash === 'admin') {
            Router.initLoginForm();
        }
        if (hash === 'admin-dashboard') {
            ProductManager.subscribeToChanges();
        }
    },

    // Product Detail Page
    getProductPage: (productId) => {
        const product = ProductManager.getById(productId);
        
        if (!product) {
            return `
                <div class="container" style="padding-top: 8rem; text-align: center;">
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist.</p>
                    <a href="#techack" class="btn btn-primary">Browse Products</a>
                </div>
            `;
        }

        const features = product.features || [];
        const specs = product.specifications || {};
        
        return `
            <div class="container product-detail-container">
                <a href="#techack" class="back-link">
                    <i data-lucide="arrow-left"></i> Back to Products
                </a>
                
                <div class="product-detail">
                    <div class="product-detail-gallery">
                        <img src="${product.image}" alt="${product.name}" class="product-main-image">
                    </div>
                    
                    <div class="product-detail-info">
                        <span class="product-category-badge category-${product.category}">${product.category || 'General'}</span>
                        <h1>${product.name}</h1>
                        <p class="product-detail-desc">${product.desc}</p>
                        
                        <div class="product-price-section">
                            <span class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</span>
                            ${product.stock !== undefined ? `<span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}</span>` : ''}
                        </div>
                        
                        <div class="product-actions">
                            <button class="btn btn-primary btn-large" onclick="Store.addToCart(${product.id})" data-id="${product.id}" ${product.stock === 0 ? 'disabled' : ''}>
                                <i data-lucide="shopping-cart"></i> Add to Cart
                            </button>
                            <a href="#checkout" class="btn btn-secondary btn-large">
                                <i data-lucide="credit-card"></i> Buy Now
                            </a>
                        </div>
                        
                        ${features.length > 0 ? `
                            <div class="product-features">
                                <h3><i data-lucide="check-circle"></i> Features</h3>
                                <ul>
                                    ${features.map(f => `<li>${f}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${Object.keys(specs).length > 0 ? `
                            <div class="product-specs">
                                <h3><i data-lucide="settings"></i> Specifications</h3>
                                <table class="specs-table">
                                    ${Object.entries(specs).map(([key, value]) => `
                                        <tr>
                                            <td>${key}</td>
                                            <td>${value}</td>
                                        </tr>
                                    `).join('')}
                                </table>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    // Initialize Login Form handlers
    initLoginForm: () => {
        setTimeout(() => {
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            const signupToggle = document.getElementById('signup-toggle');
            
            // Toggle signup section
            if (signupToggle) {
                signupToggle.addEventListener('click', () => {
                    AdminUI.toggleSignup();
                });
            }
            
            if (loginForm) {
                loginForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('email').value;
                    const password = document.getElementById('password').value;
                    const btn = document.getElementById('login-btn');
                    const msgEl = document.getElementById('auth-message');
                    
                    btn.disabled = true;
                    btn.innerHTML = '<i data-lucide="loader"></i> Signing in...';
                    
                    const result = await Auth.login(email, password);
                    
                    if (result.success) {
                        msgEl.className = 'auth-message success';
                        msgEl.innerHTML = '<i data-lucide="check-circle"></i> Login successful! Redirecting...';
                        setTimeout(() => {
                            window.location.hash = '#admin-dashboard';
                        }, 1000);
                    } else {
                        msgEl.className = 'auth-message error';
                        msgEl.innerHTML = `<i data-lucide="alert-circle"></i> ${result.error}`;
                        btn.disabled = false;
                        btn.innerHTML = '<i data-lucide="log-in"></i> Sign In';
                    }
                    if (window.lucide) lucide.createIcons();
                });
            }
            
            if (signupForm) {
                signupForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('signup-email').value;
                    const password = document.getElementById('signup-password').value;
                    const confirm = document.getElementById('signup-confirm').value;
                    const msgEl = document.getElementById('auth-message');
                    
                    if (password !== confirm) {
                        msgEl.className = 'auth-message error';
                        msgEl.innerHTML = '<i data-lucide="alert-circle"></i> Passwords do not match';
                        if (window.lucide) lucide.createIcons();
                        return;
                    }
                    
                    const result = await Auth.signup(email, password);
                    
                    if (result.success) {
                        msgEl.className = 'auth-message success';
                        msgEl.innerHTML = '<i data-lucide="check-circle"></i> ' + (result.message || 'Account created! Check your email.');
                    } else {
                        msgEl.className = 'auth-message error';
                        msgEl.innerHTML = `<i data-lucide="alert-circle"></i> ${result.error}`;
                    }
                    if (window.lucide) lucide.createIcons();
                });
            }
        }, 100);
    },

    observeReveal: () => {
        setTimeout(() => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        }, 100);
    },

    initCheckout: async () => {
        if (!window.Square) {
            logger.error("Square SDK script not loaded in index.html");
            return;
        }

        if (window.location.protocol !== 'https:') {
            logger.error("Protocol violation: HTTPS required.");
            document.getElementById('card-container').innerHTML = "<em>Payments Disabled (Insecure Origin)</em>";
            document.getElementById('pay-btn').disabled = true;
            return;
        }

        try {
            logger.log("Initializing Square...");
            const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOC_ID);
            const card = await payments.card();
            await card.attach('#card-container');
            logger.log("Card Element attached successfully.");

            document.getElementById('pay-btn').addEventListener('click', async () => {
                logger.log("Tokenizing card...");
                const result = await card.tokenize();
                if (result.status === 'OK') {
                    logger.log(`Success! Token: ${result.token}`);
                    alert("Payment Successful (Sandbox)!");
                    Store.clearCart();
                } else {
                    logger.error(result.errors[0].message);
                    alert("Payment Failed: " + result.errors[0].message);
                }
            });
        } catch (e) {
            logger.error(`Square Exception: ${e.message}`);
        }
    }
};

// --- ADMIN UI HELPERS ---
const AdminUI = {
    filteredProducts: [],
    
    toggleSignup: () => {
        const section = document.getElementById('signup-section');
        const btn = document.getElementById('signup-toggle');
        if (section) {
            section.classList.toggle('hidden');
            if (!section.classList.contains('hidden')) {
                btn.innerHTML = '<i data-lucide="x"></i> Cancel';
            } else {
                btn.innerHTML = '<i data-lucide="user-plus"></i> Create Account';
            }
            if (window.lucide) lucide.createIcons();
        }
    },

    showAddForm: () => {
        const formArea = document.getElementById('product-form-area');
        if (formArea) {
            formArea.innerHTML = Components.ProductForm();
            formArea.scrollIntoView({ behavior: 'smooth' });
            AdminUI.initFormHandlers();
            if (window.lucide) lucide.createIcons();
            
            // Image preview handler
            document.getElementById('product-image').addEventListener('input', (e) => {
                const preview = document.getElementById('image-preview');
                if (e.target.value) {
                    preview.innerHTML = `<img src="${e.target.value}" alt="Preview" onerror="this.src='https://via.placeholder.com/200'">`;
                } else {
                    preview.innerHTML = '<p>Image preview will appear here</p>';
                }
            });
        }
    },

    editProduct: (id) => {
        const product = ProductManager.getById(id);
        if (!product) return;
        
        const formArea = document.getElementById('product-form-area');
        if (formArea) {
            formArea.innerHTML = Components.ProductForm(product);
            formArea.scrollIntoView({ behavior: 'smooth' });
            AdminUI.initFormHandlers();
            if (window.lucide) lucide.createIcons();
            
            // Image preview handler
            document.getElementById('product-image').addEventListener('input', (e) => {
                const preview = document.getElementById('image-preview');
                if (e.target.value) {
                    preview.innerHTML = `<img src="${e.target.value}" alt="Preview" onerror="this.src='https://via.placeholder.com/200'">`;
                } else {
                    preview.innerHTML = '<p>Image preview will appear here</p>';
                }
            });
        }
    },

    deleteProduct: async (id) => {
        const product = ProductManager.getById(id);
        if (!product) return;
        
        if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            const result = await ProductManager.delete(id);
            if (result.success) {
                AdminUI.showNotification('Product deleted successfully', 'success');
            } else {
                AdminUI.showNotification(`Error: ${result.error}`, 'error');
            }
        }
    },

    cancelForm: () => {
        const formArea = document.getElementById('product-form-area');
        if (formArea) {
            formArea.innerHTML = '';
        }
    },

    initFormHandlers: () => {
        const form = document.getElementById('product-form');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('product-id').value;
            const productData = {
                name: document.getElementById('product-name').value,
                price: document.getElementById('product-price').value,
                stock: parseInt(document.getElementById('product-stock').value) || 0,
                category: document.getElementById('product-category').value,
                image: document.getElementById('product-image').value,
                desc: document.getElementById('product-desc').value,
                features: document.getElementById('product-features').value.split('\n').filter(f => f.trim())
            };
            
            let result;
            if (id) {
                result = await ProductManager.update(parseInt(id), productData);
            } else {
                result = await ProductManager.create(productData);
            }
            
            if (result.success) {
                AdminUI.showNotification(id ? 'Product updated successfully!' : 'Product added successfully!', 'success');
                AdminUI.cancelForm();
            } else {
                AdminUI.showNotification(`Error: ${result.error}`, 'error');
            }
        });
    },

    filterProducts: (query) => {
        const list = document.getElementById('admin-products-list');
        if (!list) return;
        
        query = query.toLowerCase();
        const filtered = Store.products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            (p.desc && p.desc.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        );
        
        list.innerHTML = filtered.length === 0 ?
            '<p class="empty-state"><i data-lucide="search-x"></i> No products found matching your search.</p>' :
            filtered.map(p => Components.AdminProductCard(p)).join('');
        if (window.lucide) lucide.createIcons();
    },

    filterByCategory: (category) => {
        const list = document.getElementById('admin-products-list');
        const searchInput = document.getElementById('product-search');
        if (!list) return;
        
        // Clear search when filtering by category
        if (searchInput) searchInput.value = '';
        
        const filtered = category ? Store.products.filter(p => p.category === category) : Store.products;
        
        list.innerHTML = filtered.length === 0 ?
            '<p class="empty-state"><i data-lucide="inbox"></i> No products in this category.</p>' :
            filtered.map(p => Components.AdminProductCard(p)).join('');
        if (window.lucide) lucide.createIcons();
    },

    showNotification: (message, type = 'info') => {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        if (window.lucide) lucide.createIcons();
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check for existing session
    await Auth.checkSession();
    
    // Initialize store and router
    Store.init();
    Router.init();
});
