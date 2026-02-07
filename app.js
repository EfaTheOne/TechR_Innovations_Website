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
        },
        'studytech': () => `
            <div class="container" style="padding-top: 8rem; padding-bottom: 4rem;">
                <div class="studytech-hero reveal">
                    <div class="studytech-badge">AI-Powered Learning</div>
                    <h1 style="color: var(--color-studytech);">StudyTech AI</h1>
                    <p style="max-width: 600px; margin: 0 auto 2rem;">
                        Transform your learning with our AI-powered study assistant. Create flashcards, take quizzes, and master any subject with intelligent study methods.
                    </p>
                    <button class="btn btn-primary" id="download-app-btn">
                        <i data-lucide="download"></i> Download StudyTech App
                    </button>
                </div>
                
                <div class="studytech-modes reveal" style="margin-top: 3rem;">
                    <h2 style="text-align: center; margin-bottom: 2rem;">Choose Your Study Mode</h2>
                    <div class="mode-selector">
                        <button class="mode-btn active" id="mode-flashcards">
                            <i data-lucide="layers"></i> Flashcards
                        </button>
                        <button class="mode-btn" id="mode-quiz">
                            <i data-lucide="check-circle"></i> Quiz Mode
                        </button>
                        <button class="mode-btn" id="mode-create">
                            <i data-lucide="plus-circle"></i> Create Cards
                        </button>
                    </div>
                </div>

                <div id="study-content" class="study-content reveal">
                    <!-- Dynamic content rendered here -->
                </div>
            </div>
        `,
        'techbox': () => `
            <div class="container" style="padding-top: 8rem; padding-bottom: 4rem;">
                <h2 class="reveal">TechBox Education</h2>
                <p class="reveal" style="margin-bottom: 2rem;">Comprehensive STEM learning kits for the next generation.</p>
                <div class="product-grid reveal" style="margin-top: 2rem;">
                    ${Store.products.filter(p => p.category === 'techbox').map(p => Components.ProductCard(p)).join('')}
                </div>
            </div>
        `,
        'rithim': () => `
            <div class="container" style="padding-top: 8rem; padding-bottom: 4rem;">
                <h2 class="reveal">Rithim Recovery</h2>
                <p class="reveal" style="margin-bottom: 2rem;">Clinical-grade biosensors for real-time recovery tracking.</p>
                <div class="product-grid reveal" style="margin-top: 2rem;">
                    ${Store.products.filter(p => p.category === 'rithim').map(p => Components.ProductCard(p)).join('')}
                </div>
            </div>
        `
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

        if (hash === 'studytech') {
            StudyTech.init(); // Initialize StudyTech module
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

// --- STUDYTECH AI MODULE ---
const StudyTech = {
    flashcards: [],
    currentCardIndex: 0,
    currentMode: 'flashcards',
    quizScore: 0,
    quizQuestions: [],
    currentQuizIndex: 0,

    // Helper to sanitize HTML to prevent XSS
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    init: () => {
        // Load saved flashcards from localStorage
        const saved = localStorage.getItem('studytech_cards');
        if (saved) {
            StudyTech.flashcards = JSON.parse(saved);
        } else {
            // Demo flashcards
            StudyTech.flashcards = [
                { front: "What is the capital of France?", back: "Paris" },
                { front: "What is 2 + 2?", back: "4" },
                { front: "Who wrote Romeo and Juliet?", back: "William Shakespeare" },
                { front: "What is the chemical symbol for water?", back: "H₂O" },
                { front: "What planet is known as the Red Planet?", back: "Mars" }
            ];
        }
        
        // Attach event listeners for mode buttons
        StudyTech.attachMainEventListeners();
        StudyTech.switchMode('flashcards');
    },

    attachMainEventListeners: () => {
        const downloadBtn = document.getElementById('download-app-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', StudyTech.downloadApp);
        }
        
        const flashcardsBtn = document.getElementById('mode-flashcards');
        const quizBtn = document.getElementById('mode-quiz');
        const createBtn = document.getElementById('mode-create');
        
        if (flashcardsBtn) flashcardsBtn.addEventListener('click', () => StudyTech.switchMode('flashcards'));
        if (quizBtn) quizBtn.addEventListener('click', () => StudyTech.switchMode('quiz'));
        if (createBtn) createBtn.addEventListener('click', () => StudyTech.switchMode('create'));
    },

    attachContentEventListeners: () => {
        // Flashcard listeners
        const flashcard = document.getElementById('flashcard');
        if (flashcard) flashcard.addEventListener('click', StudyTech.flipCard);
        
        const prevBtn = document.getElementById('prev-card-btn');
        const nextBtn = document.getElementById('next-card-btn');
        const speakBtn = document.getElementById('speak-card-btn');
        const shuffleBtn = document.getElementById('shuffle-btn');
        const emptyCreateBtn = document.getElementById('empty-create-btn');
        
        if (prevBtn) prevBtn.addEventListener('click', StudyTech.prevCard);
        if (nextBtn) nextBtn.addEventListener('click', StudyTech.nextCard);
        if (speakBtn) speakBtn.addEventListener('click', StudyTech.speakCard);
        if (shuffleBtn) shuffleBtn.addEventListener('click', StudyTech.shuffleCards);
        if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', () => StudyTech.switchMode('create'));
        
        // Quiz listeners
        const quizOptions = document.querySelectorAll('.quiz-option');
        quizOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const optionIndex = parseInt(opt.getAttribute('data-option-index'));
                StudyTech.checkAnswer(optionIndex);
            });
        });
        
        const quizRetryBtn = document.getElementById('quiz-retry-btn');
        const quizReviewBtn = document.getElementById('quiz-review-btn');
        if (quizRetryBtn) quizRetryBtn.addEventListener('click', StudyTech.startQuiz);
        if (quizReviewBtn) quizReviewBtn.addEventListener('click', () => StudyTech.switchMode('flashcards'));
        
        // Create mode listeners
        const addCardBtn = document.getElementById('add-card-btn');
        if (addCardBtn) addCardBtn.addEventListener('click', StudyTech.addCard);
        
        const deleteBtns = document.querySelectorAll('.delete-card-btn');
        deleteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                StudyTech.deleteCard(index);
            });
        });
    },

    persist: () => {
        localStorage.setItem('studytech_cards', JSON.stringify(StudyTech.flashcards));
    },

    switchMode: (mode) => {
        StudyTech.currentMode = mode;
        
        // Update active button
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`mode-${mode}`);
        if (activeBtn) activeBtn.classList.add('active');

        const content = document.getElementById('study-content');
        if (!content) return;

        switch(mode) {
            case 'flashcards':
                StudyTech.renderFlashcards();
                break;
            case 'quiz':
                StudyTech.startQuiz();
                break;
            case 'create':
                StudyTech.renderCreateMode();
                break;
        }
        
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    renderFlashcards: () => {
        const content = document.getElementById('study-content');
        if (StudyTech.flashcards.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <h3>No Flashcards Yet</h3>
                    <p>Create some flashcards to get started!</p>
                    <button class="btn btn-primary" id="empty-create-btn">Create Cards</button>
                </div>
            `;
            return;
        }

        const card = StudyTech.flashcards[StudyTech.currentCardIndex];
        content.innerHTML = `
            <div class="flashcard-container">
                <div class="flashcard" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <p>${StudyTech.escapeHtml(card.front)}</p>
                            <span class="flip-hint">Click to flip</span>
                        </div>
                        <div class="flashcard-back">
                            <p>${StudyTech.escapeHtml(card.back)}</p>
                            <span class="flip-hint">Click to flip</span>
                        </div>
                    </div>
                </div>
                <div class="flashcard-nav">
                    <button class="btn btn-secondary" id="prev-card-btn">
                        <i data-lucide="chevron-left"></i> Previous
                    </button>
                    <span class="card-counter">${StudyTech.currentCardIndex + 1} / ${StudyTech.flashcards.length}</span>
                    <button class="btn btn-secondary" id="next-card-btn">
                        Next <i data-lucide="chevron-right"></i>
                    </button>
                </div>
                <div class="flashcard-actions">
                    <button class="btn btn-secondary" id="speak-card-btn">
                        <i data-lucide="volume-2"></i> Read Aloud
                    </button>
                    <button class="btn btn-secondary" id="shuffle-btn">
                        <i data-lucide="shuffle"></i> Shuffle
                    </button>
                </div>
            </div>
        `;
    },

    flipCard: () => {
        const card = document.getElementById('flashcard');
        if (card) card.classList.toggle('flipped');
    },

    nextCard: () => {
        StudyTech.currentCardIndex = (StudyTech.currentCardIndex + 1) % StudyTech.flashcards.length;
        StudyTech.renderFlashcards();
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    prevCard: () => {
        StudyTech.currentCardIndex = StudyTech.currentCardIndex === 0 
            ? StudyTech.flashcards.length - 1 
            : StudyTech.currentCardIndex - 1;
        StudyTech.renderFlashcards();
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    shuffleCards: () => {
        StudyTech.flashcards = StudyTech.flashcards.sort(() => Math.random() - 0.5);
        StudyTech.currentCardIndex = 0;
        StudyTech.renderFlashcards();
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    speakCard: () => {
        const card = StudyTech.flashcards[StudyTech.currentCardIndex];
        const flashcardEl = document.getElementById('flashcard');
        const isFlipped = flashcardEl && flashcardEl.classList.contains('flipped');
        const text = isFlipped ? card.back : card.front;
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    },

    startQuiz: () => {
        if (StudyTech.flashcards.length < 4) {
            const content = document.getElementById('study-content');
            content.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="alert-circle"></i>
                    <h3>Not Enough Cards</h3>
                    <p>You need at least 4 flashcards to take a quiz.</p>
                    <button class="btn btn-primary" id="empty-create-btn">Create Cards</button>
                </div>
            `;
            return;
        }

        // Generate quiz questions from flashcards
        StudyTech.quizQuestions = StudyTech.flashcards.map((card, idx) => {
            // Get 3 wrong answers from other cards
            const otherCards = StudyTech.flashcards.filter((_, i) => i !== idx);
            const wrongAnswers = otherCards
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(c => c.back);
            
            const options = [...wrongAnswers, card.back].sort(() => Math.random() - 0.5);
            
            return {
                question: card.front,
                correct: card.back,
                options: options
            };
        }).sort(() => Math.random() - 0.5).slice(0, 5); // Take 5 random questions

        StudyTech.currentQuizIndex = 0;
        StudyTech.quizScore = 0;
        StudyTech.renderQuizQuestion();
    },

    renderQuizQuestion: () => {
        const content = document.getElementById('study-content');
        if (StudyTech.currentQuizIndex >= StudyTech.quizQuestions.length) {
            // Quiz complete
            const percentage = Math.round((StudyTech.quizScore / StudyTech.quizQuestions.length) * 100);
            content.innerHTML = `
                <div class="quiz-complete">
                    <i data-lucide="award" style="width: 64px; height: 64px; color: var(--color-studytech);"></i>
                    <h2>Quiz Complete!</h2>
                    <p class="quiz-score">You scored ${StudyTech.quizScore} out of ${StudyTech.quizQuestions.length} (${percentage}%)</p>
                    <div class="quiz-actions">
                        <button class="btn btn-primary" id="quiz-retry-btn">Try Again</button>
                        <button class="btn btn-secondary" id="quiz-review-btn">Review Cards</button>
                    </div>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
            StudyTech.attachContentEventListeners();
            return;
        }

        const q = StudyTech.quizQuestions[StudyTech.currentQuizIndex];
        content.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-progress">
                    <span>Question ${StudyTech.currentQuizIndex + 1} of ${StudyTech.quizQuestions.length}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((StudyTech.currentQuizIndex) / StudyTech.quizQuestions.length) * 100}%"></div>
                    </div>
                </div>
                <div class="quiz-question">
                    <h3>${StudyTech.escapeHtml(q.question)}</h3>
                </div>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-option-index="${i}">
                            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                            ${StudyTech.escapeHtml(opt)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        StudyTech.attachContentEventListeners();
    },

    checkAnswer: (optionIndex) => {
        const q = StudyTech.quizQuestions[StudyTech.currentQuizIndex];
        const answer = q.options[optionIndex];
        const isCorrect = answer === q.correct;
        
        if (isCorrect) {
            StudyTech.quizScore++;
        }

        // Show feedback briefly - find correct option by index
        const options = document.querySelectorAll('.quiz-option');
        const correctIndex = q.options.indexOf(q.correct);
        options.forEach((opt, idx) => {
            opt.disabled = true;
            if (idx === correctIndex) {
                opt.classList.add('correct');
            } else if (idx === optionIndex && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });

        setTimeout(() => {
            StudyTech.currentQuizIndex++;
            StudyTech.renderQuizQuestion();
        }, 1000);
    },

    renderCreateMode: () => {
        const content = document.getElementById('study-content');
        content.innerHTML = `
            <div class="create-container">
                <div class="create-form card">
                    <h3>Add New Flashcard</h3>
                    <label>Front (Question)</label>
                    <textarea id="card-front" rows="3" placeholder="Enter the question or term..."></textarea>
                    <label>Back (Answer)</label>
                    <textarea id="card-back" rows="3" placeholder="Enter the answer or definition..."></textarea>
                    <button class="btn btn-primary" id="add-card-btn" style="width: 100%;">
                        <i data-lucide="plus"></i> Add Card
                    </button>
                </div>
                
                <div class="existing-cards">
                    <h3>Your Cards (${StudyTech.flashcards.length})</h3>
                    <div class="cards-list">
                        ${StudyTech.flashcards.map((card, i) => `
                            <div class="card-item">
                                <div class="card-preview">
                                    <strong>${StudyTech.escapeHtml(card.front)}</strong>
                                    <span>${StudyTech.escapeHtml(card.back)}</span>
                                </div>
                                <button class="delete-btn delete-card-btn" data-index="${i}">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    addCard: () => {
        const front = document.getElementById('card-front').value.trim();
        const back = document.getElementById('card-back').value.trim();
        
        if (!front || !back) {
            alert('Please fill in both sides of the card.');
            return;
        }

        StudyTech.flashcards.push({ front, back });
        StudyTech.persist();
        StudyTech.renderCreateMode();
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    deleteCard: (index) => {
        StudyTech.flashcards.splice(index, 1);
        StudyTech.persist();
        StudyTech.renderCreateMode();
        if (window.lucide) lucide.createIcons();
        StudyTech.attachContentEventListeners();
    },

    downloadApp: () => {
        // Generate a standalone HTML file that can be opened in browser
        const appHtml = StudyTech.generateStandaloneApp();
        const blob = new Blob([appHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'StudyTech_AI_App.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    generateStandaloneApp: () => {
        const cards = JSON.stringify(StudyTech.flashcards);
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudyTech AI - Standalone Study App</title>
    <style>
        :root {
            --bg: #0a0a0c;
            --card-bg: #111;
            --accent: #5e5ce6;
            --text: #fff;
            --text-muted: #888;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg); color: var(--text); min-height: 100vh;
            display: flex; flex-direction: column; align-items: center; padding: 2rem;
        }
        h1 { margin-bottom: 0.5rem; color: var(--accent); }
        .subtitle { color: var(--text-muted); margin-bottom: 2rem; }
        .mode-selector { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; justify-content: center; }
        .mode-btn { padding: 0.75rem 1.5rem; border: 1px solid var(--accent); background: transparent;
            color: var(--text); border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .mode-btn:hover, .mode-btn.active { background: var(--accent); }
        .content { width: 100%; max-width: 600px; }
        .flashcard { width: 100%; height: 300px; perspective: 1000px; cursor: pointer; margin-bottom: 1rem; }
        .flashcard-inner { width: 100%; height: 100%; position: relative; transform-style: preserve-3d;
            transition: transform 0.6s; }
        .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%;
            backface-visibility: hidden; display: flex; flex-direction: column;
            justify-content: center; align-items: center; padding: 2rem;
            background: var(--card-bg); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); }
        .flashcard-back { transform: rotateY(180deg); background: var(--accent); }
        .flashcard-front p, .flashcard-back p { font-size: 1.5rem; text-align: center; }
        .flip-hint { position: absolute; bottom: 1rem; font-size: 0.8rem; color: var(--text-muted); }
        .nav { display: flex; gap: 1rem; justify-content: center; align-items: center; margin-bottom: 1rem; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;
            background: var(--card-bg); color: var(--text); transition: all 0.3s; }
        .btn:hover { background: #222; }
        .btn-primary { background: var(--accent); }
        .btn-primary:hover { background: #7472f0; }
        .counter { color: var(--text-muted); }
        .actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .quiz-container { background: var(--card-bg); padding: 2rem; border-radius: 16px; }
        .quiz-question { margin: 1.5rem 0; font-size: 1.25rem; }
        .quiz-options { display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-option { padding: 1rem; border: 1px solid rgba(255,255,255,0.1); background: transparent;
            color: var(--text); border-radius: 8px; cursor: pointer; text-align: left;
            display: flex; align-items: center; gap: 1rem; transition: all 0.3s; }
        .quiz-option:hover { background: rgba(255,255,255,0.05); }
        .quiz-option.correct { background: #34c759; border-color: #34c759; }
        .quiz-option.incorrect { background: #ff453a; border-color: #ff453a; }
        .option-letter { width: 28px; height: 28px; border-radius: 50%; background: var(--accent);
            display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .progress-bar { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 0.5rem; }
        .progress-fill { height: 100%; background: var(--accent); border-radius: 3px; transition: width 0.3s; }
        .quiz-complete { text-align: center; padding: 3rem; }
        .quiz-complete h2 { margin: 1rem 0; }
        .quiz-score { font-size: 1.5rem; color: var(--accent); margin-bottom: 2rem; }
        .create-form { background: var(--card-bg); padding: 2rem; border-radius: 16px; margin-bottom: 2rem; }
        .create-form label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); }
        .create-form textarea { width: 100%; padding: 1rem; background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: var(--text);
            font-family: inherit; margin-bottom: 1rem; resize: vertical; }
        .cards-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .card-item { display: flex; justify-content: space-between; align-items: center;
            padding: 1rem; background: var(--card-bg); border-radius: 8px; }
        .card-preview { flex: 1; }
        .card-preview strong { display: block; margin-bottom: 0.25rem; }
        .card-preview span { color: var(--text-muted); font-size: 0.9rem; }
        .delete-btn { background: transparent; border: none; color: #ff453a; cursor: pointer; padding: 0.5rem; }
        .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
    </style>
</head>
<body>
    <h1>📚 StudyTech AI</h1>
    <p class="subtitle">Your Personal Study Assistant</p>
    
    <div class="mode-selector">
        <button class="mode-btn active" onclick="switchMode('flashcards')" id="mode-flashcards">📇 Flashcards</button>
        <button class="mode-btn" onclick="switchMode('quiz')" id="mode-quiz">✓ Quiz</button>
        <button class="mode-btn" onclick="switchMode('create')" id="mode-create">+ Create</button>
    </div>
    
    <div class="content" id="content"></div>

    <script>
        let flashcards = ${cards};
        let currentIndex = 0;
        let quizQuestions = [];
        let quizIndex = 0;
        let quizScore = 0;

        function persist() {
            localStorage.setItem('studytech_standalone_cards', JSON.stringify(flashcards));
        }

        function switchMode(mode) {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('mode-' + mode).classList.add('active');
            if (mode === 'flashcards') renderFlashcards();
            else if (mode === 'quiz') startQuiz();
            else if (mode === 'create') renderCreate();
        }

        function renderFlashcards() {
            if (flashcards.length === 0) {
                document.getElementById('content').innerHTML = '<div class="empty-state"><h3>No cards yet</h3><p>Create some flashcards to get started!</p></div>';
                return;
            }
            const card = flashcards[currentIndex];
            document.getElementById('content').innerHTML = \`
                <div class="flashcard" onclick="this.classList.toggle('flipped')" id="flashcard">
                    <div class="flashcard-inner">
                        <div class="flashcard-front"><p>\${card.front}</p><span class="flip-hint">Click to flip</span></div>
                        <div class="flashcard-back"><p>\${card.back}</p><span class="flip-hint">Click to flip</span></div>
                    </div>
                </div>
                <div class="nav">
                    <button class="btn" onclick="prevCard()">← Previous</button>
                    <span class="counter">\${currentIndex + 1} / \${flashcards.length}</span>
                    <button class="btn" onclick="nextCard()">Next →</button>
                </div>
                <div class="actions">
                    <button class="btn" onclick="speak()">🔊 Read Aloud</button>
                    <button class="btn" onclick="shuffle()">🔀 Shuffle</button>
                </div>
            \`;
        }

        function nextCard() { currentIndex = (currentIndex + 1) % flashcards.length; renderFlashcards(); }
        function prevCard() { currentIndex = currentIndex === 0 ? flashcards.length - 1 : currentIndex - 1; renderFlashcards(); }
        function shuffle() { flashcards.sort(() => Math.random() - 0.5); currentIndex = 0; renderFlashcards(); }
        function speak() {
            const card = flashcards[currentIndex];
            const isFlipped = document.getElementById('flashcard').classList.contains('flipped');
            const text = isFlipped ? card.back : card.front;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
            }
        }

        function startQuiz() {
            if (flashcards.length < 4) {
                document.getElementById('content').innerHTML = '<div class="empty-state"><h3>Need more cards</h3><p>You need at least 4 flashcards for a quiz.</p></div>';
                return;
            }
            quizQuestions = flashcards.map((card, idx) => {
                const wrong = flashcards.filter((_, i) => i !== idx).sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.back);
                return { question: card.front, correct: card.back, options: [...wrong, card.back].sort(() => Math.random() - 0.5) };
            }).sort(() => Math.random() - 0.5).slice(0, 5);
            quizIndex = 0; quizScore = 0;
            renderQuiz();
        }

        function renderQuiz() {
            if (quizIndex >= quizQuestions.length) {
                const pct = Math.round((quizScore / quizQuestions.length) * 100);
                document.getElementById('content').innerHTML = \`
                    <div class="quiz-complete">
                        <h2>🎉 Quiz Complete!</h2>
                        <p class="quiz-score">\${quizScore} / \${quizQuestions.length} (\${pct}%)</p>
                        <button class="btn btn-primary" onclick="startQuiz()">Try Again</button>
                    </div>
                \`;
                return;
            }
            const q = quizQuestions[quizIndex];
            document.getElementById('content').innerHTML = \`
                <div class="quiz-container">
                    <div>Question \${quizIndex + 1} of \${quizQuestions.length}
                        <div class="progress-bar"><div class="progress-fill" style="width: \${(quizIndex / quizQuestions.length) * 100}%"></div></div>
                    </div>
                    <div class="quiz-question">\${q.question}</div>
                    <div class="quiz-options">
                        \${q.options.map((opt, i) => \`<button class="quiz-option" onclick="checkAnswer('\${opt.replace(/'/g, "\\\\'")}')"><span class="option-letter">\${String.fromCharCode(65 + i)}</span>\${opt}</button>\`).join('')}
                    </div>
                </div>
            \`;
        }

        function checkAnswer(ans) {
            const q = quizQuestions[quizIndex];
            if (ans === q.correct) quizScore++;
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.disabled = true;
                if (opt.textContent.includes(q.correct)) opt.classList.add('correct');
                else if (opt.textContent.includes(ans) && ans !== q.correct) opt.classList.add('incorrect');
            });
            setTimeout(() => { quizIndex++; renderQuiz(); }, 1000);
        }

        function renderCreate() {
            document.getElementById('content').innerHTML = \`
                <div class="create-form">
                    <h3>Add New Card</h3>
                    <label>Front (Question)</label>
                    <textarea id="card-front" rows="2" placeholder="Question..."></textarea>
                    <label>Back (Answer)</label>
                    <textarea id="card-back" rows="2" placeholder="Answer..."></textarea>
                    <button class="btn btn-primary" onclick="addCard()" style="width:100%">+ Add Card</button>
                </div>
                <h3>Your Cards (\${flashcards.length})</h3>
                <div class="cards-list">
                    \${flashcards.map((c, i) => \`<div class="card-item"><div class="card-preview"><strong>\${c.front}</strong><span>\${c.back}</span></div><button class="delete-btn" onclick="deleteCard(\${i})">🗑</button></div>\`).join('')}
                </div>
            \`;
        }

        function addCard() {
            const front = document.getElementById('card-front').value.trim();
            const back = document.getElementById('card-back').value.trim();
            if (!front || !back) { alert('Fill both fields'); return; }
            flashcards.push({ front, back });
            persist();
            renderCreate();
        }

        function deleteCard(i) {
            flashcards.splice(i, 1);
            persist();
            renderCreate();
        }

        // Load saved cards on startup
        const saved = localStorage.getItem('studytech_standalone_cards');
        if (saved) flashcards = JSON.parse(saved);
        
        renderFlashcards();
    </script>
</body>
</html>`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Store.init();
    Router.init();
});
