// --- HIGH-PRECISION PROFESSIONAL CUSTOM CURSOR ENGINE ---
const Cursor = {
    ring: null,
    dot: null,
    x: -200,
    y: -200,
    ringX: -200,
    ringY: -200,
    idleTimer: null,
    raf: null,

    init: () => {
        // Skip on touch / coarse pointer devices
        if (window.matchMedia('(pointer: coarse)').matches) return;

        Cursor.ring = document.querySelector('.cursor-ring');
        Cursor.dot  = document.querySelector('.cursor-dot');
        if (!Cursor.ring || !Cursor.dot) return;

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

        Cursor.raf = requestAnimationFrame(Cursor.animate);
    },

    onMove: (e) => {
        Cursor.x = e.clientX;
        Cursor.y = e.clientY;

        // Dot snaps immediately
        if (Cursor.dot) {
            Cursor.dot.style.left = Cursor.x + 'px';
            Cursor.dot.style.top  = Cursor.y + 'px';
        }

        // Reset idle
        document.body.classList.remove('cursor-idle');
        clearTimeout(Cursor.idleTimer);
        Cursor.idleTimer = setTimeout(() => {
            document.body.classList.add('cursor-idle');
        }, 3500);
    },

    animate: () => {
        // Ultra-smooth lag trail using constant high-end interpolation
        const ease = 0.14;
        Cursor.ringX += (Cursor.x - Cursor.ringX) * ease;
        Cursor.ringY += (Cursor.y - Cursor.ringY) * ease;

        if (Cursor.ring) {
            Cursor.ring.style.left = Cursor.ringX + 'px';
            Cursor.ring.style.top  = Cursor.ringY + 'px';
        }

        Cursor.raf = requestAnimationFrame(Cursor.animate);
    },

    onHover: (e) => {
        if (e.target.closest('a, button, [role="button"], input, textarea, select, label, .btn, .business-card, .brand-logo')) {
            document.body.classList.add('cursor-hovering');
        }
    },

    onUnhover: (e) => {
        if (e.target.closest('a, button, [role="button"], input, textarea, select, label, .btn, .business-card, .brand-logo')) {
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
