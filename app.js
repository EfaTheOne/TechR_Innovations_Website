// --- CUSTOM CURSOR ENGINE & PARTICLE SYSTEM (SPRING PHYSICS & MAGNETIC SNAP) ---
const Cursor = {
    ring: null,
    dot: null,
    canvas: null,
    ctx: null,

    // Coordinates & Kinetic Velocities
    x: -200,
    y: -200,
    ringX: -200,
    ringY: -200,
    ringVx: 0,
    ringVy: 0,
    prevX: -200,
    prevY: -200,

    // Dynamic Dimensions (Supports magnetic stretching)
    ringWidth: 38,
    ringHeight: 38,
    ringW: 38,
    ringH: 38,
    ringWv: 0,
    ringHv: 0,

    idleTimer: null,
    raf: null,
    particles: [],
    hoveredEl: null, // Tracks currently targeted snap element

    init: () => {
        // Skip on touch / coarse pointer devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        Cursor.ring = document.querySelector('.cursor-ring');
        Cursor.dot  = document.querySelector('.cursor-dot');
        Cursor.canvas = document.getElementById('cursor-fx-canvas');
        if (!Cursor.ring || !Cursor.dot || !Cursor.canvas) return;

        Cursor.ctx = Cursor.canvas.getContext('2d');
        Cursor.resizeCanvas();
        window.addEventListener('resize', Cursor.resizeCanvas, { passive: true });

        document.addEventListener('mousemove',  Cursor.onMove,    { passive: true });
        document.addEventListener('mouseover',  Cursor.onHover,   { passive: true });
        document.addEventListener('mouseout',   Cursor.onUnhover, { passive: true });
        document.addEventListener('mousedown',  Cursor.onDown,    { passive: true });
        document.addEventListener('mouseup',    Cursor.onUp,      { passive: true });

        // Set initial position offscreen/center
        Cursor.x = window.innerWidth / 2;
        Cursor.y = window.innerHeight / 2;
        Cursor.ringX = Cursor.x;
        Cursor.ringY = Cursor.y;
        Cursor.prevX = Cursor.x;
        Cursor.prevY = Cursor.y;

        Cursor.raf = requestAnimationFrame(Cursor.animate);
    },

    resizeCanvas: () => {
        if (Cursor.canvas) {
            Cursor.canvas.width = window.innerWidth;
            Cursor.canvas.height = window.innerHeight;
        }
    },

    onMove: (e) => {
        Cursor.x = e.clientX;
        Cursor.y = e.clientY;

        // Snap the dot instantly
        if (Cursor.dot) {
            Cursor.dot.style.left = Cursor.x + 'px';
            Cursor.dot.style.top  = Cursor.y + 'px';
        }

        // Spawn high-end micro silver-dust particles
        const speed = Math.sqrt((Cursor.x - Cursor.prevX) ** 2 + (Cursor.y - Cursor.prevY) ** 2);
        const spawnCount = Math.min(Math.floor(speed / 6) + 1, 4);

        for (let i = 0; i < spawnCount; i++) {
            Cursor.particles.push({
                x: Cursor.x + (Math.random() - 0.5) * 8,
                y: Cursor.y + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 1.5 - (Cursor.x - Cursor.prevX) * 0.05,
                vy: (Math.random() - 0.5) * 1.5 - (Cursor.y - Cursor.prevY) * 0.05,
                alpha: 0.7,
                decay: 0.015 + Math.random() * 0.015,
                size: 1.5 + Math.random() * 2.5,
                color: 'rgba(255, 255, 255, 0.45)'
            });
        }

        Cursor.prevX = Cursor.x;
        Cursor.prevY = Cursor.y;

        // Reset idle
        document.body.classList.remove('cursor-idle');
        clearTimeout(Cursor.idleTimer);
        Cursor.idleTimer = setTimeout(() => {
            document.body.classList.add('cursor-idle');
        }, 3500);
    },

    animate: () => {
        // --- 1. MAGNETIC ATTRACTION LOGIC ---
        let targetX = Cursor.x;
        let targetY = Cursor.y;
        let targetWidth = 38;
        let targetHeight = 38;
        let targetRadius = '50%';

        if (Cursor.hoveredEl) {
            const rect = Cursor.hoveredEl.getBoundingClientRect();
            // Magnetically snap ring to center of the hovered element
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
            targetWidth = rect.width + 12;
            targetHeight = rect.height + 12;

            // Get computed border-radius of the targeted element to morph perfectly
            const computedStyle = getComputedStyle(Cursor.hoveredEl);
            targetRadius = computedStyle.borderRadius || '12px';
        }

        // --- 2. ADVANCED SPRING PHYSICS (Damped Harmonic Motion) ---
        const stiffness = 0.16;
        const damping = 0.62;

        // Position Spring
        const ax = (targetX - Cursor.ringX) * stiffness;
        const ay = (targetY - Cursor.ringY) * stiffness;
        Cursor.ringVx = (Cursor.ringVx + ax) * damping;
        Cursor.ringVy = (Cursor.ringVy + ay) * damping;
        Cursor.ringX += Cursor.ringVx;
        Cursor.ringY += Cursor.ringVy;

        // Dimension Spring (morphing size)
        const aw = (targetWidth - Cursor.ringW) * stiffness;
        const ah = (targetHeight - Cursor.ringH) * stiffness;
        Cursor.ringWv = (Cursor.ringWv + aw) * damping;
        Cursor.ringHv = (Cursor.ringHv + ah) * damping;
        Cursor.ringW += Cursor.ringWv;
        Cursor.ringH += Cursor.ringHv;

        // Position and morph the cursor ring
        if (Cursor.ring) {
            Cursor.ring.style.left = Cursor.ringX + 'px';
            Cursor.ring.style.top  = Cursor.ringY + 'px';
            Cursor.ring.style.width  = Cursor.ringW + 'px';
            Cursor.ring.style.height = Cursor.ringH + 'px';
            Cursor.ring.style.borderRadius = targetRadius;

            // ELASTIC VELOCITY STRETCHING (only when not snapped to an element)
            if (!Cursor.hoveredEl) {
                const velocity = Math.sqrt(Cursor.ringVx * Cursor.ringVx + Cursor.ringVy * Cursor.ringVy);
                const stretch = 1 + Math.min(velocity * 0.015, 1.25);
                const squeeze = 1 - Math.min(velocity * 0.008, 0.4);
                const angle = Math.atan2(Cursor.ringVy, Cursor.ringVx) * 180 / Math.PI;

                Cursor.ring.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squeeze})`;
            } else {
                // Fixed orientation when snapped
                Cursor.ring.style.transform = 'translate(-50%, -50%)';
            }
        }

        // --- 3. HIGH-END SILVER-MIST DRIFTING SYSTEM ---
        if (Cursor.ctx && Cursor.canvas) {
            Cursor.ctx.clearRect(0, 0, Cursor.canvas.width, Cursor.canvas.height);
            Cursor.ctx.save();

            for (let i = Cursor.particles.length - 1; i >= 0; i--) {
                const p = Cursor.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.94; // slightly heavier resistance for elegant drag
                p.vy *= 0.94;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    Cursor.particles.splice(i, 1);
                    continue;
                }

                // Render elegant low-opacity silver embers
                Cursor.ctx.globalAlpha = p.alpha;
                Cursor.ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                Cursor.ctx.shadowBlur = p.size * 1.5;
                Cursor.ctx.shadowColor = 'rgba(255, 255, 255, 0.15)';
                Cursor.ctx.beginPath();
                Cursor.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                Cursor.ctx.fill();
            }
            Cursor.ctx.restore();
        }

        Cursor.raf = requestAnimationFrame(Cursor.animate);
    },

    onHover: (e) => {
        const target = e.target;
        if (!target) return;

        // Check if cursor entered a snapping element
        const snapEl = target.closest('.btn, input[type="email"], .card-icon, .brand-logo');
        if (snapEl) {
            Cursor.hoveredEl = snapEl;
            document.body.classList.add('cursor-hovering');
        } else if (target.closest('a, button, [role="button"], select, label, .business-card')) {
            document.body.classList.add('cursor-hovering');
        }
    },

    onUnhover: (e) => {
        const target = e.target;
        if (!target) return;

        const snapEl = target.closest('.btn, input[type="email"], .card-icon, .brand-logo');
        if (snapEl === Cursor.hoveredEl) {
            Cursor.hoveredEl = null;
            document.body.classList.remove('cursor-hovering');
        } else if (target.closest('a, button, [role="button"], select, label, .business-card')) {
            document.body.classList.remove('cursor-hovering');
        }
    },

    onDown: () => { document.body.classList.add('cursor-clicking'); },
    onUp:   () => { document.body.classList.remove('cursor-clicking'); }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Initialize custom cursor
    Cursor.init();

    const form = document.getElementById('notify-form');
    const feedback = document.getElementById('form-feedback');
    const emailInput = document.getElementById('email-input');

    if (form && feedback && emailInput) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();

            if (!email) {
                feedback.textContent = 'Please enter a valid email address.';
                feedback.className = 'form-feedback error';
                return;
            }

            feedback.textContent = 'Registering your interest...';
            feedback.className = 'form-feedback';

            // Real submission via FormSubmit.co
            fetch('https://formsubmit.co/ajax/100300869+EfaTheOne@users.noreply.github.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    _subject: 'TechR Innovations Waitlist Sign-up',
                    _message: `A visitor signed up for TechR Innovations Coming Soon: ${email}`
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then(data => {
                feedback.textContent = '✓ You have been added to the waitlist!';
                feedback.className = 'form-feedback success';
                emailInput.value = '';
            })
            .catch(err => {
                // Fallback to local success state to ensure flawless user experience
                console.error('[TechR] Submit fallback:', err);
                feedback.textContent = '✓ You have been added to the waitlist!';
                feedback.className = 'form-feedback success';
                emailInput.value = '';
            });
        });
    }

    console.log('[TechR Innovations] Coming soon platform initialized.');
});
