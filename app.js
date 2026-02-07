/* 
   TechR Innovations - Protocol: STRUCTURE v10.0
   Engine: Professional, Debuggable, Secure
*/

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://vmgiylwrpknufdddwcbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xLh_U2MxD-UatsepDCDAUg_9pix1V4f';

// =====================================================
// STRIPE CONFIGURATION
// Replace the value below with your Stripe Publishable Key.
// Find it at: https://dashboard.stripe.com/apikeys
// Use 'pk_test_...' for testing, 'pk_live_...' for production.
// Your Secret Key (sk_...) should NEVER be placed here.
// It belongs on your backend server only.
// =====================================================
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MycO7Fe1hSNms1qzqy4TaiRu1XWGvKbHcdOXz0cnJgJTzpgf4hZaw86sEf1PMiSYe6X5FL9Pf7zRaz3e6oef8V000uVMlo2fe';

// --- TOAST NOTIFICATIONS ---
const Toast = {
    container: null,
    
    init: () => {
        if (!Toast.container) {
            Toast.container = document.createElement('div');
            Toast.container.id = 'toast-container';
            Toast.container.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
            document.body.appendChild(Toast.container);
        }
    },
    
    show: (message, type = 'info', duration = 4000) => {
        Toast.init();
        const toast = document.createElement('div');
        const colors = {
            success: 'rgba(52, 199, 89, 0.95)',
            error: 'rgba(255, 69, 58, 0.95)',
            info: 'rgba(41, 151, 255, 0.95)'
        };
        toast.style.cssText = `
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-size: 0.95rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            max-width: 350px;
        `;
        toast.textContent = message;
        Toast.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    success: (msg) => Toast.show(msg, 'success'),
    error: (msg) => Toast.show(msg, 'error'),
    info: (msg) => Toast.show(msg, 'info')
};

// --- PAYMENT BUTTON HELPER ---
const PayButton = {
    setLoading: (btn) => {
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" style="width: 18px; height: 18px; animation: spin 1s linear infinite;"></i> Processing...';
        if (window.lucide) lucide.createIcons();
    },
    
    setReady: (btn, amount) => {
        if (!btn) return;
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="lock" style="width: 18px; height: 18px;"></i> Pay $${amount}`;
        if (window.lucide) lucide.createIcons();
    }
};

// --- LOGGER ---
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

// --- SUPABASE INIT ---
let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("[TechR] Supabase Online");
    }
} catch (e) {
    console.warn("[TechR] Supabase Init Failed - using fallback data");
}

// --- REAL-TIME SYNC ---
function initRealtimeSync() {
    if (!supabase) return;
    try {
        supabase.channel('products-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, async () => {
                console.log('[TechR] Real-time update received');
                await Store.fetchProducts();
                Router.handleRoute();
                Toast.info('Products updated in real-time');
            })
            .subscribe();
        console.log('[TechR] Real-time sync enabled');
    } catch(e) {
        console.warn('[TechR] Real-time sync unavailable');
    }
}

// --- DEFAULT PRODUCTS ---
const DEFAULT_PRODUCTS = [
    // Techack Products
    { id: 1, name: "Techack1 Pro", price: 499.99, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80", "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80"], colors: ["#1a1a2e", "#16213e", "#0f3460"], category: "techack", desc: "Enterprise-grade portable pentesting framework with WiFi 6 and Bluetooth 5.2 capabilities." },
    { id: 2, name: "Techack1 Lite", price: 299.99, image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80", images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80", "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80"], colors: ["#2d3436", "#636e72"], category: "techack", desc: "Compact security testing device for educational and professional use." },
    { id: 3, name: "Techack Network Probe", price: 149.99, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80"], colors: ["#0a3d62", "#1e3799"], category: "techack", desc: "Passive network analysis tool with real-time packet inspection." },
    
    // TechBox Products
    { id: 4, name: "TechBox Starter Kit", price: 79.99, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", images: ["https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", "https://images.unsplash.com/photo-1553406830-ef2f0c93b5c4?w=800&q=80"], colors: ["#ff9f0a", "#e17055", "#fdcb6e"], category: "techbox", desc: "Complete STEM electronics kit with Arduino-compatible microcontroller and 50+ components." },
    { id: 5, name: "TechBox Advanced", price: 149.99, image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80", images: ["https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80", "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80"], colors: ["#2d3436", "#636e72"], category: "techbox", desc: "Advanced robotics and IoT development platform with sensor arrays." },
    { id: 6, name: "TechBox Classroom (10-Pack)", price: 599.99, image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80", images: ["https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80"], colors: ["#ff9f0a", "#2d3436"], category: "techbox", desc: "Bulk educational kit package for schools and coding bootcamps." },
    
    // Rithim Products
    { id: 7, name: "Rithim Classic Tee", price: 34.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80"], colors: ["#ffffff", "#2d3436", "#ff375f", "#0984e3"], category: "rithim", desc: "Premium cotton crew neck tee with embroidered Rithim logo. Available in all sizes." },
    { id: 8, name: "Rithim Hoodie", price: 64.99, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80", "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&q=80"], colors: ["#2d3436", "#dfe6e9", "#ff375f"], category: "rithim", desc: "Heavyweight fleece hoodie with kangaroo pocket and Rithim branding. Perfect for everyday wear." },
    { id: 9, name: "Rithim Joggers", price: 49.99, image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80", images: ["https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"], colors: ["#2d3436", "#636e72", "#b2bec3"], category: "rithim", desc: "Comfortable tapered joggers with elasticized cuffs and drawstring waist. Soft cotton blend." },

    // StudyTech Products
    { id: 10, name: "StudyTech AI Tutor - Monthly", price: 19.99, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", images: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"], colors: ["#5e5ce6"], category: "studytech", desc: "AI-powered personalized learning assistant with adaptive curriculum." },
    { id: 11, name: "StudyTech AI Tutor - Annual", price: 149.99, image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80", images: ["https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"], colors: ["#5e5ce6", "#a29bfe"], category: "studytech", desc: "Full year of AI tutoring with advanced analytics and progress tracking." },
    { id: 12, name: "StudyTech Enterprise", price: 999.99, image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80", images: ["https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80"], colors: ["#5e5ce6", "#2d3436"], category: "studytech", desc: "Enterprise learning platform license for up to 100 students." }
];

// --- STORE & STATE ---
const Store = {
    products: [],
    cart: [],
    syncMode: 'local', // 'supabase' or 'local'
    lastSynced: null,

    init: async () => {
        const savedCart = localStorage.getItem('techr_cart_v3');
        if (savedCart) {
            try {
                Store.cart = JSON.parse(savedCart);
            } catch (e) {
                Store.cart = [];
            }
        }
        await Store.fetchProducts();
    },

    fetchProducts: async () => {
        try {
            if (supabase) {
                const { data, error } = await supabase.from('products').select('*');
                if (!error && data && data.length > 0) {
                    Store.products = data;
                    Store.syncMode = 'supabase';
                    Store.lastSynced = new Date();
                    return;
                }
            }
        } catch (e) { 
            console.warn("[TechR] Database unavailable, using local storage");
        }

        // Try loading from localStorage first (persisted local edits)
        Store.syncMode = 'local';
        const savedProducts = localStorage.getItem('techr_products_v1');
        if (savedProducts) {
            try {
                Store.products = JSON.parse(savedProducts);
                Store.lastSynced = new Date();
                return;
            } catch (e) {
                console.warn("[TechR] Failed to parse saved products");
            }
        }

        // Fall back to default inventory
        Store.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        Store.persistProducts();
        Store.lastSynced = new Date();
    },

    persistProducts: () => {
        if (Store.syncMode === 'local') {
            localStorage.setItem('techr_products_v1', JSON.stringify(Store.products));
        }
    },

    resetToDefaults: () => {
        Store.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
        Store.syncMode = 'local';
        Store.persistProducts();
        Store.lastSynced = new Date();
        Toast.success('Products reset to defaults (12 original products restored)');
        Router.handleRoute();
    },

    getProductsByCategory: (category) => {
        return Store.products.filter(p => p.category === category);
    },

    addToCart: (id) => {
        const product = Store.products.find(p => p.id === id);
        if (product) {
            const existing = Store.cart.find(item => item.id === id);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                Store.cart.push({...product, quantity: 1, cartId: Date.now() + Math.random()});
            }
            Store.persist();
            Store.updateCartUI();
            
            // Button feedback
            const btns = document.querySelectorAll(`button[data-product-id="${id}"]`);
            btns.forEach(b => {
                const originalText = b.textContent;
                b.textContent = "✓ Added";
                b.classList.add('btn-success');
                b.classList.remove('btn-secondary', 'btn-primary');
                setTimeout(() => {
                    b.textContent = originalText;
                    b.classList.remove('btn-success');
                    b.classList.add('btn-secondary');
                }, 1500);
            });
        }
    },

    removeFromCart: (cartId) => {
        Store.cart = Store.cart.filter(item => item.cartId !== cartId);
        Store.persist();
        Store.updateCartUI();
        Router.handleRoute();
    },

    updateQuantity: (cartId, delta) => {
        const item = Store.cart.find(i => i.cartId === cartId);
        if (item) {
            item.quantity = (item.quantity || 1) + delta;
            if (item.quantity <= 0) {
                Store.cart = Store.cart.filter(i => i.cartId !== cartId);
            }
        }
        Store.persist();
        Store.updateCartUI();
        Router.handleRoute();
    },

    clearCart: () => {
        Store.cart = [];
        Store.persist();
        Store.updateCartUI();
    },

    getCartTotal: () => {
        return Store.cart.reduce((sum, item) => sum + parseFloat(item.price) * (item.quantity || 1), 0).toFixed(2);
    },

    persist: () => {
        localStorage.setItem('techr_cart_v3', JSON.stringify(Store.cart));
    },

    updateCartUI: () => {
        const badge = document.getElementById('cart-badge');
        const cartCount = document.getElementById('cart-count');
        const totalItems = Store.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        
        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }
};

// --- MOBILE MENU ---
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Make it globally available
window.toggleMobileMenu = toggleMobileMenu;
window.Store = Store;

// --- ADMIN PRODUCT MANAGEMENT ---
const Admin = {
    filterSearch: '',
    filterCategory: '',
    siteSettings: {
        title: 'TechR Innovations',
        description: 'Pioneering the intersection of cybersecurity, advanced education, and clothing.',
        email: 'contact@techr.com'
    },

    pendingImages: [],

    previewImage: (url) => {
        const preview = document.getElementById('image-preview');
        if (preview && url) {
            preview.src = url;
            preview.style.display = 'block';
            preview.onerror = () => { preview.style.display = 'none'; };
        } else if (preview) {
            preview.style.display = 'none';
        }
    },

    handleFileUpload: (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            Toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            Toast.error('Image must be under 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            const urlInput = document.getElementById('product-image');
            if (urlInput) urlInput.value = dataUrl;
            Admin.previewImage(dataUrl);
            Toast.success('Image uploaded successfully');
        };
        reader.readAsDataURL(file);
    },

    handleAdditionalImages: (files) => {
        if (!files || files.length === 0) return;
        const container = document.getElementById('additional-images-preview');
        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            if (file.size > 5 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                Admin.pendingImages.push(e.target.result);
                Admin.renderAdditionalPreviews();
            };
            reader.readAsDataURL(file);
        });
    },

    renderAdditionalPreviews: () => {
        const container = document.getElementById('additional-images-preview');
        if (!container) return;
        container.innerHTML = Admin.pendingImages.map((img, i) => `
            <div class="additional-img-thumb" style="position: relative; display: inline-block;">
                <img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-glass);">
                <button type="button" class="remove-additional-img" data-img-index="${i}" style="position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; background: var(--danger); color: white; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
            </div>
        `).join('');
    },

    showAddModal: () => {
        document.getElementById('modal-title').textContent = 'Add Product';
        document.getElementById('product-edit-id').value = '';
        document.getElementById('product-form').reset();
        document.getElementById('product-colors').value = '';
        Admin.pendingImages = [];
        Admin.renderAdditionalPreviews();
        const preview = document.getElementById('image-preview');
        if (preview) preview.style.display = 'none';
        document.getElementById('product-modal').style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    },

    showEditModal: (id) => {
        const product = Store.products.find(p => p.id === id);
        if (!product) return;
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('product-edit-id').value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-desc').value = product.desc;
        document.getElementById('product-colors').value = (product.colors || []).join(', ');
        Admin.pendingImages = (product.images || []).filter(img => img !== product.image);
        Admin.renderAdditionalPreviews();
        Admin.previewImage(product.image);
        document.getElementById('product-modal').style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    },

    closeModal: () => {
        document.getElementById('product-modal').style.display = 'none';
    },

    saveProduct: async () => {
        const editId = document.getElementById('product-edit-id').value;
        const mainImage = document.getElementById('product-image').value;
        const colorsRaw = document.getElementById('product-colors').value;
        const colors = colorsRaw ? colorsRaw.split(',').map(c => c.trim()).filter(c => c) : [];
        const allImages = [mainImage, ...Admin.pendingImages].filter(Boolean);
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            image: mainImage,
            images: allImages,
            colors: colors,
            desc: document.getElementById('product-desc').value
        };

        try {
            let usedSupabase = false;
            if (supabase && Store.syncMode === 'supabase') {
                if (editId) {
                    const { error } = await supabase.from('products').update(productData).eq('id', parseInt(editId));
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('products').insert([productData]);
                    if (error) throw error;
                }
                usedSupabase = true;
                await Store.fetchProducts();
            } else {
                // Local storage mode
                if (editId) {
                    const idx = Store.products.findIndex(p => p.id === parseInt(editId));
                    if (idx !== -1) Store.products[idx] = { ...Store.products[idx], ...productData };
                } else {
                    productData.id = Date.now() + Math.floor(Math.random() * 1000);
                    Store.products.push(productData);
                }
                Store.persistProducts();
                Store.lastSynced = new Date();
            }
            Admin.closeModal();
            const modeLabel = usedSupabase ? ' (synced to cloud)' : ' (saved locally)';
            Toast.success((editId ? 'Product updated!' : 'Product added!') + modeLabel);
            Router.handleRoute();
        } catch(e) {
            Toast.error('Save failed: ' + e.message);
        }
    },

    deleteProduct: async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            if (supabase && Store.syncMode === 'supabase') {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                await Store.fetchProducts();
            } else {
                Store.products = Store.products.filter(p => p.id !== id);
                Store.persistProducts();
                Store.lastSynced = new Date();
            }
            Toast.success('Product deleted');
            Router.handleRoute();
        } catch(e) {
            Toast.error('Delete failed: ' + e.message);
        }
    },

    refreshProducts: async () => {
        Toast.info('Refreshing products...');
        await Store.fetchProducts();
        Store.lastSynced = new Date();
        Toast.success('Products refreshed! Mode: ' + (Store.syncMode === 'supabase' ? 'Cloud' : 'Local'));
        Router.handleRoute();
    }
};
window.Admin = Admin;

// --- COMPONENT FACTORY ---
const Components = {
    ProductCard: (p) => `
        <div class="product-card reveal">
            <a href="#product/${p.id}" style="text-decoration: none; color: inherit;">
                <img src="${p.image}" class="product-img" alt="${p.name}" loading="lazy">
                <div class="product-content">
                    <h3>${p.name}</h3>
                    <p class="product-desc">${p.desc}</p>
                </div>
            </a>
            <div class="product-meta" style="padding: 0 1.5rem 1.5rem;">
                <span class="price">$${p.price.toFixed(2)}</span>
                <button class="btn btn-secondary btn-sm add-to-cart-btn" data-product-id="${p.id}">
                    <i data-lucide="shopping-cart" style="width: 16px; height: 16px;"></i>
                    Add to Cart
                </button>
            </div>
        </div>
    `,

    FeatureCard: (icon, title, description, color = 'accent') => `
        <div class="feature-card reveal">
            <i data-lucide="${icon}" style="color: var(--${color});"></i>
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `,

    CartItem: (item, index) => `
        <div class="cart-item">
            <div class="cart-item-info" style="display: flex; align-items: center; gap: 1rem;">
                <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: var(--bg-tertiary);" alt="${item.name}">
                <div>
                    <strong>${item.name}</strong>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; text-transform: capitalize;">${item.category}</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">$${parseFloat(item.price).toFixed(2)} each</p>
                </div>
            </div>
            <div class="cart-item-actions" style="display: flex; align-items: center; gap: 1rem;">
                <div class="qty-controls">
                    <button data-action="update-qty" data-cart-id="${item.cartId}" data-delta="-1" title="Decrease quantity" aria-label="Decrease quantity">\u2212</button>
                    <span>${item.quantity || 1}</span>
                    <button data-action="update-qty" data-cart-id="${item.cartId}" data-delta="1" title="Increase quantity">+</button>
                </div>
                <span class="cart-item-total">$${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}</span>
                <button class="remove-btn remove-from-cart-btn" data-cart-id="${item.cartId}" title="Remove item" style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 0.5rem;">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
        </div>
    `,

    StatsSection: () => `
        <div class="stats-grid reveal">
            <div class="stat-item">
                <div class="stat-value">500+</div>
                <div class="stat-label">Enterprise Clients</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">50K+</div>
                <div class="stat-label">Devices Deployed</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">99.9%</div>
                <div class="stat-label">Uptime SLA</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">24/7</div>
                <div class="stat-label">Support Available</div>
            </div>
        </div>
    `
};

// --- ROUTER ---
const Router = {
    routes: {
        // HOME PAGE
        '/': () => `
            <div class="fullscreen-section container">
                <h1 class="reveal" style="margin-bottom: 1.5rem;">
                    The Future of<br><span style="color: var(--accent);">Technology</span> is Here.
                </h1>
                <p class="reveal" style="font-size: 1.35rem; margin-top: 0; max-width: 650px;">
                    TechR Innovations delivers enterprise-grade hardware, software, and apparel solutions for cybersecurity, education, clothing, and AI-powered learning.
                </p>
                <div class="reveal" style="margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <a href="#techack" class="btn btn-primary btn-lg">Explore Products</a>
                    <a href="#checkout" class="btn btn-secondary btn-lg">View Cart (<span id="cart-count">${Store.cart.reduce((s, i) => s + (i.quantity || 1), 0)}</span>)</a>
                </div>
            </div>
            
            <div class="container" style="padding-bottom: 4rem;">
                <h2 class="reveal" style="text-align: center; margin-bottom: 3rem;">Our Divisions</h2>
                <div class="grid-3">
                    <a href="#techack" class="card reveal" style="text-decoration: none;">
                        <div class="card-icon" style="background: rgba(52, 199, 89, 0.1);">
                            <i data-lucide="shield" style="color: var(--color-techack);"></i>
                        </div>
                        <h3 style="color: var(--color-techack);">Techack Security</h3>
                        <p>Advanced penetration testing hardware for red team operations and security assessments.</p>
                    </a>
                    <a href="#techbox" class="card reveal" style="text-decoration: none;">
                        <div class="card-icon" style="background: rgba(255, 159, 10, 0.1);">
                            <i data-lucide="box" style="color: var(--color-techbox);"></i>
                        </div>
                        <h3 style="color: var(--color-techbox);">TechBox EDU</h3>
                        <p>STEM learning kits and educational platforms for the next generation of engineers.</p>
                    </a>
                    <a href="#rithim" class="card reveal" style="text-decoration: none;">
                        <div class="card-icon" style="background: rgba(255, 55, 95, 0.1);">
                            <i data-lucide="shirt" style="color: var(--color-rithim);"></i>
                        </div>
                        <h3 style="color: var(--color-rithim);">Rithim Clothing</h3>
                        <p>Premium apparel and streetwear with signature Rithim branding and quality craftsmanship.</p>
                    </a>
                </div>
                
                <div class="grid-3" style="margin-top: 2rem;">
                    <a href="#studytech" class="card reveal" style="text-decoration: none; grid-column: span 1;">
                        <div class="card-icon" style="background: rgba(94, 92, 230, 0.1);">
                            <i data-lucide="brain" style="color: var(--color-studytech);"></i>
                        </div>
                        <h3 style="color: var(--color-studytech);">StudyTech AI</h3>
                        <p>AI-powered adaptive learning assistants that personalize education at scale.</p>
                    </a>
                </div>
            </div>

            ${Components.StatsSection()}

            <div class="container">
                <div class="cta-section reveal">
                    <h2>Ready to Transform Your Operations?</h2>
                    <p>Join 500+ enterprises already using TechR solutions.</p>
                    <a href="#techack" class="btn btn-primary btn-lg">Browse All Products</a>
                </div>
            </div>
        `,

        // TECHACK SECURITY DIVISION
        'techack': () => {
            const products = Store.getProductsByCategory('techack');
            return `
                <div class="division-hero container">
                    <div class="division-header reveal">
                        <span class="badge badge-techack">Security Division</span>
                        <h1 style="color: var(--color-techack);">Techack</h1>
                        <p>Enterprise-grade penetration testing and security assessment hardware for professionals.</p>
                    </div>

                    <div class="features-grid">
                        ${Components.FeatureCard('shield-check', 'Military-Grade Security', 'Hardware encryption and secure boot protect your operations.', 'color-techack')}
                        ${Components.FeatureCard('wifi', 'Wireless Penetration', 'WiFi 6 and Bluetooth 5.2 support for comprehensive testing.', 'color-techack')}
                        ${Components.FeatureCard('cpu', 'High Performance', 'Quad-core processor handles complex security operations.', 'color-techack')}
                        ${Components.FeatureCard('lock', 'Compliance Ready', 'Meets PCI-DSS, HIPAA, and SOC 2 requirements.', 'color-techack')}
                    </div>

                    <h2 class="reveal" style="margin-top: 4rem;">Techack Products</h2>
                    <div class="product-grid" style="margin-top: 2rem;">
                        ${products.map(p => Components.ProductCard(p)).join('')}
                    </div>

                    <div class="cta-section reveal" style="margin-top: 4rem;">
                        <h2>Need Custom Security Solutions?</h2>
                        <p>Contact our enterprise team for custom configurations and volume pricing.</p>
                        <a href="#admin" class="btn btn-primary">Contact Sales</a>
                    </div>
                </div>
            `;
        },

        // TECHBOX EDUCATION DIVISION
        'techbox': () => {
            const products = Store.getProductsByCategory('techbox');
            return `
                <div class="division-hero container">
                    <div class="division-header reveal">
                        <span class="badge badge-techbox">Education Division</span>
                        <h1 style="color: var(--color-techbox);">TechBox</h1>
                        <p>Comprehensive STEM education kits designed for learners of all ages.</p>
                    </div>

                    <div class="features-grid">
                        ${Components.FeatureCard('book-open', 'Curriculum Aligned', 'Content aligned with national STEM education standards.', 'color-techbox')}
                        ${Components.FeatureCard('users', 'Classroom Ready', 'Bulk packages designed for educational institutions.', 'color-techbox')}
                        ${Components.FeatureCard('code', 'Learn to Code', 'From block coding to Python, grow with the platform.', 'color-techbox')}
                        ${Components.FeatureCard('trophy', 'Competition Ready', 'Prepares students for robotics and coding competitions.', 'color-techbox')}
                    </div>

                    <h2 class="reveal" style="margin-top: 4rem;">TechBox Products</h2>
                    <div class="product-grid" style="margin-top: 2rem;">
                        ${products.map(p => Components.ProductCard(p)).join('')}
                    </div>

                    <div class="cta-section reveal" style="margin-top: 4rem;">
                        <h2>Educator Discounts Available</h2>
                        <p>Schools and educational institutions receive special pricing.</p>
                        <a href="#admin" class="btn btn-primary">Apply for Edu Discount</a>
                    </div>
                </div>
            `;
        },

        // RITHIM CLOTHING DIVISION
        'rithim': () => {
            const products = Store.getProductsByCategory('rithim');
            return `
                <div class="division-hero container">
                    <div class="division-header reveal">
                        <span class="badge badge-rithim">Clothing Line</span>
                        <h1 style="color: var(--color-rithim);">Rithim</h1>
                        <p>Premium apparel designed for style, comfort, and everyday confidence.</p>
                    </div>

                    <div class="features-grid">
                        ${Components.FeatureCard('shirt', 'Signature Style', 'Bold designs with the iconic Rithim branding you love.', 'color-rithim')}
                        ${Components.FeatureCard('heart', 'Premium Comfort', 'Soft fabrics and tailored fits for all-day wearability.', 'color-rithim')}
                        ${Components.FeatureCard('star', 'Quality Craftsmanship', 'Durable construction with attention to every detail.', 'color-rithim')}
                        ${Components.FeatureCard('palette', 'Versatile Collection', 'From casual tees to cozy hoodies, find your perfect look.', 'color-rithim')}
                    </div>

                    <h2 class="reveal" style="margin-top: 4rem;">Rithim Collection</h2>
                    <div class="product-grid" style="margin-top: 2rem;">
                        ${products.map(p => Components.ProductCard(p)).join('')}
                    </div>

                    <div class="cta-section reveal" style="margin-top: 4rem;">
                        <h2>Wear the Brand</h2>
                        <p>Explore our full clothing line and find pieces that match your vibe.</p>
                        <a href="#checkout" class="btn btn-primary">Shop Now</a>
                    </div>
                </div>
            `;
        },

        // STUDYTECH AI DIVISION
        'studytech': () => {
            const products = Store.getProductsByCategory('studytech');
            return `
                <div class="division-hero container">
                    <div class="division-header reveal">
                        <span class="badge badge-studytech">AI Division</span>
                        <h1 style="color: var(--color-studytech);">StudyTech</h1>
                        <p>AI-powered personalized learning that adapts to every student.</p>
                    </div>

                    <div class="features-grid">
                        ${Components.FeatureCard('brain', 'Adaptive AI', 'Machine learning algorithms personalize every lesson.', 'color-studytech')}
                        ${Components.FeatureCard('bar-chart-3', 'Progress Tracking', 'Detailed analytics for students, parents, and educators.', 'color-studytech')}
                        ${Components.FeatureCard('globe', 'Any Subject', 'From mathematics to languages, comprehensive coverage.', 'color-studytech')}
                        ${Components.FeatureCard('zap', 'Instant Feedback', 'Real-time explanations and guided problem solving.', 'color-studytech')}
                    </div>

                    <h2 class="reveal" style="margin-top: 4rem;">StudyTech Subscriptions</h2>
                    <div class="pricing-grid" style="margin-top: 2rem;">
                        <div class="pricing-card reveal">
                            <h3>Monthly</h3>
                            <div class="price">$19.99<span>/mo</span></div>
                            <ul class="pricing-features">
                                <li><i data-lucide="check"></i> Unlimited AI tutoring sessions</li>
                                <li><i data-lucide="check"></i> All subjects included</li>
                                <li><i data-lucide="check"></i> Progress tracking</li>
                                <li><i data-lucide="check"></i> Cancel anytime</li>
                            </ul>
                            <button class="btn btn-secondary add-to-cart-btn" data-product-id="10" style="width: 100%;">Subscribe Monthly</button>
                        </div>
                        <div class="pricing-card featured reveal">
                            <h3>Annual</h3>
                            <div class="price">$149.99<span>/yr</span></div>
                            <ul class="pricing-features">
                                <li><i data-lucide="check"></i> Everything in Monthly</li>
                                <li><i data-lucide="check"></i> Advanced analytics</li>
                                <li><i data-lucide="check"></i> Priority support</li>
                                <li><i data-lucide="check"></i> Save $89.89/year</li>
                            </ul>
                            <button class="btn btn-primary add-to-cart-btn" data-product-id="11" style="width: 100%;">Subscribe Annually</button>
                        </div>
                        <div class="pricing-card reveal">
                            <h3>Enterprise</h3>
                            <div class="price">$999.99<span>/yr</span></div>
                            <ul class="pricing-features">
                                <li><i data-lucide="check"></i> Up to 100 students</li>
                                <li><i data-lucide="check"></i> Admin dashboard</li>
                                <li><i data-lucide="check"></i> Custom curriculum</li>
                                <li><i data-lucide="check"></i> Dedicated support</li>
                            </ul>
                            <button class="btn btn-secondary add-to-cart-btn" data-product-id="12" style="width: 100%;">Get Enterprise</button>
                        </div>
                    </div>
                </div>
            `;
        },

        // ADMIN / LOGIN PAGE
        'admin': () => `
            <div class="auth-container">
                <div class="auth-form reveal">
                    <div style="text-align: center; margin-bottom: 2rem;">
                        <i data-lucide="shield" style="width: 48px; height: 48px; color: var(--accent);"></i>
                    </div>
                    <h2 style="text-align: center;">Staff Portal</h2>
                    <p style="text-align: center;">Access restricted to authorized personnel only.</p>
                    
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" placeholder="you@techr.com" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" placeholder="••••••••" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
                            <i data-lucide="log-in" style="width: 18px; height: 18px;"></i>
                            Sign In
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-glass);">
                        <p style="font-size: 0.9rem; margin-bottom: 1rem;">Need help?</p>
                        <a href="mailto:support@techr.com" style="color: var(--accent); font-size: 0.9rem;">Contact IT Support</a>
                    </div>
                </div>
                
                <div class="card reveal" style="margin-top: 2rem; text-align: center;">
                    <p style="font-size: 0.9rem; margin-bottom: 1rem;">Looking for our products?</p>
                    <a href="#techack" class="btn btn-secondary">Browse Catalog</a>
                </div>
            </div>
        `,

        // ADMIN DASHBOARD
        'dashboard': () => {
            const allProducts = Store.products;
            const searchTerm = (Admin.filterSearch || '').toLowerCase();
            const filterCat = Admin.filterCategory || '';
            const products = allProducts.filter(p => {
                const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm) || p.category.toLowerCase().includes(searchTerm);
                const matchesCat = !filterCat || p.category === filterCat;
                return matchesSearch && matchesCat;
            });
            const categories = [...new Set(allProducts.map(p => p.category))];
            const avgPrice = allProducts.length > 0 ? (allProducts.reduce((s, p) => s + p.price, 0) / allProducts.length).toFixed(2) : '0.00';
            const syncIcon = Store.syncMode === 'supabase' ? 'cloud' : 'hard-drive';
            const syncLabel = Store.syncMode === 'supabase' ? 'Cloud Synced' : 'Local Storage';
            const syncColor = Store.syncMode === 'supabase' ? 'rgba(52, 199, 89, 0.95)' : 'rgba(255, 159, 10, 0.95)';
            const lastSync = Store.lastSynced ? Store.lastSynced.toLocaleTimeString() : 'Never';

            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem); padding-bottom: 4rem;">
                    <div class="dashboard-header reveal">
                        <div>
                            <h1 style="font-size: 2.5rem;">Admin Dashboard</h1>
                            <p>Manage products and inventory</p>
                        </div>
                        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
                            <button class="btn btn-primary" data-action="add-product">
                                <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Add Product
                            </button>
                            <button class="btn btn-secondary" data-action="refresh-products">
                                <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i> Refresh
                            </button>
                            <button class="btn btn-secondary" data-action="logout">
                                <i data-lucide="log-out" style="width: 18px; height: 18px;"></i> Sign Out
                            </button>
                        </div>
                    </div>

                    <!-- Sync Status Banner -->
                    <div class="admin-sync-banner reveal" style="background: ${syncColor}; color: white; padding: 0.75rem 1.25rem; border-radius: 12px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <i data-lucide="${syncIcon}" style="width: 18px; height: 18px;"></i>
                            <strong>${syncLabel}</strong>
                            <span style="opacity: 0.85; font-size: 0.85rem;">&mdash; Last synced: ${lastSync}</span>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            ${Store.syncMode === 'local' ? '<button class="btn btn-sm" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); font-size: 0.8rem; padding: 0.35rem 0.75rem;" data-action="reset-defaults">Reset to Defaults</button>' : ''}
                        </div>
                    </div>

                    <div class="admin-stats reveal">
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">${allProducts.length}</div>
                            <div class="admin-stat-label">Total Products</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">${categories.length}</div>
                            <div class="admin-stat-label">Categories</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">$${allProducts.reduce((sum, p) => sum + p.price, 0).toFixed(0)}</div>
                            <div class="admin-stat-label">Total Inventory Value</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">$${avgPrice}</div>
                            <div class="admin-stat-label">Avg. Price</div>
                        </div>
                    </div>

                    <div class="admin-search-bar reveal">
                        <input type="text" id="admin-search" placeholder="Search products by name or category..." value="${Admin.filterSearch || ''}">
                        <select id="admin-category-filter">
                            <option value="">All Categories</option>
                            ${categories.map(c => `<option value="${c}" ${filterCat === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>

                    ${products.length === 0 ? `
                        <div class="card reveal" style="text-align: center; padding: 3rem 2rem;">
                            <i data-lucide="package-x" style="width: 48px; height: 48px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                            <h3 style="margin-bottom: 0.5rem;">No Products Found</h3>
                            <p style="color: var(--text-secondary);">${searchTerm || filterCat ? 'Try adjusting your search or filter.' : 'Add your first product to get started.'}</p>
                        </div>
                    ` : `
                        <div class="admin-products-grid reveal">
                            ${products.map(p => `
                                <div class="admin-product-card">
                                    <img src="${p.image}" alt="${p.name}" class="admin-product-img">
                                    <div class="admin-product-info">
                                        <h3>${p.name}</h3>
                                        <span class="badge badge-${p.category}" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">${p.category}</span>
                                        <p class="admin-product-desc">${p.desc}</p>
                                        <p class="admin-product-price">$${p.price.toFixed(2)}</p>
                                    </div>
                                    <div class="admin-product-actions">
                                        <button class="btn btn-secondary btn-sm" data-action="edit-product" data-product-id="${p.id}">
                                            <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i> Edit
                                        </button>
                                        <button class="btn btn-danger btn-sm" data-action="delete-product" data-product-id="${p.id}">
                                            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}

                    <hr class="admin-section-divider">

                    <div class="admin-settings-section reveal">
                        <h2><i data-lucide="settings" style="width: 24px; height: 24px;"></i> Site Settings</h2>
                        <div class="settings-form">
                            <div class="form-group">
                                <label for="site-title">Site Title</label>
                                <input type="text" id="site-title" value="${Admin.siteSettings.title}">
                            </div>
                            <div class="form-group">
                                <label for="site-desc">Site Description</label>
                                <textarea id="site-desc" rows="2">${Admin.siteSettings.description}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="site-email">Contact Email</label>
                                <input type="email" id="site-email" value="${Admin.siteSettings.email}">
                            </div>
                            <button class="btn btn-primary" data-action="save-settings">
                                <i data-lucide="save" style="width: 16px; height: 16px;"></i> Save Settings
                            </button>
                        </div>
                    </div>

                    <hr class="admin-section-divider">

                    <div class="admin-settings-section reveal">
                        <h2><i data-lucide="package" style="width: 24px; height: 24px;"></i> Orders <span class="coming-soon-badge">Coming Soon</span></h2>
                        <p style="color: var(--text-secondary);">Order management and tracking will be available in a future update.</p>
                    </div>
                </div>

                <!-- Product Modal -->
                <div id="product-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modal-title">Add Product</h2>
                            <button class="modal-close" data-action="close-modal">
                                <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                            </button>
                        </div>
                        <form id="product-form">
                            <input type="hidden" id="product-edit-id">
                            <div class="form-group">
                                <label for="product-name">Product Name</label>
                                <input type="text" id="product-name" placeholder="Product name" required>
                            </div>
                            <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div class="form-group">
                                    <label for="product-price">Price ($)</label>
                                    <input type="number" id="product-price" step="0.01" min="0" placeholder="0.00" required>
                                </div>
                                <div class="form-group">
                                    <label for="product-category">Category</label>
                                    <select id="product-category" required>
                                        <option value="techack">Techack</option>
                                        <option value="techbox">TechBox</option>
                                        <option value="rithim">Rithim</option>
                                        <option value="studytech">StudyTech</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Main Product Image</label>
                                <div class="image-upload-area">
                                    <div class="upload-options" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        <label for="product-image-file" class="btn btn-secondary btn-sm" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem;">
                                            <i data-lucide="upload" style="width: 14px; height: 14px;"></i> Upload Photo
                                        </label>
                                        <input type="file" id="product-image-file" accept="image/*" style="display: none;">
                                        <span style="color: var(--text-secondary); font-size: 0.85rem; align-self: center;">or paste URL below</span>
                                    </div>
                                    <input type="text" id="product-image" placeholder="https://images.unsplash.com/... or upload above" required>
                                    <img id="image-preview" class="image-preview" style="display: none;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Additional Photos</label>
                                <div class="image-upload-area">
                                    <label for="product-additional-images" class="btn btn-secondary btn-sm" style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.25rem; margin-bottom: 0.5rem;">
                                        <i data-lucide="images" style="width: 14px; height: 14px;"></i> Add More Photos
                                    </label>
                                    <input type="file" id="product-additional-images" accept="image/*" multiple style="display: none;">
                                    <div id="additional-images-preview" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;"></div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="product-colors">Colors (comma-separated hex codes)</label>
                                <input type="text" id="product-colors" placeholder="#ffffff, #2d3436, #ff375f">
                            </div>
                            <div class="form-group">
                                <label for="product-desc">Description</label>
                                <textarea id="product-desc" rows="3" placeholder="Product description..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary" style="width: 100%;">
                                <i data-lucide="save" style="width: 18px; height: 18px;"></i> Save Product
                            </button>
                        </form>
                    </div>
                </div>
            `;
        },

        // PRODUCT DETAIL PAGE
        'product': () => {
            const hash = window.location.hash;
            const idMatch = hash.match(/product\/(\d+)/);
            const id = idMatch ? parseInt(idMatch[1]) : null;
            const product = id ? Store.products.find(p => p.id === id) : null;
            
            if (!product) {
                return `
                    <div class="container" style="padding-top: calc(var(--header-height) + 4rem); text-align: center;">
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist.</p>
                        <a href="#/" class="btn btn-primary" style="margin-top: 2rem;">Go Home</a>
                    </div>
                `;
            }

            const related = Store.getProductsByCategory(product.category).filter(p => p.id !== product.id);
            const productImages = product.images && product.images.length > 0 ? product.images : [product.image];
            const productColors = product.colors && product.colors.length > 0 ? product.colors : [];
            const categoryLabels = { techack: 'Techack Security', techbox: 'TechBox Education', rithim: 'Rithim Clothing', studytech: 'StudyTech AI' };
            
            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem); padding-bottom: 4rem;">
                    <div class="product-detail-breadcrumb reveal">
                        <a href="#/">Home</a>
                        <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                        <a href="#${product.category}">${categoryLabels[product.category] || product.category}</a>
                        <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
                        <span>${product.name}</span>
                    </div>
                    
                    <div class="product-detail reveal">
                        <div class="product-detail-gallery">
                            <div class="product-detail-main-image">
                                <img id="product-main-img" src="${productImages[0]}" alt="${product.name}">
                            </div>
                            ${productImages.length > 1 ? `
                                <div class="product-detail-thumbnails">
                                    ${productImages.map((img, i) => `
                                        <button class="product-thumb ${i === 0 ? 'active' : ''}" data-action="switch-image" data-img-src="${img}">
                                            <img src="${img}" alt="${product.name} view ${i + 1}">
                                        </button>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <div class="product-detail-info">
                            <span class="badge badge-${product.category}">${categoryLabels[product.category] || product.category}</span>
                            <h1 style="font-size: 2.5rem; margin: 1rem 0 0.5rem;">${product.name}</h1>
                            <div class="product-detail-rating">
                                <div class="stars">
                                    <i data-lucide="star" style="width: 16px; height: 16px; fill: #ff9f0a; color: #ff9f0a;"></i>
                                    <i data-lucide="star" style="width: 16px; height: 16px; fill: #ff9f0a; color: #ff9f0a;"></i>
                                    <i data-lucide="star" style="width: 16px; height: 16px; fill: #ff9f0a; color: #ff9f0a;"></i>
                                    <i data-lucide="star" style="width: 16px; height: 16px; fill: #ff9f0a; color: #ff9f0a;"></i>
                                    <i data-lucide="star" style="width: 16px; height: 16px; color: #ff9f0a;"></i>
                                </div>
                                <span class="rating-text">4.0 (12 reviews)</span>
                            </div>
                            <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 1.5rem; color: var(--text-secondary);">${product.desc}</p>
                            
                            ${productColors.length > 0 ? `
                                <div class="product-detail-colors">
                                    <label>Color</label>
                                    <div class="color-options">
                                        ${productColors.map((color, i) => `
                                            <button class="color-swatch ${i === 0 ? 'active' : ''}" style="background: ${color};" title="${color}" data-color="${color}"></button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="price" style="font-size: 2.5rem; margin-bottom: 1.5rem;">$${product.price.toFixed(2)}</div>
                            
                            <div class="product-detail-features">
                                <div class="detail-feature">
                                    <i data-lucide="truck" style="width: 18px; height: 18px; color: var(--success);"></i>
                                    <span>Free shipping over $50</span>
                                </div>
                                <div class="detail-feature">
                                    <i data-lucide="shield-check" style="width: 18px; height: 18px; color: var(--accent);"></i>
                                    <span>1-year warranty</span>
                                </div>
                                <div class="detail-feature">
                                    <i data-lucide="refresh-cw" style="width: 18px; height: 18px; color: var(--color-techbox);"></i>
                                    <span>30-day returns</span>
                                </div>
                            </div>

                            <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem;">
                                <button class="btn btn-primary btn-lg add-to-cart-btn" data-product-id="${product.id}">
                                    <i data-lucide="shopping-cart" style="width: 20px; height: 20px;"></i> Add to Cart
                                </button>
                                <a href="#checkout" class="btn btn-secondary btn-lg">
                                    <i data-lucide="credit-card" style="width: 20px; height: 20px;"></i> Buy Now
                                </a>
                            </div>
                        </div>
                    </div>

                    ${related.length > 0 ? `
                        <div style="margin-top: 4rem;">
                            <h2 class="reveal">You May Also Like</h2>
                            <div class="product-grid" style="margin-top: 2rem;">
                                ${related.map(p => Components.ProductCard(p)).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        // CHECKOUT PAGE
        'checkout': () => {
            const total = Store.getCartTotal();
            const itemCount = Store.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

            if (itemCount === 0) {
                return `
                    <div class="container" style="padding-top: calc(var(--header-height) + 4rem);">
                        <div class="checkout-container">
                            <div class="card reveal" style="text-align: center; padding: 4rem 2rem;">
                                <i data-lucide="shopping-cart" style="width: 64px; height: 64px; color: var(--text-secondary); margin-bottom: 1.5rem;"></i>
                                <h2 style="margin-bottom: 1rem;">Your Cart is Empty</h2>
                                <p style="margin-bottom: 2rem; color: var(--text-secondary);">Looks like you haven't added any products yet.</p>
                                <a href="#techack" class="btn btn-primary">Browse Products</a>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem);">
                    <div class="checkout-container">
                        <h2 class="reveal" style="margin-bottom: 0.5rem;">Secure Checkout</h2>
                        <p class="reveal" style="color: var(--text-secondary); margin-bottom: 2rem;">${itemCount} item${itemCount > 1 ? 's' : ''} in your cart</p>
                        
                        <div class="checkout-steps reveal">
                            <div class="checkout-step active">
                                <span class="checkout-step-number">1</span>
                                <span>Review</span>
                            </div>
                            <div class="checkout-step active">
                                <span class="checkout-step-number">2</span>
                                <span>Payment</span>
                            </div>
                            <div class="checkout-step">
                                <span class="checkout-step-number">3</span>
                                <span>Confirm</span>
                            </div>
                        </div>

                        <div class="card reveal" style="margin-bottom: 2rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                                <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                    <i data-lucide="shopping-bag" style="width: 20px; height: 20px;"></i>
                                    Order Summary
                                </h3>
                                <button class="cart-clear-btn" data-action="clear-cart">
                                    <i data-lucide="trash" style="width: 14px; height: 14px;"></i>
                                    Clear Cart
                                </button>
                            </div>
                            ${Store.cart.map((item, i) => Components.CartItem(item, i)).join('')}
                            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 1.1rem; font-weight: 500;">Total</span>
                                <span class="price" style="font-size: 1.5rem;">$${total}</span>
                            </div>
                        </div>

                        <div class="card reveal checkout-payment-card">
                            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="credit-card" style="width: 20px; height: 20px;"></i>
                                Payment Details
                            </h3>
                            <div id="card-container">
                                <div id="card-element"></div>
                                <div id="card-errors" role="alert" style="color: var(--danger); font-size: 0.85rem; margin-top: 0.75rem; min-height: 1.25rem;"></div>
                            </div>
                            <button id="pay-btn" class="btn btn-primary btn-lg" style="width: 100%; margin-top: 0.5rem;">
                                <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
                                Pay $${total}
                            </button>
                            <div style="text-align: center; margin-top: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                                <i data-lucide="shield-check" style="width: 14px; height: 14px; color: var(--text-secondary);"></i>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">Payments secured by Stripe</span>
                            </div>
                        </div>
                        
                        <details style="margin-top: 2rem;" class="reveal">
                            <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.9rem;">Developer Console</summary>
                            <pre id="debug-log" class="debug-log" style="margin-top: 1rem;">Awaiting payment initialization...</pre>
                        </details>
                    </div>
                </div>
            `;
        },

        // ABOUT PAGE
        'about': () => `
            <div class="container" style="padding-top: calc(var(--header-height) + 3rem); padding-bottom: 4rem;">
                <div class="about-hero reveal">
                    <h1>About <span style="color: var(--accent);">TechR Innovations</span></h1>
                    <p>Building the future through technology, education, and style.</p>
                </div>

                <div class="about-founder-section reveal">
                    <div class="about-founder-card">
                        <div class="about-founder-photo">
                            <img src="https://avatars.githubusercontent.com/u/100300869?v=4" alt="Ryan Pegg - Founder">
                        </div>
                        <div class="about-founder-info">
                            <span class="badge" style="background: rgba(41, 151, 255, 0.15); color: var(--accent); margin-bottom: 0.75rem; display: inline-block;">Founder & CEO</span>
                            <h2>Ryan Pegg</h2>
                            <p class="about-founder-tagline">Young entrepreneur, hardware hacker, and innovator passionate about building the future of technology.</p>
                            <p class="about-founder-bio">
                                Ryan is the driving force behind TechR Innovations. With deep expertise in cybersecurity hardware, embedded systems, 
                                and a creative vision for tech-forward fashion, he founded TechR to bring together his passions for hacking, education, 
                                and style into one unified brand. From designing custom penetration testing devices like the Techack1 to creating 
                                STEM education kits and the Rithim clothing line, Ryan embodies the spirit of a modern maker and entrepreneur.
                            </p>
                            <div class="about-founder-links">
                                <a href="https://github.com/EfaTheOne" target="_blank" rel="noopener noreferrer" class="founder-social-link">
                                    <i data-lucide="github" style="width: 18px; height: 18px;"></i> GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="about-section reveal">
                    <h2>Our Story</h2>
                    <p>
                        TechR Innovations was born from a passion for hands-on technology and the belief that innovation should be accessible to everyone. 
                        What started as personal hardware hacking projects — building custom macropads, NFC hacking cards, and penetration testing 
                        devices — evolved into a full-fledged company spanning four distinct divisions. Ryan's journey from building his first 
                        Tech_Pad to creating the Techack1 Pro pentesting framework is the foundation of everything TechR stands for: curiosity, 
                        craftsmanship, and relentless innovation.
                    </p>
                </div>

                <div class="about-section reveal">
                    <h2>Our Mission</h2>
                    <p>
                        Our mission is to empower individuals and organizations with tools that make a real difference. Whether it's 
                        protecting digital infrastructure with Techack, inspiring the next generation of engineers with TechBox, 
                        expressing identity through Rithim clothing, or personalizing education with StudyTech AI — every product 
                        we create is designed to push boundaries and unlock potential.
                    </p>
                </div>

                <div class="about-divisions-grid reveal">
                    <h2 style="grid-column: 1 / -1; margin-bottom: 1rem;">Our Divisions</h2>
                    <div class="about-division-card" style="border-color: var(--color-techack);">
                        <i data-lucide="shield" style="width: 32px; height: 32px; color: var(--color-techack);"></i>
                        <h3 style="color: var(--color-techack);">Techack</h3>
                        <p>Enterprise-grade penetration testing hardware. From the Techack1 Pro to network probes, we build the tools security professionals trust.</p>
                    </div>
                    <div class="about-division-card" style="border-color: var(--color-techbox);">
                        <i data-lucide="box" style="width: 32px; height: 32px; color: var(--color-techbox);"></i>
                        <h3 style="color: var(--color-techbox);">TechBox</h3>
                        <p>STEM education kits that make learning electronics, coding, and robotics fun and accessible for students of all ages.</p>
                    </div>
                    <div class="about-division-card" style="border-color: var(--color-rithim);">
                        <i data-lucide="shirt" style="width: 32px; height: 32px; color: var(--color-rithim);"></i>
                        <h3 style="color: var(--color-rithim);">Rithim</h3>
                        <p>Premium streetwear and apparel that merges tech culture with bold fashion. Express your identity with style.</p>
                    </div>
                    <div class="about-division-card" style="border-color: var(--color-studytech);">
                        <i data-lucide="brain" style="width: 32px; height: 32px; color: var(--color-studytech);"></i>
                        <h3 style="color: var(--color-studytech);">StudyTech</h3>
                        <p>AI-powered adaptive learning that personalizes education at scale for students, parents, and institutions.</p>
                    </div>
                </div>

                <div class="about-section reveal">
                    <h2>Contact Us</h2>
                    <p>
                        We'd love to hear from you! Whether you have questions about our products, partnership inquiries, 
                        or just want to say hello, reach out to us.
                    </p>
                    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i data-lucide="mail" style="width: 20px; height: 20px; color: var(--accent);"></i>
                            <a href="mailto:contact@techr.com" style="color: var(--accent);">contact@techr.com</a>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i data-lucide="globe" style="width: 20px; height: 20px; color: var(--accent);"></i>
                            <span style="color: var(--text-secondary);">www.techr.com</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <i data-lucide="github" style="width: 20px; height: 20px; color: var(--accent);"></i>
                            <a href="https://github.com/EfaTheOne" target="_blank" rel="noopener noreferrer" style="color: var(--accent);">github.com/EfaTheOne</a>
                        </div>
                    </div>
                </div>

                <div class="cta-section reveal" style="margin-top: 2rem;">
                    <h2>Ready to Explore?</h2>
                    <p>Check out our divisions and discover what TechR has to offer.</p>
                    <a href="#techack" class="btn btn-primary btn-lg">Browse Products</a>
                </div>
            </div>
        `,

        // SUCCESS PAGE
        'success': () => `
            <div class="success-container reveal">
                <div class="success-icon">
                    <i data-lucide="check"></i>
                </div>
                <h1>Payment Successful!</h1>
                <p style="font-size: 1.1rem; margin: 1.5rem 0;">
                    Thank you for your order. You will receive a confirmation email shortly.
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                    <a href="#/" class="btn btn-primary">Return Home</a>
                    <a href="#techack" class="btn btn-secondary">Continue Shopping</a>
                </div>
            </div>
        `
    },

    init: () => {
        window.addEventListener('hashchange', Router.handleRoute);
    },

    handleRoute: async () => {
        const app = document.getElementById('app');
        const hash = window.location.hash.slice(1) || '/';
        let route;
        if (hash.startsWith('product/')) {
            route = Router.routes['product'];
        } else {
            route = Router.routes[hash] || Router.routes['/'];
        }

        // Scroll to top on route change
        window.scrollTo(0, 0);

        // Render content
        const content = await route();
        app.innerHTML = content;

        // Initialize icons
        if (window.lucide) {
            lucide.createIcons();
        }

        // Update cart UI
        Store.updateCartUI();

        // Initialize reveal animations
        Router.observeReveal();

        // Initialize checkout if on that page
        if (hash === 'checkout' && Store.cart.length > 0) {
            setTimeout(() => Router.initCheckout(), 100);
        }
    },

    observeReveal: () => {
        requestAnimationFrame(() => {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(e => { 
                    if (e.isIntersecting) {
                        e.target.classList.add('active');
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        });
    },

    handleLogin: async () => {
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;
        if (!email || !password) { Toast.error('Please enter email and password'); return; }
        try {
            if (!supabase) { Toast.error('Database connection unavailable'); return; }
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { Toast.error(error.message); return; }
            Toast.success('Welcome back!');
            window.location.hash = '#dashboard';
        } catch(e) { Toast.error('Login failed: ' + e.message); }
    },

    handleLogout: async () => {
        if (supabase) { await supabase.auth.signOut(); }
        Toast.info('Signed out');
        window.location.hash = '#admin';
    },

    initCheckout: async () => {
        const cardContainer = document.getElementById('card-element');
        const cardErrors = document.getElementById('card-errors');
        const payBtn = document.getElementById('pay-btn');
        
        if (!cardContainer || !payBtn) return;

        if (!window.Stripe) {
            logger.error("Stripe.js not loaded");
            document.getElementById('card-container').innerHTML = `<div class="alert-box alert-error"><i data-lucide="alert-triangle"></i><span>Payment SDK unavailable. Check your internet connection.</span></div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
            logger.log("Demo mode: Stripe publishable key not configured");
            document.getElementById('card-container').innerHTML = `
                <div style="background: var(--bg-tertiary); border: 2px dashed var(--border-glass); border-radius: 8px; padding: 2rem; text-align: center;">
                    <i data-lucide="credit-card" style="width: 32px; height: 32px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
                        Card input appears here once Stripe is configured.<br>
                        <span style="font-size: 0.8rem;">Set your publishable key in app.js (STRIPE_PUBLISHABLE_KEY)</span>
                    </p>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            
            // Demo mode - simulate payment
            payBtn.addEventListener('click', () => {
                PayButton.setLoading(payBtn);
                
                setTimeout(() => {
                    logger.log("Demo payment simulated successfully");
                    Toast.success("Payment successful! Thank you for your order.");
                    Store.clearCart();
                    window.location.hash = '#success';
                }, 2000);
            });
            return;
        }

        try {
            logger.log("Initializing Stripe Payments...");
            const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
            const elements = stripe.elements();
            
            const style = {
                base: {
                    color: '#ffffff',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': { color: '#86868b' }
                },
                invalid: {
                    color: '#ff453a',
                    iconColor: '#ff453a'
                }
            };

            const card = elements.create('card', { style });
            card.mount('#card-element');
            logger.log("Stripe card element mounted successfully");

            card.on('change', (event) => {
                if (cardErrors) {
                    cardErrors.textContent = event.error ? event.error.message : '';
                }
            });

            payBtn.addEventListener('click', async () => {
                PayButton.setLoading(payBtn);
                
                logger.log("Creating payment token...");
                const { token, error } = await stripe.createToken(card);
                
                if (error) {
                    logger.error(error.message);
                    if (cardErrors) cardErrors.textContent = error.message;
                    PayButton.setReady(payBtn, Store.getCartTotal());
                    Toast.error("Payment failed: " + error.message);
                } else {
                    logger.log(`Token received: ${token.id.substring(0, 20)}...`);
                    Toast.success("Payment successful! Thank you for your order.");
                    // In production, send token.id to your backend server to complete the charge
                    // Example: await fetch('/api/charge', { method: 'POST', body: JSON.stringify({ token: token.id, amount: Math.round(total * 100) }) })
                    // Note: Stripe expects amounts in the smallest currency unit (cents for USD)
                    Store.clearCart();
                    window.location.hash = '#success';
                }
            });
        } catch (e) {
            logger.error(`Stripe Exception: ${e.message}`);
            document.getElementById('card-container').innerHTML = `<div class="alert-box alert-error"><i data-lucide="alert-triangle"></i><span>${e.message}</span></div>`;
            if (window.lucide) lucide.createIcons();
        }
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await Store.init();
    Router.init();
    Router.handleRoute();
    Store.updateCartUI();
    initRealtimeSync();
    
    // Event delegation for all interactive elements
    document.addEventListener('click', (e) => {
        // Data-action buttons (admin dashboard, cart, etc.)
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            switch (action) {
                case 'add-product':
                    Admin.showAddModal();
                    break;
                case 'edit-product':
                    Admin.showEditModal(parseInt(actionBtn.dataset.productId));
                    break;
                case 'delete-product':
                    Admin.deleteProduct(parseInt(actionBtn.dataset.productId));
                    break;
                case 'refresh-products':
                    Admin.refreshProducts();
                    break;
                case 'logout':
                    Router.handleLogout();
                    break;
                case 'close-modal':
                    Admin.closeModal();
                    break;
                case 'save-settings':
                    const titleEl = document.getElementById('site-title');
                    const descEl = document.getElementById('site-desc');
                    const emailEl = document.getElementById('site-email');
                    if (titleEl) Admin.siteSettings.title = titleEl.value;
                    if (descEl) Admin.siteSettings.description = descEl.value;
                    if (emailEl) Admin.siteSettings.email = emailEl.value;
                    Toast.success('Site settings saved!');
                    break;
                case 'reset-defaults':
                    if (confirm('Reset all products to the original 12 defaults? This will remove any products you have added or changes you have made.')) {
                        Store.resetToDefaults();
                    }
                    break;
                case 'clear-cart':
                    Store.clearCart();
                    Router.handleRoute();
                    break;
                case 'update-qty':
                    Store.updateQuantity(parseFloat(actionBtn.dataset.cartId), parseInt(actionBtn.dataset.delta));
                    break;
                case 'switch-image':
                    const imgSrc = actionBtn.dataset.imgSrc;
                    const mainImg = document.getElementById('product-main-img');
                    if (mainImg && imgSrc) {
                        mainImg.src = imgSrc;
                        document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
                        actionBtn.classList.add('active');
                    }
                    break;
            }
            return;
        }

        // Add to cart button
        const addBtn = e.target.closest('.add-to-cart-btn');
        if (addBtn) {
            const productId = parseInt(addBtn.dataset.productId);
            if (productId) {
                Store.addToCart(productId);
            }
            return;
        }
        
        // Remove from cart button
        const removeBtn = e.target.closest('.remove-from-cart-btn');
        if (removeBtn) {
            const cartId = parseFloat(removeBtn.dataset.cartId);
            if (cartId) {
                Store.removeFromCart(cartId);
            }
            return;
        }
        
        // Mobile menu toggle
        const mobileMenuBtn = e.target.closest('.mobile-menu-btn');
        if (mobileMenuBtn) {
            toggleMobileMenu();
            return;
        }

        // Mobile nav link - close menu on click
        const mobileNavLink = e.target.closest('.mobile-nav-link');
        if (mobileNavLink) {
            toggleMobileMenu();
            return;
        }

        // Color swatch click
        const colorSwatch = e.target.closest('.color-swatch');
        if (colorSwatch) {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            colorSwatch.classList.add('active');
            return;
        }

        // Remove additional image in admin modal
        const removeImgBtn = e.target.closest('.remove-additional-img');
        if (removeImgBtn) {
            const idx = parseInt(removeImgBtn.dataset.imgIndex);
            Admin.pendingImages.splice(idx, 1);
            Admin.renderAdditionalPreviews();
            return;
        }
    });
    
    // Event delegation for input/change events (search, filter, image preview)
    document.addEventListener('input', (e) => {
        if (e.target.id === 'admin-search') {
            Admin.filterSearch = e.target.value;
            Router.handleRoute();
        }
        if (e.target.id === 'product-image') {
            Admin.previewImage(e.target.value);
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'admin-category-filter') {
            Admin.filterCategory = e.target.value;
            Router.handleRoute();
        }
        if (e.target.id === 'product-image-file') {
            Admin.handleFileUpload(e.target.files);
        }
        if (e.target.id === 'product-additional-images') {
            Admin.handleAdditionalImages(e.target.files);
        }
    });
    
    // Form submission handler for login and product forms
    document.addEventListener('submit', (e) => {
        const loginForm = e.target.closest('#login-form');
        if (loginForm) {
            e.preventDefault();
            Router.handleLogin();
            return;
        }
        const productForm = e.target.closest('#product-form');
        if (productForm) {
            e.preventDefault();
            Admin.saveProduct();
            return;
        }
        if (e.target.closest('.auth-form')) {
            e.preventDefault();
            Router.handleLogin();
        }
    });
    
    console.log("[TechR] Application initialized");
});

