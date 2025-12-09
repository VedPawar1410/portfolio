/**
 * Debounce function to limit rate of function calls
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
        rect.bottom >= offset
    );
}

// ============================================
// 2. YEAR DISPLAY
// ============================================

function initYearDisplay() {
    const yearDisplay = document.getElementById('year');
    if (yearDisplay) {
        yearDisplay.textContent = new Date().getFullYear();
    }
}

// ============================================
// 3. CLIPBOARD FUNCTIONALITY
// ============================================

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (fallbackErr) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * Show toast notification
 */
function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Initialize email link copy functionality (legacy)
 */
function initEmailCopy() {
    const emailLink = document.getElementById('email-link');
    
    if (emailLink) {
        emailLink.addEventListener('click', async function(e) {
            e.preventDefault();
            const email = 'vedpawar1410@gmail.com';
            const success = await copyToClipboard(email);
            
            if (success) {
                showToast('Email copied');
            }
        });
    }
}

/**
 * Initialize copyable contact buttons
 */
function initCopyableContacts() {
    const copyableButtons = document.querySelectorAll('.contact-copyable');
    
    copyableButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const contactInfo = this.getAttribute('data-contact');
            const success = await copyToClipboard(contactInfo);
            
            if (success) {
                // Add copied class for animation
                this.classList.add('copied');
                
                // Show toast notification
                const contactType = contactInfo.includes('@') ? 'Email' : 'Phone';
                showToast(`${contactType} copied to clipboard!`);
                
                // Remove copied class after animation
                setTimeout(() => {
                    this.classList.remove('copied');
                }, 600);
            } else {
                showToast('Copy failed. Please try again.');
            }
        });
    });
}

// ============================================
// 4. PROJECT CAROUSEL
// ============================================

class ProjectCarousel {
    constructor() {
        this.navDots = document.querySelectorAll('.nav-dot');
        this.projectSlides = document.querySelectorAll('.project-slide');
        this.prevArrow = document.querySelector('.carousel-arrow-prev');
        this.nextArrow = document.querySelector('.carousel-arrow-next');
        this.currentSlide = 0;
        this.totalSlides = this.projectSlides.length;
        
        this.init();
    }
    
    init() {
        if (this.totalSlides === 0) return;
        
        // Add click handlers to navigation dots
        this.navDots.forEach((dot) => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.getAttribute('data-slide'));
                this.showSlide(slideIndex);
            });
        });
        
        // Add click handlers to arrow buttons
        if (this.prevArrow) {
            this.prevArrow.addEventListener('click', () => this.showPrevSlide());
        }
        if (this.nextArrow) {
            this.nextArrow.addEventListener('click', () => this.showNextSlide());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.showPrevSlide();
            if (e.key === 'ArrowRight') this.showNextSlide();
        });
    }
    
    showSlide(index) {
        // Ensure index is within bounds
        if (index < 0) {
            index = this.totalSlides - 1;
        } else if (index >= this.totalSlides) {
            index = 0;
        }
        
        this.currentSlide = index;
        
        // Hide all slides
        this.projectSlides.forEach(slide => {
            slide.classList.remove('active');
            // Add fade out animation
            slide.style.opacity = '0';
        });
        
        // Remove active class from all dots
        this.navDots.forEach(dot => dot.classList.remove('active'));
        
        // Show selected slide with fade in
        if (this.projectSlides[index]) {
            setTimeout(() => {
                this.projectSlides[index].classList.add('active');
                this.projectSlides[index].style.opacity = '1';
            }, 150);
        }
        
        // Add active class to selected dot in all slides
        this.navDots.forEach((dot) => {
            if (parseInt(dot.getAttribute('data-slide')) === index) {
                dot.classList.add('active');
            }
        });
    }
    
    showNextSlide() {
        this.showSlide(this.currentSlide + 1);
    }
    
    showPrevSlide() {
        this.showSlide(this.currentSlide - 1);
    }
}

// ============================================
// 5. ABOUT CAROUSEL
// ============================================

class AboutCarousel {
    constructor() {
        this.aboutCards = document.querySelectorAll('.about-card');
        this.aboutTrack = document.querySelector('.about-carousel-track');
        this.aboutPrevBtn = document.querySelector('.about-arrow-prev');
        this.aboutNextBtn = document.querySelector('.about-arrow-next');
        this.currentAboutIndex = 1; // Start with middle card
        this.totalAboutCards = this.aboutCards.length;
        
        this.init();
    }
    
    init() {
        if (this.totalAboutCards === 0) return;
        
        // Wait for DOM to be fully rendered
        setTimeout(() => {
            this.updateCarousel();
        }, 100);
        
        // Add event listeners
        if (this.aboutNextBtn) {
            this.aboutNextBtn.addEventListener('click', () => this.showNextCard());
        }
        if (this.aboutPrevBtn) {
            this.aboutPrevBtn.addEventListener('click', () => this.showPrevCard());
        }
        
        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.updateCarousel();
        }, 250));
        
        // Touch/swipe support
        this.initTouchSupport();
    }
    
    updateCarousel() {
        // Update active class
        this.aboutCards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === this.currentAboutIndex) {
                card.classList.add('active');
            }
        });
        
        // Calculate transform offset to center the active card
        if (this.aboutCards.length > 0 && this.aboutTrack) {
            const cardWidth = this.aboutCards[0].offsetWidth;
            const gap = 48; // 3rem = 48px
            const containerWidth = this.aboutTrack.parentElement.offsetWidth;
            
            // Calculate position to center the active card
            const totalCardWidth = cardWidth + gap;
            const startPosition = (containerWidth / 2) - (cardWidth / 2);
            const offset = startPosition - (this.currentAboutIndex * totalCardWidth);
            
            this.aboutTrack.style.transform = `translateX(${offset}px)`;
        }
    }
    
    showNextCard() {
        this.currentAboutIndex = (this.currentAboutIndex + 1) % this.totalAboutCards;
        this.updateCarousel();
    }
    
    showPrevCard() {
        this.currentAboutIndex = (this.currentAboutIndex - 1 + this.totalAboutCards) % this.totalAboutCards;
        this.updateCarousel();
    }
    
    initTouchSupport() {
        if (!this.aboutTrack) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        this.aboutTrack.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.aboutTrack.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;
        });
        
        this.aboutTrack.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const diff = startX - currentX;
            if (Math.abs(diff) > 50) { // Minimum swipe distance
                if (diff > 0) {
                    this.showNextCard();
                } else {
                    this.showPrevCard();
                }
            }
            
            isDragging = false;
        });
    }
}

// ============================================
// 6. IMAGE MODAL
// ============================================

class ImageModal {
    constructor() {
        this.imageModal = document.getElementById('image-modal');
        this.modalContent = this.imageModal?.querySelector('.modal-image-placeholder');
        this.modalCloseBtn = this.imageModal?.querySelector('.modal-close-btn');
        this.expandButtons = document.querySelectorAll('.expand-image-btn');
        
        this.init();
    }
    
    init() {
        if (!this.imageModal) return;
        
        // Expand button handlers
        this.expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageContainer = button.closest('.project-image-container');
                const imagePlaceholder = imageContainer.querySelector('.project-image-placeholder');
                const imageText = imagePlaceholder.textContent;
                
                // Copy content to modal
                this.modalContent.textContent = imageText;
                this.modalContent.style.background = window.getComputedStyle(imagePlaceholder).background;
                
                // Show modal
                this.openModal();
            });
        });
        
        // Close button handler
        if (this.modalCloseBtn) {
            this.modalCloseBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Click outside to close
        this.imageModal.addEventListener('click', (e) => {
            if (e.target === this.imageModal) {
                this.closeModal();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.imageModal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }
    
    openModal() {
        this.imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeModal() {
        this.imageModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// 7. SCROLL ANIMATIONS
// ============================================

class ScrollAnimations {
    constructor() {
        this.animatedElements = [];
        this.init();
    }
    
    init() {
        // Add animation classes to elements
        this.setupAnimations();
        
        // Initial check
        this.checkAnimations();
        
        // Listen to scroll events
        window.addEventListener('scroll', debounce(() => {
            this.checkAnimations();
        }, 50));
        
        // Check on resize
        window.addEventListener('resize', debounce(() => {
            this.checkAnimations();
        }, 100));
    }
    
    setupAnimations() {
        // Animate section headers
        document.querySelectorAll('.section-header').forEach((el, index) => {
            el.classList.add('fade-in');
            this.animatedElements.push({ element: el, delay: 0 });
        });
        
        // Animate cards with stagger
        document.querySelectorAll('.experience-card').forEach((el, index) => {
            el.classList.add('scale-in');
            this.animatedElements.push({ element: el, delay: index * 100 });
        });
        
        document.querySelectorAll('.certification-card').forEach((el, index) => {
            el.classList.add('scale-in');
            this.animatedElements.push({ element: el, delay: index * 100 });
        });
        
        // Animate contact icons with stagger
        document.querySelectorAll('.contact-icon-link').forEach((el, index) => {
            el.classList.add('stagger-item');
            this.animatedElements.push({ element: el, delay: index * 80 });
        });
        
        // Animate hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const heroElements = heroContent.querySelectorAll('h1, .hero-subtitle, .hero-actions, .social-links');
            heroElements.forEach((el, index) => {
                el.classList.add('fade-in');
                this.animatedElements.push({ element: el, delay: index * 150 });
            });
        }
        
        // Animate hero photo
        const heroPhoto = document.querySelector('.hero-illustration');
        if (heroPhoto) {
            heroPhoto.classList.add('slide-in-right');
            this.animatedElements.push({ element: heroPhoto, delay: 200 });
        }
    }
    
    checkAnimations() {
        this.animatedElements.forEach(({ element, delay }) => {
            if (isInViewport(element, 100) && !element.classList.contains('visible')) {
                setTimeout(() => {
                    element.classList.add('visible');
                }, delay);
            }
        });
    }
}

// ============================================
// 8. SMOOTH NAVIGATION
// ============================================

function initSmoothNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or "#contact" without a target
            if (href === '#' || href === '#contact') {
                const target = document.querySelector(href);
                if (!target) return;
            }
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// 9. ENHANCED INTERACTIONS
// ============================================

function initEnhancedInteractions() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn, .logo-button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (hero.querySelector('::before')) {
                hero.style.setProperty('--parallax-offset', `${rate}px`);
            }
        });
    }
    
    // Add hover sound effect (visual feedback)
    document.querySelectorAll('.btn, .card, .social-link').forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.setProperty('--hover-time', Date.now());
        });
    });
}

// ============================================
// 10. NAVIGATION HIGHLIGHT & HEADER SCROLL
// ============================================

class NavigationHighlight {
    constructor() {
        this.sections = document.querySelectorAll('section[id]');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        this.header = document.querySelector('.top-header');
        this.lastScrollTop = 0;
        this.init();
    }
    
    init() {
        window.addEventListener('scroll', debounce(() => {
            this.highlightNavigation();
            this.handleHeaderScroll();
        }, 50));
    }
    
    highlightNavigation() {
        const scrollPosition = window.scrollY + 200;
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    handleHeaderScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > 50) {
            this.header?.classList.add('scrolled');
        } else {
            this.header?.classList.remove('scrolled');
        }
        
        this.lastScrollTop = scrollTop;
    }
}

// ============================================
// 11. PERFORMANCE OPTIMIZATIONS
// ============================================

// Lazy load images when they come into viewport
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// 12. INITIALIZATION
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Portfolio initialized');
    
    // Initialize all components
    initYearDisplay();
    initEmailCopy();
    initCopyableContacts();
    initSmoothNavigation();
    initEnhancedInteractions();
    initLazyLoading();
    
    // Initialize carousels
    new ProjectCarousel();
    new AboutCarousel();
    
    // Initialize modal
    new ImageModal();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Initialize navigation highlight
    new NavigationHighlight();
    
    console.log('✨ All features loaded successfully');
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 Page hidden');
    } else {
        console.log('👀 Page visible');
    }
});
