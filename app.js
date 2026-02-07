/* 
   TechR Innovations - Protocol: STRUCTURE v10.0
   Engine: Professional, Debuggable, Secure
*/

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://vmgiylwrpknufdddwcbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xLh_U2MxD-UatsepDCDAUg_9pix1V4f';
const SQUARE_APP_ID = 'sandbox-sq0idb-baAQrwCn8BjaayFVRoDUJA';
const SQUARE_LOC_ID = 'LHWBP0QGBDD1G';

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

// --- STORE & STATE ---
const Store = {
    products: [],
    cart: [],

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
                    return;
                }
            }
        } catch (e) { 
            console.warn("[TechR] Database unavailable, using fallback inventory");
        }

        // Comprehensive Fallback Inventory
        Store.products = [
            // Techack Products
            { id: 1, name: "Techack1 Pro", price: 499.99, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", category: "techack", desc: "Enterprise-grade portable pentesting framework with WiFi 6 and Bluetooth 5.2 capabilities." },
            { id: 2, name: "Techack1 Lite", price: 299.99, image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80", category: "techack", desc: "Compact security testing device for educational and professional use." },
            { id: 3, name: "Techack Network Probe", price: 149.99, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80", category: "techack", desc: "Passive network analysis tool with real-time packet inspection." },
            
            // TechBox Products
            { id: 4, name: "TechBox Starter Kit", price: 79.99, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80", category: "techbox", desc: "Complete STEM electronics kit with Arduino-compatible microcontroller and 50+ components." },
            { id: 5, name: "TechBox Advanced", price: 149.99, image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80", category: "techbox", desc: "Advanced robotics and IoT development platform with sensor arrays." },
            { id: 6, name: "TechBox Classroom (10-Pack)", price: 599.99, image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=800&q=80", category: "techbox", desc: "Bulk educational kit package for schools and coding bootcamps." },
            
            // Rithim Products
            { id: 7, name: "Rithim Band", price: 199.99, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80", category: "rithim", desc: "Clinical-grade biosensor wristband for 24/7 recovery monitoring." },
            { id: 8, name: "Rithim Pro Patch", price: 89.99, image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80", category: "rithim", desc: "Disposable medical-grade monitoring patch (pack of 10) for intensive recovery tracking." },
            { id: 9, name: "Rithim Hub", price: 299.99, image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", category: "rithim", desc: "Central monitoring station for healthcare providers and recovery facilities." },

            // StudyTech Products
            { id: 10, name: "StudyTech AI Tutor - Monthly", price: 19.99, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", category: "studytech", desc: "AI-powered personalized learning assistant with adaptive curriculum." },
            { id: 11, name: "StudyTech AI Tutor - Annual", price: 149.99, image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80", category: "studytech", desc: "Full year of AI tutoring with advanced analytics and progress tracking." },
            { id: 12, name: "StudyTech Enterprise", price: 999.99, image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&q=80", category: "studytech", desc: "Enterprise learning platform license for up to 100 students." }
        ];
    },

    getProductsByCategory: (category) => {
        return Store.products.filter(p => p.category === category);
    },

    addToCart: (id) => {
        const product = Store.products.find(p => p.id === id);
        if (product) {
            Store.cart.push({...product, cartId: Date.now() + Math.random()});
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

    clearCart: () => {
        Store.cart = [];
        Store.persist();
        Store.updateCartUI();
    },

    getCartTotal: () => {
        return Store.cart.reduce((sum, item) => sum + parseFloat(item.price), 0).toFixed(2);
    },

    persist: () => {
        localStorage.setItem('techr_cart_v3', JSON.stringify(Store.cart));
    },

    updateCartUI: () => {
        const badge = document.getElementById('cart-badge');
        const cartCount = document.getElementById('cart-count');
        
        if (badge) {
            if (Store.cart.length > 0) {
                badge.textContent = Store.cart.length;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
        
        if (cartCount) {
            cartCount.textContent = Store.cart.length;
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
    showAddModal: () => {
        document.getElementById('modal-title').textContent = 'Add Product';
        document.getElementById('product-edit-id').value = '';
        document.getElementById('product-form').reset();
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
        document.getElementById('product-modal').style.display = 'flex';
        if (window.lucide) lucide.createIcons();
    },

    closeModal: () => {
        document.getElementById('product-modal').style.display = 'none';
    },

    saveProduct: async () => {
        const editId = document.getElementById('product-edit-id').value;
        const productData = {
            name: document.getElementById('product-name').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            image: document.getElementById('product-image').value,
            desc: document.getElementById('product-desc').value
        };

        try {
            if (supabase) {
                if (editId) {
                    const { error } = await supabase.from('products').update(productData).eq('id', parseInt(editId));
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('products').insert([productData]);
                    if (error) throw error;
                }
            } else {
                // Fallback: local only
                if (editId) {
                    const idx = Store.products.findIndex(p => p.id === parseInt(editId));
                    if (idx !== -1) Store.products[idx] = { ...Store.products[idx], ...productData };
                } else {
                    productData.id = Date.now() + Math.floor(Math.random() * 1000);
                    Store.products.push(productData);
                }
            }
            await Store.fetchProducts();
            Admin.closeModal();
            Toast.success(editId ? 'Product updated!' : 'Product added!');
            Router.handleRoute();
        } catch(e) {
            Toast.error('Save failed: ' + e.message);
        }
    },

    deleteProduct: async (id) => {
        if (!confirm('Delete this product?')) return;
        try {
            if (supabase) {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
            } else {
                Store.products = Store.products.filter(p => p.id !== id);
            }
            await Store.fetchProducts();
            Toast.success('Product deleted');
            Router.handleRoute();
        } catch(e) {
            Toast.error('Delete failed: ' + e.message);
        }
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
                <img src="${item.image}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: var(--bg-tertiary);" alt="${item.name}">
                <div>
                    <strong>${item.name}</strong>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0; text-transform: capitalize;">${item.category}</p>
                </div>
            </div>
            <div class="cart-item-actions">
                <span class="price">$${parseFloat(item.price).toFixed(2)}</span>
                <button class="remove-btn remove-from-cart-btn" data-cart-id="${item.cartId}" title="Remove item">
                    <i data-lucide="x" style="width: 18px; height: 18px;"></i>
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
                    TechR Innovations delivers enterprise-grade hardware and software solutions for cybersecurity, education, healthcare recovery, and AI-powered learning.
                </p>
                <div class="reveal" style="margin-top: 2.5rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <a href="#techack" class="btn btn-primary btn-lg">Explore Products</a>
                    <a href="#checkout" class="btn btn-secondary btn-lg">View Cart (${Store.cart.length})</a>
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
                            <i data-lucide="heart" style="color: var(--color-rithim);"></i>
                        </div>
                        <h3 style="color: var(--color-rithim);">Rithim Bio</h3>
                        <p>Clinical-grade biosensors for real-time physiological and recovery monitoring.</p>
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

        // RITHIM RECOVERY DIVISION
        'rithim': () => {
            const products = Store.getProductsByCategory('rithim');
            return `
                <div class="division-hero container">
                    <div class="division-header reveal">
                        <span class="badge badge-rithim">Recovery Division</span>
                        <h1 style="color: var(--color-rithim);">Rithim</h1>
                        <p>Clinical-grade biosensors for continuous health and recovery monitoring.</p>
                    </div>

                    <div class="features-grid">
                        ${Components.FeatureCard('heart-pulse', 'Real-Time Monitoring', '24/7 physiological tracking with instant alerts.', 'color-rithim')}
                        ${Components.FeatureCard('activity', 'Recovery Analytics', 'AI-powered insights to optimize recovery protocols.', 'color-rithim')}
                        ${Components.FeatureCard('shield-plus', 'HIPAA Compliant', 'Healthcare-grade data protection and privacy.', 'color-rithim')}
                        ${Components.FeatureCard('smartphone', 'Mobile Integration', 'Seamless sync with iOS and Android devices.', 'color-rithim')}
                    </div>

                    <h2 class="reveal" style="margin-top: 4rem;">Rithim Products</h2>
                    <div class="product-grid" style="margin-top: 2rem;">
                        ${products.map(p => Components.ProductCard(p)).join('')}
                    </div>

                    <div class="card reveal" style="margin-top: 4rem; text-align: center; padding: 3rem;">
                        <i data-lucide="stethoscope" style="width: 48px; height: 48px; color: var(--color-rithim); margin-bottom: 1rem;"></i>
                        <h3>For Healthcare Providers</h3>
                        <p style="max-width: 500px; margin: 1rem auto;">
                            Rithim devices are designed for integration with existing healthcare systems. 
                            Contact us for API documentation and enterprise solutions.
                        </p>
                        <a href="#admin" class="btn btn-primary" style="margin-top: 1rem;">Healthcare Inquiry</a>
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
                    
                    <form onsubmit="event.preventDefault(); Router.handleLogin();">
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
            const products = Store.products;
            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem); padding-bottom: 4rem;">
                    <div class="dashboard-header reveal">
                        <div>
                            <h1 style="font-size: 2.5rem;">Admin Dashboard</h1>
                            <p>Manage products and inventory</p>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <button class="btn btn-primary" onclick="Admin.showAddModal()">
                                <i data-lucide="plus" style="width: 18px; height: 18px;"></i> Add Product
                            </button>
                            <button class="btn btn-secondary" onclick="Router.handleLogout()">
                                <i data-lucide="log-out" style="width: 18px; height: 18px;"></i> Sign Out
                            </button>
                        </div>
                    </div>

                    <div class="admin-stats reveal">
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">${products.length}</div>
                            <div class="admin-stat-label">Total Products</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">${[...new Set(products.map(p => p.category))].length}</div>
                            <div class="admin-stat-label">Categories</div>
                        </div>
                        <div class="admin-stat-card">
                            <div class="admin-stat-value">$${products.reduce((sum, p) => sum + p.price, 0).toFixed(0)}</div>
                            <div class="admin-stat-label">Total Value</div>
                        </div>
                    </div>

                    <div class="admin-products-grid reveal">
                        ${products.map(p => `
                            <div class="admin-product-card">
                                <img src="${p.image}" alt="${p.name}" class="admin-product-img">
                                <div class="admin-product-info">
                                    <h3>${p.name}</h3>
                                    <span class="badge badge-${p.category}" style="font-size: 0.75rem; padding: 0.25rem 0.75rem;">${p.category}</span>
                                    <p class="admin-product-price">$${p.price.toFixed(2)}</p>
                                </div>
                                <div class="admin-product-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="Admin.showEditModal(${p.id})">
                                        <i data-lucide="edit-2" style="width: 14px; height: 14px;"></i> Edit
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="Admin.deleteProduct(${p.id})">
                                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Product Modal -->
                <div id="product-modal" class="modal-overlay" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modal-title">Add Product</h2>
                            <button class="modal-close" onclick="Admin.closeModal()">
                                <i data-lucide="x" style="width: 24px; height: 24px;"></i>
                            </button>
                        </div>
                        <form id="product-form" onsubmit="event.preventDefault(); Admin.saveProduct();">
                            <input type="hidden" id="product-edit-id">
                            <div class="form-group">
                                <label for="product-name">Product Name</label>
                                <input type="text" id="product-name" placeholder="Product name" required>
                            </div>
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
                            <div class="form-group">
                                <label for="product-image">Image URL</label>
                                <input type="url" id="product-image" placeholder="https://images.unsplash.com/..." required>
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
            
            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem); padding-bottom: 4rem;">
                    <a href="#${product.category}" class="btn btn-secondary btn-sm reveal" style="margin-bottom: 2rem;">
                        <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to ${product.category}
                    </a>
                    
                    <div class="product-detail reveal">
                        <div class="product-detail-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-detail-info">
                            <span class="badge badge-${product.category}">${product.category}</span>
                            <h1 style="font-size: 2.5rem; margin: 1rem 0 0.5rem;">${product.name}</h1>
                            <p style="font-size: 1.1rem; line-height: 1.8; margin-bottom: 2rem;">${product.desc}</p>
                            <div class="price" style="font-size: 2.5rem; margin-bottom: 2rem;">$${product.price.toFixed(2)}</div>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
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
                            <h2 class="reveal">Related Products</h2>
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
            const isSecure = window.location.protocol === 'https:';
            const total = Store.getCartTotal();
            
            let alertHtml = '';
            if (!isSecure) {
                alertHtml = `
                    <div class="alert-box alert-info">
                        <i data-lucide="info"></i>
                        <div>
                            <strong>Demo Mode Active</strong><br>
                            Payments require HTTPS. Deploy to production or use GitHub Pages to enable live payments.
                        </div>
                    </div>
                `;
            }

            if (Store.cart.length === 0) {
                return `
                    <div class="container" style="padding-top: calc(var(--header-height) + 4rem);">
                        <div class="checkout-container">
                            <div class="card reveal" style="text-align: center; padding: 4rem 2rem;">
                                <i data-lucide="shopping-cart" style="width: 64px; height: 64px; color: var(--text-secondary); margin-bottom: 1.5rem;"></i>
                                <h2 style="margin-bottom: 1rem;">Your Cart is Empty</h2>
                                <p style="margin-bottom: 2rem;">Looks like you haven't added any products yet.</p>
                                <a href="#techack" class="btn btn-primary">Browse Products</a>
                            </div>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="container" style="padding-top: calc(var(--header-height) + 3rem);">
                    <div class="checkout-container">
                        <h2 class="reveal" style="margin-bottom: 2rem;">Secure Checkout</h2>
                        ${alertHtml}
                        
                        <div class="card reveal" style="margin-bottom: 2rem;">
                            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="shopping-bag" style="width: 20px; height: 20px;"></i>
                                Order Summary
                            </h3>
                            ${Store.cart.map((item, i) => Components.CartItem(item, i)).join('')}
                            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid var(--border-glass); display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 1.1rem;">Total</span>
                                <span class="price" style="font-size: 1.5rem;">$${total}</span>
                            </div>
                        </div>

                        <div class="card reveal">
                            <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i data-lucide="credit-card" style="width: 20px; height: 20px;"></i>
                                Payment Details
                            </h3>
                            <div id="card-container"></div>
                            <button id="pay-btn" class="btn btn-primary btn-lg" style="width: 100%;">
                                <i data-lucide="lock" style="width: 18px; height: 18px;"></i>
                                Pay $${total}
                            </button>
                            <p style="text-align: center; font-size: 0.8rem; color: var(--text-secondary); margin-top: 1rem;">
                                <i data-lucide="shield-check" style="width: 14px; height: 14px; display: inline; vertical-align: middle;"></i>
                                Payments secured by Square
                            </p>
                        </div>
                        
                        <details style="margin-top: 2rem;" class="reveal">
                            <summary style="cursor: pointer; color: var(--text-secondary); font-size: 0.9rem;">Developer Console</summary>
                            <pre id="debug-log" class="debug-log" style="margin-top: 1rem;">Awaiting payment initialization...</pre>
                        </details>
                    </div>
                </div>
            `;
        },

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
        const cardContainer = document.getElementById('card-container');
        const payBtn = document.getElementById('pay-btn');
        
        if (!cardContainer || !payBtn) return;

        if (!window.Square) {
            logger.error("Square SDK not loaded");
            cardContainer.innerHTML = `<div class="alert-box alert-error"><i data-lucide="alert-triangle"></i><span>Payment SDK unavailable</span></div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        if (window.location.protocol !== 'https:') {
            logger.log("Demo mode: HTTPS required for live payments");
            cardContainer.innerHTML = `
                <div style="background: var(--bg-tertiary); border: 2px dashed var(--border-glass); border-radius: 8px; padding: 2rem; text-align: center;">
                    <i data-lucide="credit-card" style="width: 32px; height: 32px; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
                        Card input appears here in production (HTTPS required)
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
            logger.log("Initializing Square Payments...");
            const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOC_ID);
            const card = await payments.card();
            await card.attach('#card-container');
            logger.log("Card element attached successfully");

            payBtn.addEventListener('click', async () => {
                PayButton.setLoading(payBtn);
                
                logger.log("Tokenizing card...");
                const result = await card.tokenize();
                
                if (result.status === 'OK') {
                    logger.log(`Token received: ${result.token.substring(0, 20)}...`);
                    Toast.success("Payment successful! Thank you for your order.");
                    // In production, send token to backend to complete payment
                    Store.clearCart();
                    window.location.hash = '#success';
                } else {
                    logger.error(result.errors[0].message);
                    PayButton.setReady(payBtn, Store.getCartTotal());
                    Toast.error("Payment failed: " + result.errors[0].message);
                }
            });
        } catch (e) {
            logger.error(`Square Exception: ${e.message}`);
            cardContainer.innerHTML = `<div class="alert-box alert-error"><i data-lucide="alert-triangle"></i><span>${e.message}</span></div>`;
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
    
    // Event delegation for add to cart buttons
    document.addEventListener('click', (e) => {
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
            const cartId = parseInt(removeBtn.dataset.cartId);
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
    });
    
    // Form submission handler for login
    document.addEventListener('submit', (e) => {
        if (e.target.closest('.auth-form')) {
            e.preventDefault();
            Router.handleLogin();
        }
    });
    
    console.log("[TechR] Application initialized");
});
