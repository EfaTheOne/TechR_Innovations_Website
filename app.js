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
    updateCartCount: () => {
        const btn = document.getElementById('cart-count');
        if (btn) btn.textContent = Store.cart.length;
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
                    <a href="#admin">Login</a>
                    <a href="#checkout" class="btn btn-primary btn-sm">
                        Checkout (<span id="cart-count">${Store.cart.length}</span>)
                    </a>
                </div>
            </div>
        </nav>
    `,

    ProductCard: (p) => `
        <div class="product-card reveal">
            <img src="${p.image}" class="product-img" alt="${p.name}">
            <div class="product-content">
                <h3>${p.name}</h3>
                <p style="font-size: 0.9rem; margin-bottom: 1rem;">${p.desc}</p>
                <div class="product-meta">
                    <span class="price">$${p.price}</span>
                    <button class="btn btn-secondary" onclick="Store.addToCart(${p.id})" data-id="${p.id}">Add to Cart</button>
                </div>
            </div>
        </div>
    `
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
        }
    }, // End Routes

    init: () => {
        window.addEventListener('hashchange', Router.handleRoute);
        Router.handleRoute();
    },

    handleRoute: async () => {
        const app = document.getElementById('app');
        const hash = window.location.hash.slice(1) || '/';
        const route = Router.routes[hash] || Router.routes['/'];

        app.innerHTML = Components.Header();
        app.innerHTML += await route();

        if (window.lucide) lucide.createIcons();
        Router.observeReveal();

        if (hash === 'checkout' && Store.cart.length > 0) {
            Router.initCheckout(); // Explicit init
        }
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

document.addEventListener('DOMContentLoaded', () => {
    Store.init();
    Router.init();
});
