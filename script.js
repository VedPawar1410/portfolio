/**
 * Portfolio - Professional JavaScript
 * Clean, minimal interactions with IntersectionObserver animations
 */

// ============================================
// UTILITIES
// ============================================

/**
 * Debounce function to limit rate of function calls
 */
function debounce(func, wait = 100) {
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

// ============================================
// YEAR DISPLAY
// ============================================

function initYearDisplay() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// ============================================
// CLIPBOARD FUNCTIONALITY
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
        textArea.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
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
function showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

/**
 * Initialize email copy functionality (hero section)
 */
function initEmailCopy() {
    const emailLink = document.getElementById('email-link');
    
    if (emailLink) {
        emailLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = 'vedpawar1410@gmail.com';
            const success = await copyToClipboard(email);
            
            if (success) {
                showToast('Email copied to clipboard');
            } else {
                showToast('Failed to copy email');
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
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const contactInfo = button.getAttribute('data-contact');
            const success = await copyToClipboard(contactInfo);
            
            if (success) {
                button.classList.add('copied');
                const contactType = contactInfo.includes('@') ? 'Email' : 'Phone';
                showToast(`${contactType} copied to clipboard`);
                
                setTimeout(() => {
                    button.classList.remove('copied');
                }, 1500);
            } else {
                showToast('Copy failed. Please try again.');
            }
        });
    });
}

// ============================================
// HEADER SCROLL BEHAVIOR
// ============================================

function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };
    
    window.addEventListener('scroll', debounce(handleScroll, 10));
    handleScroll(); // Initial check
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (!menuBtn || !nav) return;
    
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
    
    // Close menu when clicking nav links
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuBtn.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
            nav.classList.remove('active');
            menuBtn.classList.remove('active');
        }
    });
}

// ============================================
// SMOOTH SCROLL NAVIGATION
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// ACTIVE NAVIGATION HIGHLIGHT
// ============================================

function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    if (sections.length === 0 || navLinks.length === 0) return;
    
    const observerOptions = {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => observer.observe(section));
}

// ============================================
// SCROLL ANIMATIONS (IntersectionObserver)
// ============================================

function initScrollAnimations() {
    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    
    // Animate grid items with stagger
    const gridItems = document.querySelectorAll(`
        .project-card,
        .certification-card,
        .about-card,
        .contact-card,
        .timeline-item
    `);
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    // Observer for section headers
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                headerObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    sectionHeaders.forEach(header => {
        header.classList.add('fade-up');
        headerObserver.observe(header);
    });
    
    // Observer for grid items with staggered animation
    const itemObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Calculate delay based on position in visible entries
                const delay = Array.from(gridItems).indexOf(entry.target) % 3 * 100;
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                
                itemObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    gridItems.forEach(item => {
        itemObserver.observe(item);
    });
}

// ============================================
// IMAGE MODAL
// ============================================

function initImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImage = modal?.querySelector('.modal-image');
    const closeBtn = modal?.querySelector('.modal-close');
    
    if (!modal || !modalImage) return;
    
    // Open modal when clicking on project images
    document.querySelectorAll('.project-card img, .hero-photo').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            modalImage.src = img.src;
            modalImage.alt = img.alt;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    closeBtn?.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ============================================
// PERFORMANCE: Lazy Loading Images
// ============================================

function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window && images.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// ============================================
// FOCUS TRAP FOR MODALS (Accessibility)
// ============================================

function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Core functionality
    initYearDisplay();
    initEmailCopy();
    initCopyableContacts();
    
    // Navigation
    initHeaderScroll();
    initMobileMenu();
    initSmoothScroll();
    initActiveNavigation();
    
    // Animations
    initScrollAnimations();
    
    // Features
    initImageModal();
    initLazyLoading();
    
    // Accessibility - trap focus in modal
    const modal = document.getElementById('image-modal');
    if (modal) trapFocus(modal);
});

// Handle visibility change (pause animations when tab is hidden)
document.addEventListener('visibilitychange', () => {
    const isHidden = document.hidden;
    document.body.style.setProperty('--animation-play-state', isHidden ? 'paused' : 'running');
});
