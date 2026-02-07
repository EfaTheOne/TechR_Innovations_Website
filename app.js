// TechR Innovations Core Engine v2.0
// Handles routing, state management, and Square integration

(function() {
    // 1. App State & Mock Data
    const PRODUCTS = [
        { id: 'th-01', name: 'Techack Pentest Kit', category: 'techack', price: 1499, image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', description: 'Portable pentesting framework for security professionals.' },
        { id: 'tb-01', name: 'EduBox Pro', category: 'techbox', price: 899, image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', description: 'All-in-one educational hardware suite for STEM.' },
        { id: 'ri-01', name: 'Rithim Pulse', category: 'rithim', price: 299, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', description: 'Recovery tracking and optimization wearable.' },
        { id: 'st-01', name: 'StudyMind AI', category: 'studytech', price: 199, image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80', description: 'Personalized AI tutor for advanced linguistics.' }
    ];

    const Auth = {
        getCart: () => JSON.parse(localStorage.getItem('techr_cart') || '[]'),
        setCart: (cart) => {
            localStorage.setItem('techr_cart', JSON.stringify(cart));
            Auth.updateCartCount();
        },
        updateCartCount: () => {
            const count = Auth.getCart().length;
            const badge = document.getElementById('cart-count');
            if (badge) badge.textContent = count;
        }
    };

    // 2. Router
    const routes = {
        '/': () => home(),
        '/techack': () => products('techack'),
        '/techbox': () => products('techbox'),
        '/rithim': () => products('rithim'),
        '/studytech': () => products('studytech'),
        '/checkout': () => checkout()
    };

    const handleLocation = async () => {
        const path = window.location.hash.slice(1) || '/';
        const route = routes[path] || routes['/'];
        injectHeader();
        await route();
        if (window.lucide) lucide.createIcons();
    };

    window.route = (event) => {
        event.preventDefault();
        const href = event.currentTarget.getAttribute('href') || event.target.getAttribute('href');
        window.location.hash = href;
    };

    window.addEventListener('hashchange', handleLocation);
    window.addEventListener('load', handleLocation);

    // 3. Components
    const injectHeader = () => {
        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) return;
        headerContainer.innerHTML = `
            <header class="nav-content">
                <div class="logo" onclick="window.location.hash='/'">
                    <i data-lucide="shield"></i>
                    <span>TechR Innovations</span>
                </div>
                <nav class="nav-links">
                    <a href="#/techack">Techack</a>
                    <a href="#/techbox">TechBox</a>
                    <a href="#/rithim">Rithim</a>
                    <a href="#/studytech">StudyTech</a>
                </nav>
                <div class="cart-container" onclick="window.location.hash='/checkout'">
                    <i data-lucide="shopping-cart"></i>
                    <span id="cart-count">${Auth.getCart().length}</span>
                </div>
            </header>
        `;
    };

    const home = () => {
        const app = document.getElementById('app');
        app.innerHTML = `
            <section class="hero">
                <div class="container">
                    <div class="hero-content">
                        <h1>Future. <span style="color:var(--accent)">Secured.</span></h1>
                        <p>Pioneering the next generation of cybersecurity hardware, STEM education, and recovery technology.</p>
                        <div class="hero-actions">
                            <button class="btn primary" onclick="window.location.hash='/techack'">Explore Ecosystem</button>
                            <button class="btn secondary" onclick="window.scrollTo({top: window.innerHeight, behavior: 'smooth'})">Learn More</button>
                        </div>
                    </div>
                </div>
            </section>
            <section class="featured container">
                <h2 style="margin-bottom: 3rem; text-align: center;">Core Innovations</h2>
                <div class="product-grid">
                    ${PRODUCTS.map(p => productCard(p)).join('')}
                </div>
            </section>
        `;
    };

    const products = (category) => {
        const app = document.getElementById('app');
        const filtered = PRODUCTS.filter(p => p.category === category);
        app.innerHTML = `
            <section class="category-header">
                <div class="container">
                    <h2 class="capitalize">${category} Solutions</h2>
                </div>
            </section>
            <section class="container">
                <div class="product-grid">
                    ${filtered.map(p => productCard(p)).join('')}
                </div>
            </section>
        `;
    };

    const productCard = (p) => `
        <div class="product-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="price">$${p.price}</div>
                <button class="btn secondary" onclick="addToCart('${p.id}')">Add to Cart</button>
            </div>
        </div>
    `;

    const checkout = async () => {
        const cart = Auth.getCart();
        const app = document.getElementById('app');

        if (!cart.length) {
            app.innerHTML = `
                <div class="checkout-container container">
                    <h2>Your Cart is Empty</h2>
                    <button class="btn primary" onclick="window.location.hash='/'">Go Shopping</button>
                </div>
            `;
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price, 0);

        app.innerHTML = `
            <div class="checkout-page container">
                <div class="checkout-grid">
                    <div class="order-summary">
                        <h2>Order Summary</h2>
                        <div class="cart-items">
                            ${cart.map((item, index) => `
                                <div class="cart-item">
                                    <img src="${item.image}" alt="${item.name}">
                                    <div class="item-details">
                                        <h4>${item.name}</h4>
                                        <p>$${item.price}</p>
                                    </div>
                                    <button class="remove-btn" onclick="removeFromCart(${index})">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <div class="total-row">
                            <span>Total</span>
                            <span>$${total}</span>
                        </div>
                    </div>
                    <div class="payment-section">
                        <h2>Payment</h2>
                        <div id="card-container"></div>
                        <button id="card-button" class="btn primary full-width">Pay $${total}</button>
                        <div id="payment-status-container"></div>
                        ${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ?
                          '<p class="dev-note">Development Mode: Square Sandbox Active</p>' : ''}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        await initSquare();
    };

    // 4. Actions
    window.addToCart = (id) => {
        const product = PRODUCTS.find(p => p.id === id);
        const cart = Auth.getCart();
        cart.push(product);
        Auth.setCart(cart);
        alert(`${product.name} added to cart!`);
    };

    window.removeFromCart = (index) => {
        const cart = Auth.getCart();
        cart.splice(index, 1);
        Auth.setCart(cart);
        checkout();
    };

    // 5. Square Integration
    async function initSquare() {
        const cardContainer = document.getElementById('card-container');
        const cardButton = document.getElementById('card-button');
        const statusContainer = document.getElementById('payment-status-container');

        if (!window.Square) {
            console.error('Square SDK not loaded');
            if (cardContainer) cardContainer.innerHTML = '<p class="error-msg">Payment SDK failed to load.</p>';
            return;
        }

        try {
            const payments = Square.payments('sandbox-sq0idb-u6_TidGq8U0hQ3-XJp9T8g', 'L89DA092J7G8Z');
            const card = await payments.card();
            await card.attach('#card-container');

            cardButton.addEventListener('click', async () => {
                cardButton.disabled = true;
                cardButton.textContent = 'Processing...';
                try {
                    const result = await card.tokenize();
                    if (result.status === 'OK') {
                        console.log('Token:', result.token);
                        statusContainer.innerHTML = '<p class="success-msg">Payment Successful! Order confirmed.</p>';
                        Auth.setCart([]);
                        setTimeout(() => window.location.hash = '/', 2000);
                    } else {
                        throw new Error(result.errors[0].message);
                    }
                } catch (e) {
                    console.error(e);
                    statusContainer.innerHTML = `<p class="error-msg">Payment Failed: ${e.message}</p>`;
                    cardButton.disabled = false;
                    cardButton.textContent = 'Pay Now';
                }
            });
        } catch (e) {
            console.error('Square initialization failed', e);
            if (cardContainer) {
                cardContainer.innerHTML = `
                    <div class="payment-fallback">
                        <p>Standard payment gateway is currently unavailable.</p>
                        <button id="demo-pay-button" class="btn primary full-width">Proceed with Demo Payment</button>
                    </div>
                `;
                cardButton.style.display = 'none';
                document.getElementById('demo-pay-button').addEventListener('click', () => {
                    statusContainer.innerHTML = '<p class="success-msg">Demo Payment Successful! Order confirmed.</p>';
                    Auth.setCart([]);
                    setTimeout(() => window.location.hash = '/', 2000);
                });
            }
        }
    }

})();
