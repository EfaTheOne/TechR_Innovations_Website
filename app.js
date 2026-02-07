/* 
   TechR Innovations - Protocol: PHOENIX 
   Core Engine: Supabase Connected, Environment Aware
*/

// --- CONFIGURATION ---
// REPLACE THESE WITH YOUR SUPABASE CREDENTIALS AFTER CREATING PROJECT
const SUPABASE_URL = 'https://vmgiylwrpknufdddwcbw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xLh_U2MxD-UatsepDCDAUg_9pix1V4f';
const SQUARE_APP_ID = 'sandbox-sq0idb-baAQrwCn8BjaayFVRoDUJA';
const SQUARE_LOC_ID = 'LHWBP0QGBDD1G'; // Sandbox Location

// Initialize Clients
let supabase;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase Client Initialized");
    } else {
        console.warn("Supabase SDK not loaded.");
    }
} catch (e) {
    console.warn("Supabase Config Missing. Admin features strictly disabled.");
}

// --- UTILS ---
const sanitize = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

// --- AUTH MODULE ---
const Auth = {
    user: null,
    init: async () => {
        if (!supabase) return;
        const { data } = await supabase.auth.getSession();
        Auth.user = data.session?.user || null;

        supabase.auth.onAuthStateChange((_event, session) => {
            Auth.user = session?.user || null;
            Router.handleRoute(); // Re-render to update UI
        });
    },
    signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    },
    signOut: async () => {
        await supabase.auth.signOut();
    },
    updateCartCount: () => {
        const btn = document.getElementById('cart-count');
        if (btn) btn.textContent = Store.cart.length;
    }
};

// --- DATA STORE ---
const Store = {
    products: [],
    cart: [],

    init: async () => {
        // Hydrate Cart
        const savedCart = localStorage.getItem('techr_cart');
        if (savedCart) Store.cart = JSON.parse(savedCart);

        // Fetch Products
        await Store.fetchProducts();

        // Initial Render
        Router.handleRoute();
    },

    fetchProducts: async () => {
        if (!supabase || SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
            // Fallback for Demo Mode (No DB yet)
            Store.products = [
                { id: 1, name: "Techack1", price: 299.99, image: "https://images.unsplash.com/photo-1563770095162-95f88954dbd3?w=800&q=80", category: "techack", desc: "Portable Pen-Testing Unit" },
                { id: 2, name: "TechBox Starter", price: 49.99, image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", category: "techbox", desc: "STEM Learning Kit" },
                { id: 3, name: "Rithim Band", price: 149.99, image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=800&q=80", category: "rithim", desc: "Biofeedback Recovery Wearable" },
                { id: 4, name: "StudyTech Stick", price: 29.99, image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", category: "studytech", desc: "Offline AI Accelerator" }
            ];
            return;
        }

        const { data, error } = await supabase.from('products').select('*');
        if (!error && data) {
            Store.products = data;
        }
    },

    addToCart: (id) => {
        const product = Store.products.find(p => p.id === id);
        if (product) {
            Store.cart.push(product);
            localStorage.setItem('techr_cart', JSON.stringify(Store.cart));
            Auth.updateCartCount();
        }
    },

    removeFromCart: (index) => {
        Store.cart.splice(index, 1);
        localStorage.setItem('techr_cart', JSON.stringify(Store.cart));
        Router.handleRoute(); // Re-render checkout
    },

    clearCart: () => {
        Store.cart = [];
        localStorage.removeItem('techr_cart');
    }
};

// --- COMPONENT FACTORY ---
const Components = {
    Header: () => `
        <nav class="nav-bar">
            <div class="brand">TechR<span style="color:var(--text-secondary)">Innovations</span></div>
            <div class="nav-links">
                <a href="#/">Home</a>
                <a href="#techack">Techack</a>
                <a href="#techbox">TechBox</a>
                <a href="#admin">Admin</a>
                <a href="#checkout" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.8rem;">
                    Cart (<span id="cart-count">${Store.cart.length}</span>)
                </a>
            </div>
            <button class="mobile-menu-btn" onclick="window.toggleMobileMenu()">☰</button>
        </nav>
        <div id="mobile-menu" class="mobile-nav hidden" style="position:fixed; top:70px; right:20px; background:#111; padding:1rem; border-radius:12px; z-index:999; border:1px solid #333;">
            <a href="#/" style="display:block; padding:0.5rem; color:white;">Home</a>
            <a href="#techack" style="display:block; padding:0.5rem; color:white;">Techack</a>
            <a href="#techbox" style="display:block; padding:0.5rem; color:white;">TechBox</a>
            <a href="#admin" style="display:block; padding:0.5rem; color:white;">Admin</a>
            <a href="#checkout" style="display:block; padding:0.5rem; color:white;">Checkout</a>
        </div>
    `,

    LoginScreen: () => `
        <div class="login-overlay">
            <div class="login-box glass-panel">
                <h2>Admin Access</h2>
                <p style="margin-bottom: 2rem;">Authenticating with Supabase.</p>
                <form id="login-form">
                    <input type="email" id="email" class="input-field" placeholder="admin@techr.com" required>
                    <input type="password" id="password" class="input-field" placeholder="••••••••" required>
                    <button type="submit" class="btn btn-primary" style="width:100%">Sign In</button>
                    <div id="login-error" style="color: var(--danger); margin-top: 1rem;"></div>
                </form>
            </div>
        </div>
    `,

    ProductGrid: (category) => {
        const items = Store.products.filter(p => p.category === category);
        return `
            <div class="product-grid">
                ${items.map(p => `
                    <div class="product-item reveal">
                        <img src="${sanitize(p.image)}" alt="${sanitize(p.name)}">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h3 style="font-size:1.2rem; margin:0;">${sanitize(p.name)}</h3>
                                <div style="color:var(--text-secondary);">$${p.price}</div>
                            </div>
                            <button onclick="Store.addToCart(${p.id})" class="btn btn-outline" style="padding:0.5rem 1rem;">
                                Add
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// --- ROUTER ---
const Router = {
    routes: {
        '/': () => `
            <section class="fullscreen-section">
                <h1 class="reveal">The Future.<br><span style="color:var(--text-secondary)">Unboxed.</span></h1>
                <p class="reveal" style="margin-top: 2rem;">Pioneering the intersection of Hardware, Education, and Recovery.</p>
                <div class="reveal" style="margin-top: 3rem; display:flex; gap:1rem; justify-content:center;">
                    <a href="#techack" class="btn btn-primary">Discover Techack1</a>
                    <a href="#techbox" class="btn btn-outline">Explore STEM</a>
                </div>
            </section>
            
            <section class="container">
                <div class="bento-grid">
                    <a href="#techack" class="bento-card reveal">
                        <i data-lucide="shield" size="40" color="var(--color-techack)"></i>
                        <h3>Techack</h3>
                        <p>Advanced penetration testing hardware for the modern era.</p>
                    </a>
                    <a href="#techbox" class="bento-card reveal">
                        <i data-lucide="box" size="40" color="var(--color-techbox)"></i>
                        <h3>TechBox</h3>
                        <p>Curiosity delivered. STEM education kits for all ages.</p>
                    </a>
                    <a href="#rithim" class="bento-card reveal">
                        <i data-lucide="heart" size="40" color="var(--color-rithim)"></i>
                        <h3>Rithim</h3>
                        <p>Recovery reimagined through proprietary wearable tech.</p>
                    </a>
                </div>
            </section>
        `,
        'techack': () => `
            <div class="container" style="padding-top: 6rem;">
                <h1 class="reveal" style="font-size:8rem; color:var(--color-techack);">TECHACK<span style="color:white">1</span></h1>
                <p class="reveal">The ultimate portable penetration testing framework.</p>
                ${Components.ProductGrid('techack')}
            </div>
        `,
        'techbox': () => `
            <div class="container" style="padding-top: 6rem;">
                <h1 class="reveal" style="color:var(--color-techbox);">TechBox</h1>
                <p class="reveal">Unbox your potential.</p>
                ${Components.ProductGrid('techbox')}
            </div>
        `,
        'rithim': () => `
            <div class="container" style="padding-top: 6rem;">
                <h1 class="reveal" style="color:var(--color-rithim);">Rithim</h1>
                <p class="reveal">Recovery Redefined.</p>
                ${Components.ProductGrid('rithim')}
            </div>
        `,
        'admin': () => {
            if (!Auth.user) return Components.LoginScreen();

            // Authenticated Admin Dashboard
            return `
                <div class="container" style="padding-top: 8rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3rem;">
                        <h1>Command Center</h1>
                        <button onclick="Auth.signOut()" class="btn btn-outline">Sign Out</button>
                    </div>
                    <div class="bento-card reveal">
                        <h3>Inventory Database</h3>
                        <p>Connected to Supabase Cloud.</p>
                        <!-- CRUD Table would go here in V2 -->
                        <div style="margin-top:2rem; padding:1rem; background:#111; border-radius:8px; font-family:monospace;">
                            User: ${Auth.user.email}<br>
                            Role: Authenticated<br>
                            Status: ${SUPABASE_URL.includes('YOUR_PROJECT') ? 'DEMO MODE (No DB)' : 'Connected'}
                        </div>
                    </div>
                </div>
            `;
        },
        'checkout': async () => {
            const isSecure = window.location.protocol === 'https:';

            if (!isSecure) {
                setTimeout(() => {
                    const warning = document.getElementById('checkout-warning');
                    if (warning) warning.innerHTML = `
                        <div style="background:var(--danger); color:white; padding:1rem; border-radius:8px; text-align:center; margin-bottom:2rem;">
                            <strong>Security Alert:</strong> You are viewing this on Localhost/File.<br>
                            Real Payments are disabled. Deploy to GitHub Pages (HTTPS) to activate Square.
                        </div>
                    `;
                }, 100);
            }

            return `
                <div class="container" style="padding-top: 8rem; max-width:600px;">
                    <h2>Secure Checkout</h2>
                    <div id="checkout-warning"></div>
                    
                    ${Store.cart.length === 0 ? '<p>Your cart is empty.</p>' : `
                        <div class="bento-card" style="margin-bottom:2rem;">
                            ${Store.cart.map(item => `
                                <div style="display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px solid #333;">
                                    <span>${item.name}</span>
                                    <span>$${item.price}</span>
                                </div>
                            `).join('')}
                            <div style="margin-top:1rem; text-align:right; font-weight:bold; font-size:1.5rem;">
                                Total: $${Store.cart.reduce((a, b) => a + parseFloat(b.price), 0).toFixed(2)}
                            </div>
                        </div>

                        <div class="bento-card">
                            <h3 style="margin-bottom:1.5rem;">Payment Method</h3>
                            <form id="payment-form">
                                <div id="card-container" style="min-height: 100px; background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"></div>
                                <button id="card-button" type="submit" class="btn btn-primary" style="width:100%">Pay Now</button>
                            </form>
                            <div id="payment-status"></div>
                        </div>
                    `}
                </div>
            `;
        }
    },

    init: () => {
        window.addEventListener('hashchange', Router.handleRoute);
        Router.handleRoute();
    },

    handleRoute: async () => {
        const app = document.getElementById('app');
        const hash = window.location.hash.slice(1) || '/';
        const route = Router.routes[hash] || Router.routes['/'];

        // Render Header & Content
        app.innerHTML = Components.Header();
        const content = typeof route === 'function' ? await route() : route;
        app.innerHTML += content;

        // Initialize Icons & Observers
        if (window.lucide) lucide.createIcons();
        Router.observeReveal();

        // Attach Event Listeners
        Router.attachListeners(hash);
    },

    observeReveal: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    },

    attachListeners: async (hash) => {
        // Login Logic
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = loginForm.querySelector('button');
                const err = document.getElementById('login-error');
                btn.textContent = "Verifying...";
                try {
                    await Auth.signIn(
                        document.getElementById('email').value,
                        document.getElementById('password').value
                    );
                } catch (e) {
                    err.textContent = "Access Denied: " + e.message;
                    btn.textContent = "Sign In";
                }
            });
        }

        // Square Logic (Checkout)
        if (hash === 'checkout' && Store.cart.length > 0) {
            if (window.Square && window.location.protocol === 'https:') {
                try {
                    const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOC_ID);
                    const card = await payments.card();
                    await card.attach('#card-container');

                    document.getElementById('payment-form').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const status = document.getElementById('payment-status');
                        status.textContent = "Processing Securely...";

                        const result = await card.tokenize();
                        if (result.status === 'OK') {
                            Store.clearCart();
                            const app = document.getElementById('app');
                            app.innerHTML = Components.Header() + `
                                <div class="container fullscreen-section">
                                    <i data-lucide="check-circle" size="80" color="#34c759"></i>
                                    <h1 style="margin-top:1rem;">Order Confirmed.</h1>
                                    <p>Token: ${result.token.slice(0, 10)}...</p>
                                    <a href="#/" class="btn btn-primary" style="margin-top:2rem;">Return Home</a>
                                </div>
                            `;
                            if (window.lucide) lucide.createIcons();
                        } else {
                            status.textContent = "Payment Failed: " + result.errors[0].message;
                        }
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
};

// --- BOOTSTRAP ---
document.addEventListener('DOMContentLoaded', async () => {
    // Utility for mobile menu
    window.toggleMobileMenu = () => {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    };

    await Auth.init();
    await Store.init();
    Router.init();
});
