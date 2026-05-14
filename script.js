/**
 * script.js — Gushwork Web Assignment
 * Author: Nitesh Kumar Singh
 *
 * Sections:
 *  1. Sticky Header  — slides in ABOVE the navbar after scrolling past hero
 *  2. Mobile Menu    — hamburger toggle with animated X
 *  3. Image Carousel — multi-card, prev/next, dots, auto-play, swipe
 *  4. Zoom Modal     — lightbox on carousel image click
 *  5. Contact Form   — client-side validation with inline errors
 *  6. Smooth Scroll  — native smooth scroll for anchor links
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initStickyHeader();
    initMobileMenu();
    initCarousel();
    initZoomModal();
    initContactForm();
    initSmoothScroll();
});


/* ============================================================
   1. STICKY HEADER
   The sticky header sits ABOVE the navbar.
   - Slides down (top: 0) after scrolling past 60% of the hero
   - Slides back up when near the top
   - Adds/removes body class so the navbar shifts down too
   ============================================================ */
function initStickyHeader() {

    const stickyHeader = document.getElementById('stickyHeader');
    const hero         = document.getElementById('hero');
    const body         = document.body;

    if (!stickyHeader || !hero) return;

    let ticking = false;

    function updateHeader() {
        // heroBottom = absolute Y position of the bottom of the hero
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        const scrollY    = window.scrollY;
        const threshold  = heroBottom * 0.6;

        if (scrollY > threshold) {
            stickyHeader.classList.add('is-visible');
            body.classList.add('header-visible');
        } else {
            stickyHeader.classList.remove('is-visible');
            body.classList.remove('header-visible');
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}


/* ============================================================
   2. MOBILE MENU
   - Hamburger toggles the mobile drawer
   - Any nav link click closes the drawer
   - Outside click closes the drawer
   ============================================================ */
function initMobileMenu() {

    const hamburger    = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (!hamburger || !mobileDrawer) return;

    function openMenu() {
        hamburger.classList.add('is-open');
        mobileDrawer.classList.add('is-open');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        hamburger.classList.remove('is-open');
        mobileDrawer.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
        hamburger.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    // Close on nav link click
    mobileDrawer.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileDrawer.contains(e.target)) {
            closeMenu();
        }
    });
}


/* ============================================================
   3. IMAGE CAROUSEL
   Multi-card layout: shows 3 cards on desktop, 2 on tablet, 1 on mobile.
   The track moves by one slide-width per click.
   - Prev / Next buttons
   - Dot indicators (one per slide, not per page)
   - Auto-play every 4s, pauses on hover
   - Keyboard arrow keys
   - Touch swipe support
   ============================================================ */
function initCarousel() {

    const track    = document.getElementById('carouselTrack');
    const viewport = document.getElementById('carouselViewport');
    const prevBtn  = document.getElementById('prevBtn');
    const nextBtn  = document.getElementById('nextBtn');
    const dotsWrap = document.getElementById('carouselDots');

    if (!track) return;

    const slides      = Array.from(track.querySelectorAll('.carousel-slide'));
    const totalSlides = slides.length;
    let   currentIdx  = 0;
    let   autoTimer   = null;

    /* --- Build dot indicators --- */
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => { goTo(i); resetAutoPlay(); });
        dotsWrap.appendChild(dot);
    });

    const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

    /* --- Calculate how many slides are visible at current viewport --- */
    function getVisibleCount() {
        const vw = window.innerWidth;
        if (vw <= 768)  return 1;
        if (vw <= 1024) return 2;
        return 3;
    }

    /* --- Move to a specific slide index --- */
    function goTo(index) {
        const visibleCount = getVisibleCount();
        const maxIndex     = totalSlides - visibleCount;

        // Clamp index
        if (index < 0)          index = 0;
        if (index > maxIndex)   index = maxIndex;

        currentIdx = index;

        // Each slide width = (viewport width - gaps) / visibleCount
        // We use CSS percentage: each slide is min-width set by CSS.
        // We move by one slide's percentage of the full track.
        const slideWidthPercent = 100 / totalSlides;
        track.style.transform = `translateX(-${currentIdx * slideWidthPercent}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            const active = i === currentIdx;
            dot.classList.toggle('is-active', active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        // Disable buttons at boundaries
        prevBtn.disabled = currentIdx === 0;
        nextBtn.disabled = currentIdx >= maxIndex;
    }

    /* --- Button listeners --- */
    prevBtn.addEventListener('click', () => { goTo(currentIdx - 1); resetAutoPlay(); });
    nextBtn.addEventListener('click', () => { goTo(currentIdx + 1); resetAutoPlay(); });

    /* --- Keyboard navigation --- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  { goTo(currentIdx - 1); resetAutoPlay(); }
        if (e.key === 'ArrowRight') { goTo(currentIdx + 1); resetAutoPlay(); }
    });

    /* --- Auto-play --- */
    function startAutoPlay() {
        autoTimer = setInterval(() => {
            const visibleCount = getVisibleCount();
            const maxIndex     = totalSlides - visibleCount;
            // Loop back to start when at end
            goTo(currentIdx >= maxIndex ? 0 : currentIdx + 1);
        }, 4000);
    }

    function stopAutoPlay()  { clearInterval(autoTimer); }
    function resetAutoPlay() { stopAutoPlay(); startAutoPlay(); }

    startAutoPlay();

    viewport.addEventListener('mouseenter', stopAutoPlay);
    viewport.addEventListener('mouseleave', startAutoPlay);

    /* --- Recalculate on resize --- */
    window.addEventListener('resize', () => { goTo(currentIdx); }, { passive: true });

    /* --- Touch / Swipe --- */
    let touchStartX = 0;

    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goTo(currentIdx + 1) : goTo(currentIdx - 1);
            resetAutoPlay();
        }
    }, { passive: true });

    // Initial state
    goTo(0);
}


/* ============================================================
   4. ZOOM MODAL (Lightbox)
   Click any carousel image → opens full-screen zoomed view.
   Close via X button, backdrop click, or Escape key.
   ============================================================ */
function initZoomModal() {

    const modal        = document.getElementById('zoomModal');
    const modalImg     = document.getElementById('zoomModalImg');
    const modalCaption = document.getElementById('zoomModalCaption');
    const closeBtn     = document.getElementById('zoomClose');
    const backdrop     = document.getElementById('zoomBackdrop');

    if (!modal) return;

    function openModal(src, alt, caption) {
        modalImg.src             = src;
        modalImg.alt             = alt;
        modalCaption.textContent = caption || '';
        modal.hidden             = false;
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
    }

    function closeModal() {
        modal.hidden             = true;
        modalImg.src             = '';
        document.body.style.overflow = '';
    }

    // Attach click to every zoom container
    document.querySelectorAll('.zoom-container').forEach(container => {
        container.addEventListener('click', () => {
            const img     = container.querySelector('.carousel-img');
            const caption = container.closest('.carousel-slide')
                                     ?.querySelector('.slide-caption h3')
                                     ?.textContent || '';
            openModal(img.src, img.alt, caption);
        });
    });

    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
}


/* ============================================================
   5. CONTACT FORM — Client-side validation
   Validates name, email, message with inline error messages.
   Shows success confirmation on valid submit.
   ============================================================ */
function initContactForm() {

    const form       = document.getElementById('contactForm');
    const successMsg = document.getElementById('formSuccess');

    if (!form) return;

    function validateField(name, value) {
        switch (name) {
            case 'name':
                if (!value.trim())           return 'Name is required.';
                if (value.trim().length < 2) return 'Name must be at least 2 characters.';
                return '';
            case 'email':
                if (!value.trim())           return 'Email is required.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
                    return 'Please enter a valid email address.';
                return '';
            case 'message':
                if (!value.trim())            return 'Message is required.';
                if (value.trim().length < 10) return 'Message must be at least 10 characters.';
                return '';
            default:
                return '';
        }
    }

    function setError(fieldId, message) {
        const input = document.getElementById(fieldId);
        const error = document.getElementById(fieldId + 'Error');
        if (!input || !error) return;
        if (message) {
            input.classList.add('is-error');
            error.textContent = message;
        } else {
            input.classList.remove('is-error');
            error.textContent = '';
        }
    }

    // Live validation on blur + clear on input
    ['name', 'email', 'message'].forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return;

        input.addEventListener('blur', () => {
            setError(fieldId, validateField(fieldId, input.value));
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('is-error')) {
                setError(fieldId, validateField(fieldId, input.value));
            }
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let isValid = true;
        ['name', 'email', 'message'].forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const error = validateField(fieldId, input ? input.value : '');
            setError(fieldId, error);
            if (error) isValid = false;
        });

        if (!isValid) return;

        successMsg.hidden = false;
        form.reset();
        setTimeout(() => { successMsg.hidden = true; }, 5000);
    });
}


/* ============================================================
   6. SMOOTH SCROLL
   Native smooth scroll for all anchor links.
   ============================================================ */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}
