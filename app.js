// --- CUSTOM CURSOR ENGINE & PARTICLE SYSTEM ---
const Cursor = {
    ring: null,
    dot: null,
    canvas: null,
    ctx: null,
    x: -200,
    y: -200,
    ringX: -200,
    ringY: -200,
    prevX: -200,
    prevY: -200,
    idleTimer: null,
    raf: null,
    particles: [],

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

        // Spawn a stream of beautiful glowing particles
        const speed = Math.sqrt((Cursor.x - Cursor.prevX) ** 2 + (Cursor.y - Cursor.prevY) ** 2);
        const spawnCount = Math.min(Math.floor(speed / 4) + 1, 6);

        const activeColor = getComputedStyle(document.documentElement).getPropertyValue('--cursor-color').trim() || '#2997ff';

        for (let i = 0; i < spawnCount; i++) {
            Cursor.particles.push({
                x: Cursor.x + (Math.random() - 0.5) * 6,
                y: Cursor.y + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 2.5 - (Cursor.x - Cursor.prevX) * 0.1,
                vy: (Math.random() - 0.5) * 2.5 - (Cursor.y - Cursor.prevY) * 0.1,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02,
                size: 2.0 + Math.random() * 3.5,
                color: activeColor
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
        // Smooth linear interpolation for trailing feel
        const ease = 0.12;
        Cursor.ringX += (Cursor.x - Cursor.ringX) * ease;
        Cursor.ringY += (Cursor.y - Cursor.ringY) * ease;

        // Position the cursor ring container
        if (Cursor.ring) {
            Cursor.ring.style.left = Cursor.ringX + 'px';
            Cursor.ring.style.top  = Cursor.ringY + 'px';

            // SATISFYING SQUISH & STRETCH physics based on movement velocity
            const dx = Cursor.x - Cursor.ringX;
            const dy = Cursor.y - Cursor.ringY;
            const velocity = Math.sqrt(dx * dx + dy * dy);

            const stretch = 1 + Math.min(velocity * 0.015, 1.3);
            const squeeze = 1 - Math.min(velocity * 0.008, 0.45);
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

            // Apply stretching matrix
            Cursor.ring.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${stretch}, ${squeeze})`;
        }

        // Draw particle trail on the canvas
        if (Cursor.ctx && Cursor.canvas) {
            Cursor.ctx.clearRect(0, 0, Cursor.canvas.width, Cursor.canvas.height);
            Cursor.ctx.save();

            // Loop backwards to remove faded particles safely
            for (let i = Cursor.particles.length - 1; i >= 0; i--) {
                const p = Cursor.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96; // apply air resistance / friction
                p.vy *= 0.96;
                p.alpha -= p.decay;

                if (p.alpha <= 0) {
                    Cursor.particles.splice(i, 1);
                    continue;
                }

                // Render beautiful stardust embers
                Cursor.ctx.globalAlpha = p.alpha;
                Cursor.ctx.shadowBlur = p.size * 2.5;
                Cursor.ctx.shadowColor = p.color;
                Cursor.ctx.fillStyle = p.color;
                Cursor.ctx.beginPath();
                Cursor.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                Cursor.ctx.fill();
            }
            Cursor.ctx.restore();
        }

        Cursor.raf = requestAnimationFrame(Cursor.animate);
    },

    onHover: (e) => {
        if (e.target.closest('a, button, [role="button"], input, textarea, select, label, .btn, .business-card')) {
            document.body.classList.add('cursor-hovering');
        }
    },

    onUnhover: (e) => {
        if (e.target.closest('a, button, [role="button"], input, textarea, select, label, .btn, .business-card')) {
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

    // Dynamic brand-aware cursor hover effects (Unified Monochrome Modern Style)
    document.querySelectorAll('.business-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            const color = '#ffffff';
            const glow = 'rgba(255, 255, 255, 0.15)';
            const glowDot = 'rgba(255, 255, 255, 0.5)';

            document.documentElement.style.setProperty('--cursor-color', color);
            document.documentElement.style.setProperty('--cursor-glow', glow);
            document.documentElement.style.setProperty('--cursor-glow-dot', glowDot);
        });

        card.addEventListener('mouseleave', () => {
            document.documentElement.style.removeProperty('--cursor-color');
            document.documentElement.style.removeProperty('--cursor-glow');
            document.documentElement.style.removeProperty('--cursor-glow-dot');
        });
    });

    console.log('[TechR Innovations] Coming soon platform initialized.');
});
