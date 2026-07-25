document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

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

            // Simulate server submission
            feedback.textContent = 'Registering your interest...';
            feedback.className = 'form-feedback';

            setTimeout(() => {
                feedback.textContent = '✓ You have been added to the waitlist!';
                feedback.className = 'form-feedback success';
                emailInput.value = '';
            }, 1000);
        });
    }

    console.log('[TechR Innovations] Coming soon platform initialized.');
});
