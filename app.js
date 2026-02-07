/**
 * TechR Innovations - Core Engine (v9.1 UNCHAINED)
 * A dependency-free, high-performance SPA router and state manager.
 */

// Security: XSS Sanitization
const sanitize = (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

/* --- STATE MANAGEMENT (The "Brain") --- */
const Store = {
    products: [],
    cart: [],

    init() {
        // Load products from local storage or set defaults
        const savedProducts = localStorage.getItem('techr_products');
        if (savedProducts) {
            this.products = JSON.parse(savedProducts);
        } else {
            this.products = [
                {
                    id: 1,
                    name: "Techack1",
                    price: 299.99,
                    category: "techack",
                    desc: "Portable multi-tool for penetration testing. CC1101, Wi-Fi, BT, HID.",
                    image: "https://images.unsplash.com/photo-1563770095162-95f88954dbd3?w=800&q=80"
                },
                {
                    id: 2,
                    name: "TechBox Starter Kit",
                    price: 49.99,
                    category: "techbox",
                    desc: "Learn electronics and coding with this beginner-friendly kit.",
                    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&q=80"
                },
                {
                    id: 3,
                    name: "Rithim Recovery Hoodie",
                    price: 89.00,
                    category: "rithim",
                    desc: "Ultra-soft, sustainable fabric designed for comfort and recovery.",
                    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
                },
                {
                    id: 4,
                    name: "StudyTech AI Assistant",
                    price: 199.50,
                    category: "studytech",
                    desc: "Offline AI device for generating personalized study materials.",
                    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80"
                }
            ];
            this.saveProducts();
        }

        // Load cart
        const savedCart = localStorage.getItem('techr_cart');
        if (savedCart) this.cart = JSON.parse(savedCart);

        this.updateCartUI();
    },

    saveProducts() {
        localStorage.setItem('techr_products', JSON.stringify(this.products));
    },

    saveCart() {
        localStorage.setItem('techr_cart', JSON.stringify(this.cart));
        this.updateCartUI();
    },

    addProduct(product) {
        this.products.push({ ...product, id: Date.now() });
        this.saveProducts();
    },

    addToCart(productId) {
        const product = this.products.find(p => p.id == productId);
        if (product) {
            this.cart.push(product);
            this.saveCart();
            alert(`Added ${product.name} to cart!`);
        }
    },

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.saveCart();
        // Re-render checkout page if open
        if (location.hash === '#checkout') Router.routes.checkout();
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
    },

    updateCartUI() {
        const badge = document.getElementById('cart-badge');
        if (this.cart.length > 0) {
            badge.style.display = 'flex';
            badge.textContent = this.cart.length;
        } else {
            badge.style.display = 'none';
        }
    }
};

/* --- ROUTER ENGINE (The "Legs") --- */
const Router = {
    root: document.getElementById('app'),

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute(); // Handle initial load
    },

    handleRoute() {
        const hash = window.location.hash || '#/';
        const routeName = hash.split('?')[0].replace('#', '') || '/';

        // Scroll to top
        window.scrollTo(0, 0);

        // Update active nav state
        document.querySelectorAll('.nav-link').forEach(el => {
            el.classList.remove('active');
            if (el.getAttribute('href') === hash) el.classList.add('active');
        });

        // Add fade out effect
        this.root.style.opacity = 0;

        setTimeout(() => {
            if (this.routes[routeName]) {
                this.root.innerHTML = this.routes[routeName]();
                // Initialize icons for new content
                lucide.createIcons();
                // Initialize specific page logic
                if (this.handlers[routeName]) this.handlers[routeName]();
            } else {
                this.root.innerHTML = this.routes['/'](); // Default to home
                lucide.createIcons();
            }
            this.root.style.opacity = 1;
        }, 200);
    },

    // Page Templates
    routes: {
        '/': () => `
            <section class="hero reveal">
                <h1>Innovating at the Edge of <span class="gradient-text">Possibility</span></h1>
                <p>TechR Innovations bridges the gap between cybersecurity, education, potential, and human recovery.</p>
                <div style="display: flex; justify-content: center; gap: 1rem;">
                    <a href="#techack" class="btn-primary" style="background: var(--color-techack); color: black;">
                        <i data-lucide="terminal"></i> Explore Techack
                    </a>
                </div>
            </section>
            
            <section class="container division-grid">
                ${Components.DivisionCard('Techack', 'Penetration Testing Hardware', '#techack', 'var(--color-techack)', 'shield')}
                ${Components.DivisionCard('TechBox', 'STEM Education Kits', '#techbox', 'var(--color-techbox)', 'zap')}
                ${Components.DivisionCard('Rithim', 'Recovery Wearables', '#rithim', 'var(--color-rithim)', 'heart')}
                ${Components.DivisionCard('StudyTech', 'Offline AI Assistance', '#studytech', 'var(--color-studytech)', 'book-open')}
            </section>
        `,
        'techack': () => `
            <div class="container">
                <section class="techack-hero reveal">
                    <div class="techack-hero-content">
                        <span class="badge">NEW RELEASE</span>
                        <h1>Techack<span style="color: white;">1</span></h1>
                        <p style="font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 2rem;">
                            The ultimate portable penetration testing framework. 
                            <br>Compacted into a single, pocket-sized PCB.
                        </p>
                        <div style="display: flex; gap: 1rem;">
                            <button onclick="Store.addToCart(1)" class="btn-primary">
                                Add to Cart - $299.99
                            </button>
                            <a href="#" style="padding: 0.75rem 1.5rem; border: 1px solid var(--border-glass); border-radius: 8px; color: white;">
                                View Documentation
                            </a>
                        </div>
                    </div>
                    <div class="techack-visual">
                        <img src="https://images.unsplash.com/photo-1563770095162-95f88954dbd3?w=800&q=80" alt="Techack1 Device">
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, black, transparent); height: 100px;"></div>
                    </div>
                </section>

                <div class="tech-grid reveal">
                    <div class="tech-feature">
                        <i data-lucide="radio" size="40"></i>
                        <h3>Sub-GHz Transceiver</h3>
                        <p style="color: var(--text-secondary);">Integrated CC1101 module for 433MHz and sub-GHz communication analysis.</p>
                    </div>
                    <div class="tech-feature">
                        <i data-lucide="wifi" size="40"></i>
                        <h3>Wi-Fi & Bluetooth</h3>
                        <p style="color: var(--text-secondary);">Dual-stack wireless auditing with packet injection and sniffer modes.</p>
                    </div>
                    <div class="tech-feature">
                        <i data-lucide="keyboard" size="40"></i>
                        <h3>BadUSB HID</h3>
                        <p style="color: var(--text-secondary);">Pre-programmable keystroke injection payloads for rapid deployment.</p>
                    </div>
                    <div class="tech-feature">
                        <i data-lucide="cpu" size="40"></i>
                        <h3>Open Hardware</h3>
                        <p style="color: var(--text-secondary);">Powered by ESP32 architecture. Fully hackable and community driven.</p>
                    </div>
                </div>

                <div class="glass-panel reveal" style="padding: 3rem; margin-bottom: 4rem;">
                    <h2 style="font-family: var(--font-heading); margin-bottom: 2rem;">Technical Specifications</h2>
                    <table class="tech-specs-table">
                        <tr>
                            <td>MCU</td>
                            <td>ESP32-S3 Dual Core 240MHz</td>
                        </tr>
                        <tr>
                            <td>Radio Module</td>
                            <td>TI CC1101 (300-928 MHz)</td>
                        </tr>
                        <tr>
                            <td>Display</td>
                            <td>1.3" OLED (128x64)</td>
                        </tr>
                        <tr>
                            <td>Connectivity</td>
                            <td>USB-C, MicroSD, GPIO Header</td>
                        </tr>
                        <tr>
                            <td>Battery</td>
                            <td>LiPo 800mAh (6 Hours Active)</td>
                        </tr>
                    </table>
                </div>
            </div>
        `,
        'techbox': () => Components.ProductPage('TechBox', 'var(--color-techbox)', 'Curiosity Unboxed. STEM Learning.', 'techbox'),
        'rithim': () => Components.ProductPage('Rithim', 'var(--color-rithim)', 'Recovery Redefined.', 'rithim'),
        'studytech': () => `
            <div class="container">
                <header style="margin-bottom: 3rem; text-align: center;">
                    <h1 style="color: var(--color-studytech); font-family: var(--font-heading); font-size: 3rem;">StudyTech</h1>
                    <p style="color: var(--text-secondary);">AI-Powered. Offline First.</p>
                </header>
                
                <div class="glass-panel ai-console" style="margin-bottom: 4rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                        <i data-lucide="cpu" color="var(--color-studytech)" size="32"></i>
                        <h2 style="margin: 0;">AI Content Generator</h2>
                    </div>
                    <p style="margin-bottom: 1rem; color: #a1a1aa;">Generate offline flashcard packs for your device.</p>
                    
                    <div id="ai-interface">
                        <textarea id="ai-prompt" rows="3" placeholder="Enter a topic (e.g., 'Advanced Spanish Verbs')..."></textarea>
                        <button id="ai-gen-btn" class="btn-primary" style="background: var(--color-studytech); width: 100%; justify-content: center; margin-top: 1rem;">
                            <i data-lucide="sparkles"></i> Generate Pack
                        </button>
                    </div>
                </div>

                <h3 style="margin-bottom: 1.5rem;">Available Hardware</h3>
                <div class="product-grid">
                    ${Components.ProductGrid('studytech')}
                </div>
            </div>
        `,
        'admin': () => `
            <div class="container">
                <h1 style="font-family: var(--font-heading); margin-bottom: 2rem;">Employee Portal</h1>
                <div class="division-grid" style="grid-template-columns: 1fr 1fr;">
                    <div class="glass-panel" style="padding: 2rem;">
                        <h3>Add New Product</h3>
                        <form id="add-product-form" style="margin-top: 1.5rem;">
                            <label>Name</label>
                            <input type="text" id="p-name" required>
                            <label>Price</label>
                            <input type="number" id="p-price" step="0.01" required>
                            <label>Category</label>
                            <select id="p-cat">
                                <option value="techack">Techack</option>
                                <option value="techbox">TechBox</option>
                                <option value="rithim">Rithim</option>
                                <option value="studytech">StudyTech</option>
                            </select>
                            <label>Description</label>
                            <textarea id="p-desc" required></textarea>
                            <label>Image URL</label>
                            <input type="url" id="p-img" value="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80">
                            
                            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
                                <i data-lucide="plus"></i> Add to Inventory
                            </button>
                        </form>
                    </div>
                    <div class="glass-panel" style="padding: 2rem;">
                        <h3>Inventory Log</h3>
                        <ul id="admin-inventory-list" style="margin-top: 1rem; max-height: 400px; overflow-y: auto;">
                            <!-- Populated by JS -->
                        </ul>
                    </div>
                </div>
            </div>
        `,
        'checkout': () => `
            <div class="container" style="max-width: 800px;">
                <h1 style="font-family: var(--font-heading); margin-bottom: 2rem;">Secure Checkout</h1>
                
                ${Store.cart.length === 0 ? '<div class="glass-panel" style="padding: 2rem; text-align: center;">Your cart is empty.</div>' : `
                    <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
                        <ul style="display: flex; flex-direction: column; gap: 1rem;">
                            ${Store.cart.map((item, index) => `
                                <li style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-glass); padding-bottom: 0.5rem;">
                                    <div>
                                        <strong>${sanitize(item.name)}</strong>
                                        <div style="font-size: 0.8em; color: var(--text-secondary); text-transform: uppercase;">${item.category}</div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <span>$${sanitize(item.price)}</span>
                                        <button onclick="Store.removeFromCart(${index})" style="color: #ef4444;"><i data-lucide="trash-2" size="16"></i></button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                        <div style="margin-top: 1.5rem; text-align: right; font-size: 1.5rem; font-weight: bold;">
                            Total: $${Store.cart.reduce((sum, i) => sum + parseFloat(i.price), 0).toFixed(2)}
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 2rem;">
                        <h3 style="margin-bottom: 1.5rem;"><i data-lucide="lock"></i> Pay with Square (Secured)</h3>
                        <form id="payment-form">
                            <div id="card-container" style="min-height: 100px; background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;"></div>
                            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">
                                Pay Now
                            </button>
                        </form>
                        <div id="payment-status-container" style="margin-top: 1rem; color: var(--text-accent);"></div>
                    </div>
                `}
            </div>
        `
    },

    // Page Specific Logic Handlers
    handlers: {
        'admin': () => {
            // Render inventory list
            const list = document.getElementById('admin-inventory-list');
            list.innerHTML = Store.products.map(p => `
                <li style="padding: 0.5rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 4px; font-size: 0.9rem;">
                    <strong>${sanitize(p.name)}</strong> - $${sanitize(p.price)}
                </li>
            `).join('');

            // Handle Add Product
            document.getElementById('add-product-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const newProduct = {
                    name: document.getElementById('p-name').value,
                    price: document.getElementById('p-price').value,
                    category: document.getElementById('p-cat').value,
                    desc: document.getElementById('p-desc').value,
                    image: document.getElementById('p-img').value
                };
                Store.addProduct(newProduct);
                alert('Product added successfully!');
                Router.handleRoute(); // Refresh
            });
        },
        'studytech': () => {
            document.getElementById('ai-gen-btn').addEventListener('click', () => {
                const prompt = document.getElementById('ai-prompt').value;
                if (!prompt) return alert("Please enter a topic.");

                const container = document.getElementById('ai-interface');
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div class="spinner" style="border-top-color: var(--color-studytech)"></div>
                        <p class="text-accent" style="font-family: monospace;">ANALYZING TOPIC: ${prompt}...</p>
                        <p style="color: #a1a1aa; font-family: monospace;">GENERATING FLASHCARDS...</p>
                    </div>
                `;

                setTimeout(() => {
                    container.innerHTML = `
                        <div class="code-block" style="margin-bottom: 1rem;">
{
  "pack_id": "gen_${Date.now()}",
  "topic": "${prompt}",
  "cards": 50,
  "difficulty": "adaptive",
  "status": "READY"
}
                        </div>
                        <button class="btn-primary" style="background: white; color: black; width: 100%; justify-content: center;">
                            <i data-lucide="download"></i> Download Pack
                        </button>
                        <button onclick="Router.handleRoute()" style="width: 100%; margin-top: 0.5rem; padding: 0.5rem; color: #a1a1aa;">Generate Another</button>
                    `;
                    lucide.createIcons();
                }, 2500);
            });
        },
        'checkout': async () => {
            if (Store.cart.length === 0) return;

            // SQUARE PAYMENTS CONFIGURATION
            // REPLACE WITH YOUR REAL SANDBOX CREDENTIALS
            const appId = 'sandbox-sq0idb-baAQrwCn8BjaayFVRoDUJA';
            const locationId = 'L0Y991888847';

            try {
                if (!window.Square) throw new Error("Square SDK not loaded");

                const payments = window.Square.payments(appId, locationId);
                const card = await payments.card();
                await card.attach('#card-container');

                const form = document.getElementById('payment-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const statusParams = document.getElementById('payment-status-container');
                    statusParams.textContent = "Securing connection...";

                    try {
                        const result = await card.tokenize();
                        if (result.status === 'OK') {
                            // In a real app, you send result.token to your backend
                            console.log('Secure Token:', result.token);

                            document.getElementById('app').innerHTML = `
                                <div class="container" style="text-align: center; padding: 4rem;">
                                    <div style="margin-bottom: 2rem;">
                                        <i data-lucide="shield-check" size="80" color="#10b981"></i>
                                    </div>
                                    <h1 style="margin-bottom: 1rem;">Payment Secured.</h1>
                                    <p style="color: var(--text-secondary); max-width: 500px; margin: 0 auto 2rem;">
                                        Token Generated: <span style="font-family: monospace; background: #333; padding: 2px 6px;">${result.token.substring(0, 15)}...</span><br>
                                        The encrypted token has been safely generated. No card data was stored on this device.
                                    </p>
                                    <a href="#/" class="btn-primary">Return to Base</a>
                                </div>
                            `;
                            lucide.createIcons();
                            Store.clearCart();
                        } else {
                            throw new Error(result.errors[0].message);
                        }
                    } catch (err) {
                        statusParams.style.color = '#ef4444';
                        statusParams.textContent = "Payment Failed: " + err.message;
                    }
                });
            } catch (e) {
                console.error("Square Logic Error:", e);
                document.getElementById('card-container').innerHTML = `
                    <p style="color: black;">Secure Payment failed to load. Ensure you are viewing via HTTPS (GitHub Pages) and not file://.</p>
                `;
            }
        }
    }
};

/* --- COMPONENT HELPERS --- */
const Components = {
    DivisionCard: (title, desc, link, color, icon) => `
        <a href="${link}" class="division-card glass-panel reveal" style="color: ${color}; border-color: rgba(255,255,255,0.05);">
            <i data-lucide="${icon}" size="32"></i>
            <h3 style="color: white;">${title}</h3>
            <p>${desc}</p>
            <div class="card-arrow"><i data-lucide="arrow-right"></i></div>
        </a>
    `,
    ProductPage: (title, color, tagline, category) => `
        <div class="container">
            <header class="reveal" style="margin-bottom: 3rem; border-bottom: 2px solid ${color}; padding-bottom: 1rem;">
                <h1 style="color: ${color}; font-family: var(--font-heading); font-size: 3rem;">${title}</h1>
                <p style="color: var(--text-secondary);">${tagline}</p>
            </header>
            <div class="product-grid">
                ${Components.ProductGrid(category, color)}
            </div>
        </div>
    `,
    ProductGrid: (category, color) => {
        const items = Store.products.filter(p => p.category === category);
        if (items.length === 0) return '<p>No inventory detected in this sector.</p>';
        return items.map((p, index) => `
            <div class="product-card glass-panel reveal" style="transition-delay: ${index * 100}ms">
                <img src="${sanitize(p.image)}" class="product-img" alt="${sanitize(p.name)}">
                <div class="product-info">
                    <h3>${sanitize(p.name)}</h3>
                    <p class="product-desc">${sanitize(p.desc)}</p>
                    <div class="product-footer">
                        <span class="price">$${sanitize(p.price)}</span>
                        <button onclick="Store.addToCart(${p.id})" class="btn-shop" style="border: 1px solid ${color || '#fff'}">
                            Add <i data-lucide="shopping-bag" size="16"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

/* --- INITIALIZATION --- */
// Toggle Mobile Menu
window.toggleMobileMenu = () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
};

// Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Start Engines
document.addEventListener('DOMContentLoaded', () => {
    Store.init();
    Router.init();
    lucide.createIcons();
});

// Hook into Router to re-observe elements
const originalHandleRoute = Router.handleRoute.bind(Router);
Router.handleRoute = function () {
    originalHandleRoute();
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }, 250); // Wait for render
};
