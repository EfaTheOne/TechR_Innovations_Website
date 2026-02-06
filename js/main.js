// TechR Innovations Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add active state to current navigation link
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || currentPage === 'index.html') {
        currentPage = 'index.html';
    }
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    // Add animation on scroll for business cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('animate-initial');
                entry.target.classList.add('animate-visible');
            }
        });
    }, observerOptions);

    // Observe all business cards and feature items for animation
    // Items start with animate-initial (hidden) and transition to animate-visible when in view
    document.querySelectorAll('.business-card, .feature-item').forEach(card => {
        card.classList.add('animate-on-scroll', 'animate-initial');
        observer.observe(card);
    });

    // Console message
    console.log('TechR Innovations - Empowering businesses through technology');
});
