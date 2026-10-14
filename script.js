/**
 * ==============================================================================
 * PORTFOLIO CLIENT ENGINE: ADARSH KUMAR SINGH (Digital Designer & Developer)
 * ==============================================================================
 * Vanilla JavaScript (Zero external dependencies, file:// protocol compatible)
 * 
 * MODULES:
 * 01. Global State, Storage & Theme Management
 * 02. Page-Load Intro Loader
 * 03. Custom Cursor Engine (Dot + Lerped Ring + Contextual Labels)
 * 04. Mouse Sparkle Trail Canvas
 * 05. Hero Headline Cursor Reactive Physics
 * 06. Spotlight Glow & Parallax Elements
 * 07. Magnetic Buttons & Nav Links
 * 08. 3D Tilt Cards with Specular Highlight
 * 09. Site Navigation, Progress Bar & Active Section Tracker
 * 10. Role Typing / Text Rotator
 * 11. About Polaroid Collage & Lightbox Modal
 * 12. Animated Stats Counter (Scroll Triggered)
 * 13. Projects Bento Filtering & Detailed Case Study Modal
 * 14. Case Study Draggable Process Gallery
 * 15. Playground: Pick Your Vibe Color Switcher
 * 16. Playground: Draggable & Tossable Sticker Board
 * 17. Playground: Canvas Doodle Pad with PNG Export
 * 18. Playground: Interactive Skill Orbit Wheel
 * 19. Accessible Accordion with Animated Progress Bars
 * 20. Infinite Marquee with Scroll Direction Reversal
 * 21. Testimonials Carousel Slider
 * 22. Live Contact Form Validation & Simulated Submission
 * 23. Email Copy with Floating Toast
 * 24. Live Local Clock (IST / UTC+5:30)
 * 25. Konami Code Easter Egg & High-Performance Confetti Engine
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Device & Preference Detection
  const isTouchDevice = () => window.matchMedia('(hover: none) or (pointer: coarse)').matches;
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================================
     01. GLOBAL STATE, STORAGE & THEME MANAGEMENT
     ============================================================================ */
  const state = {
    theme: 'dark',
    accentVibe: 'coral',
    accentHex: '#ff4d2e',
    isIntroComplete: false,
    activeSection: 'hero',
    currentProjectIndex: 0,
    currentLightboxIndex: 0,
  };

  // Safe localStorage helper
  const storage = {
    get: (key, fallback) => {
      try {
        const item = localStorage.getItem(key);
        return item !== null ? item : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // Storage restricted or unavailable
      }
    }
  };

  // Initialize Saved Theme
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const savedTheme = storage.get('aks_theme', 'dark');
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme} mode`);
    });
  }

  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    storage.set('aks_theme', theme);
  }

  // Toast Notification System
  const toastContainer = document.getElementById('toast-container');
  function showToast(message, duration = 3000) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<span>✦</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  window.showToast = showToast;


  /* ============================================================================
     02. PAGE-LOAD INTRO LOADER (Quick & Skippable < 1.5s)
     ============================================================================ */
  const introLoader = document.getElementById('intro-loader');
  const introCounter = document.getElementById('intro-counter');
  const introBar = document.getElementById('intro-bar');
  const introSkipBtn = document.getElementById('intro-skip-btn');

  function completeIntro() {
    if (state.isIntroComplete) return;
    state.isIntroComplete = true;
    if (introLoader) {
      introLoader.classList.add('is-hidden');
      setTimeout(() => introLoader.remove(), 600);
    }
    initScrollReveal();
  }

  if (prefersReducedMotion() || storage.get('aks_intro_seen', 'false') === 'true') {
    // Skip immediately for reduced motion
    completeIntro();
  } else {
    let progress = 0;
    const introInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 14) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(introInterval);
        if (introCounter) introCounter.textContent = '100%';
        if (introBar) introBar.style.width = '100%';
        setTimeout(completeIntro, 250);
      } else {
        if (introCounter) introCounter.textContent = `${String(progress).padStart(3, '0')}%`;
        if (introBar) introBar.style.width = `${progress}%`;
      }
    }, 45);

    if (introSkipBtn) introSkipBtn.addEventListener('click', completeIntro);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !state.isIntroComplete) completeIntro();
    }, { once: true });
    introLoader?.addEventListener('click', completeIntro, { once: true });
  }


  /* ============================================================================
     03. CUSTOM CURSOR ENGINE (Dot + Lerped Trailing Ring + Contextual Labels)
     ============================================================================ */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const cursorLabel = document.getElementById('cursor-label');

  const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const ring = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let isCursorVisible = false;

  if (!isTouchDevice() && !prefersReducedMotion() && cursorDot && cursorRing) {
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      if (!isCursorVisible) {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        isCursorVisible = true;
      }

      cursorDot.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
    });

    // Lerp loop for trailing ring
    function renderCursorRing() {
      ring.x += (mouse.x - ring.x) * 0.18;
      ring.y += (mouse.y - ring.y) * 0.18;

      cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      requestAnimationFrame(renderCursorRing);
    }
    requestAnimationFrame(renderCursorRing);

    // Contextual Hover States
    document.addEventListener('mouseover', (e) => {
      const interactive = e.target.closest('a, button, [role="button"], input, textarea, select, .tilt-card, [data-cursor]');
      if (interactive) {
        cursorRing.classList.add('is-hovering');
        const customCursor = interactive.getAttribute('data-cursor');
        if (customCursor) {
          cursorRing.classList.add('has-label');
          if (cursorLabel) cursorLabel.textContent = customCursor;
        } else {
          cursorRing.classList.remove('has-label');
        }
      }
    });

    document.addEventListener('mouseout', (e) => {
      const interactive = e.target.closest('a, button, [role="button"], input, textarea, select, .tilt-card, [data-cursor]');
      if (interactive) {
        cursorRing.classList.remove('is-hovering', 'has-label');
      }
    });

    document.addEventListener('mousedown', () => cursorRing.classList.add('is-active'));
    document.addEventListener('mouseup', () => cursorRing.classList.remove('is-active'));
  }


  /* ============================================================================
     04. MOUSE SPARKLE TRAIL CANVAS (High performance, max 25 particles)
     ============================================================================ */
  const trailCanvas = document.getElementById('trail-canvas');
  if (trailCanvas && !isTouchDevice() && !prefersReducedMotion()) {
    const ctx = trailCanvas.getContext('2d');
    let particles = [];
    let trailActive = false;
    let lastMouseTime = 0;

    function resizeTrail() {
      trailCanvas.width = window.innerWidth;
      trailCanvas.height = window.innerHeight;
    }
    resizeTrail();
    window.addEventListener('resize', resizeTrail);

    window.addEventListener('mousemove', (e) => {
      lastMouseTime = performance.now();
      if (particles.length < 24 && Math.random() > 0.45) {
        particles.push({
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 3.5 + 1.5,
          color: state.accentHex,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          life: 1.0,
          decay: Math.random() * 0.035 + 0.025,
        });
        if (!trailActive) {
          trailActive = true;
          requestAnimationFrame(animateTrail);
        }
      }
    });

    function animateTrail(time) {
      ctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        requestAnimationFrame(animateTrail);
      } else {
        trailActive = false;
      }
    }
  }


  /* ============================================================================
     05. SIGNATURE HERO HEADLINE CURSOR-REACTIVE PHYSICS
     ============================================================================ */
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    const text = heroTitle.textContent.trim();
    heroTitle.textContent = '';
    const charElements = [];

    // Split text into spans, preserving word spaces
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      if (char === ' ') {
        span.className = 'char space';
        span.innerHTML = '&nbsp;';
      } else {
        span.className = 'char';
        span.textContent = char;
      }
      heroTitle.appendChild(span);
      charElements.push(span);
    }

    if (!isTouchDevice() && !prefersReducedMotion()) {
      const heroSection = document.getElementById('hero');

      heroSection?.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        charElements.forEach((span) => {
          if (span.classList.contains('space')) return;
          const rect = span.getBoundingClientRect();
          const charCenterX = rect.left + rect.width / 2;
          const charCenterY = rect.top + rect.height / 2;

          const dx = mouseX - charCenterX;
          const dy = mouseY - charCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 180;

          if (dist < maxDist) {
            const factor = (1 - dist / maxDist);
            const scale = 1 + factor * 0.35;
            const shiftX = -dx * factor * 0.15;
            const shiftY = -dy * factor * 0.15;
            const shadowX = -dx * factor * 0.2;
            const shadowY = -dy * factor * 0.2;

            span.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 0) scale(${scale})`;
            span.style.textShadow = `${shadowX}px ${shadowY}px 0 var(--accent), 0 0 15px var(--accent-glow)`;
            span.style.fontWeight = factor > 0.5 ? '800' : '700';
          } else {
            span.style.transform = 'translate3d(0, 0, 0) scale(1)';
            span.style.textShadow = 'none';
            span.style.fontWeight = '700';
          }
        });
      });

      heroSection?.addEventListener('mouseleave', () => {
        charElements.forEach((span) => {
          span.style.transform = 'translate3d(0, 0, 0) scale(1)';
          span.style.textShadow = 'none';
        });
      });
    }
  }


  /* ============================================================================
     06. SPOTLIGHT GLOW & PARALLAX DEPTH TRACKER
     ============================================================================ */
  const spotlightAreas = document.querySelectorAll('.spotlight-area');
  const parallaxElements = document.querySelectorAll('[data-parallax-depth]');

  if (!isTouchDevice() && !prefersReducedMotion()) {
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!ticking) {
        requestAnimationFrame(() => {
          // Update CSS custom properties for radial gradient spotlight
          spotlightAreas.forEach((area) => {
            const rect = area.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
              const x = clientX - rect.left;
              const y = clientY - rect.top;
              area.style.setProperty('--mx', `${x}px`);
              area.style.setProperty('--my', `${y}px`);
            }
          });

          // Parallax depth calculation relative to viewport center
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const offsetX = (clientX - centerX);
          const offsetY = (clientY - centerY);

          parallaxElements.forEach((el) => {
            const depth = parseFloat(el.getAttribute('data-parallax-depth')) || 0.05;
            const moveX = offsetX * depth;
            const moveY = offsetY * depth;
            el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    });
  }


  /* ============================================================================
     07. MAGNETIC BUTTONS & NAV LINKS
     ============================================================================ */
  const magneticItems = document.querySelectorAll('.magnetic');

  if (!isTouchDevice() && !prefersReducedMotion()) {
    magneticItems.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        el.style.transform = `translate3d(${dx * 0.28}px, ${dy * 0.28}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }


  /* ============================================================================
     08. 3D CARD TILT WITH SPECULAR HIGHLIGHT
     ============================================================================ */
  const tiltCards = document.querySelectorAll('.tilt-card');

  if (!isTouchDevice() && !prefersReducedMotion()) {
    tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--card-mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--card-my', `${(y / rect.height) * 100}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }


  /* ============================================================================
     09. SITE NAVIGATION, PROGRESS BAR & ACTIVE SECTION TRACKER
     ============================================================================ */
  const siteHeader = document.getElementById('site-header');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    // Update Progress Bar
    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${progress}%`;
      scrollProgressBar.setAttribute('aria-valuenow', Math.round(progress));
    }

    // Nav Header blur & padding transition
    if (siteHeader) {
      if (scrollY > 50) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Infinite Marquee reverse on scroll direction
    handleMarqueeScroll(scrollY);
  }, { passive: true });

  // Active Nav Link Observer
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const currentId = entry.target.id;
        state.activeSection = currentId;
        navLinks.forEach((link) => {
          if (link.getAttribute('data-section') === currentId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach((sec) => sectionObserver.observe(sec));

  // Mobile Drawer Toggle
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (menuToggleBtn && mobileNavDrawer) {
    function toggleMobileMenu(open) {
      const isOpen = open !== undefined ? open : !mobileNavDrawer.classList.contains('is-open');
      menuToggleBtn.setAttribute('aria-expanded', String(isOpen));
      mobileNavDrawer.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) {
        mobileNavDrawer.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      } else {
        mobileNavDrawer.classList.remove('is-open');
        document.body.style.overflow = '';
      }
    }

    menuToggleBtn.addEventListener('click', () => toggleMobileMenu());
    mobileNavDrawer.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => toggleMobileMenu(false));
    });
  }


  /* ============================================================================
     10. TYPED ROLE ROTATOR (Hero Section)
     ============================================================================ */
  const roleRotator = document.getElementById('role-rotator');
  if (roleRotator) {
    const roles = [
      'fluid web experiences',
      'multi-brand design systems',
      'interactive web apps',
      'expressive digital products',
      'accessible 60 FPS interfaces'
    ];
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = true;

    function typeRole() {
      const currentText = roles[roleIndex];
      if (isDeleting) {
        charIndex--;
        roleRotator.textContent = currentText.substring(0, charIndex);
        if (charIndex <= 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(typeRole, 400);
          return;
        }
      } else {
        charIndex++;
        roleRotator.textContent = currentText.substring(0, charIndex);
        if (charIndex >= currentText.length) {
          isDeleting = true;
          setTimeout(typeRole, 2400);
          return;
        }
      }
      setTimeout(typeRole, isDeleting ? 40 : 80);
    }

    setTimeout(typeRole, 2000);
  }


  /* ============================================================================
     11. ABOUT POLAROID COLLAGE & LIGHTBOX MODAL
     ============================================================================ */
  const polaroidCards = document.querySelectorAll('.polaroid-card');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');

  const galleryPhotos = [
    { src: 'assets/adarsh-1.jpg', alt: 'Design Studio & Systems Architecture', caption: '01 // Design Studio & Systems Architecture' },
    { src: 'assets/adarsh-2.jpg', alt: 'Wireframing & UX Strategy', caption: '02 // Wireframing & UX Strategy' },
    { src: 'assets/adarsh-3.jpg', alt: 'Creative Code Lab & Prototyping', caption: '03 // Creative Code Lab & Prototyping' }
  ];

  function openLightbox(index) {
    state.currentLightboxIndex = (index + galleryPhotos.length) % galleryPhotos.length;
    const photo = galleryPhotos[state.currentLightboxIndex];
    if (lightboxImg) {
      lightboxImg.src = photo.src;
      lightboxImg.alt = photo.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = photo.caption;
    if (lightboxModal) {
      lightboxModal.classList.add('is-active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('is-active');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  polaroidCards.forEach((card, idx) => {
    card.addEventListener('click', () => openLightbox(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(idx);
      }
    });
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => openLightbox(state.currentLightboxIndex - 1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => openLightbox(state.currentLightboxIndex + 1));

  window.addEventListener('keydown', (e) => {
    if (lightboxModal?.classList.contains('is-active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(state.currentLightboxIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(state.currentLightboxIndex + 1);
    }
  });


  /* ============================================================================
     12. ANIMATED STATS COUNTER (Scroll Triggered via IntersectionObserver)
     ============================================================================ */
  const statsElements = document.querySelectorAll('.stat-number');
  let statsCounted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !statsCounted) {
        statsCounted = true;
        statsElements.forEach((el) => {
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1600;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;

          const counter = setInterval(() => {
            count += increment;
            if (count >= target) {
              count = target;
              clearInterval(counter);
            }
            el.textContent = `${prefix}${Math.floor(count)}${suffix}`;
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.35 });

  const statsGrid = document.getElementById('stats-grid');
  if (statsGrid) statsObserver.observe(statsGrid);


  /* ============================================================================
     13. PROJECTS BENTO FILTERING & DETAILED CASE STUDY MODAL
     ============================================================================ */
  // Project Data (All in-memory, no fetch/XHR required!)
  const PROJECTS_DATA = [
    {
      id: 'aether',
      title: 'Aether UI — Generative Design System',
      category: 'Design Systems / Web',
      year: '2026',
      client: 'Open Source Architecture',
      tagline: 'Multi-brand tokenized design architecture with automated WCAG contrast validation.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'Maintaining visual consistency, accessible contrast ratios, and dark/light token coherence across 14 independent product modules without human error or code bloat.',
      solution: 'Engineered a centralized mathematical token engine with clamp() fluid spatial ramps, automated color-luminance matrix testing, and zero-runtime CSS variable injection.',
      results: [
        'Reduced design-to-production handoff cycle from 8 days to under 4 hours.',
        '100% WCAG 2.1 AA contrast compliance certified across all light and dark tokens.',
        'Adopted by over 1,200 open-source developers worldwide.'
      ],
      tech: ['Figma Tokens', 'CSS Custom Properties', 'Web Components', 'Vanilla JS', 'SVG API'],
      highlights: ['Automated Contrast Engine', 'Zero Runtime Dependencies', 'Sub-millisecond Token Swaps']
    },
    {
      id: 'chronos',
      title: 'Chronos Studio — Minimalist Time Engine',
      category: 'Web App',
      year: '2025',
      client: 'Productivity Platform',
      tagline: 'Ultra-fast, distraction-free desktop web application for independent creators.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'Traditional time tracking software is clunky, slow, invasive, and filled with micro-friction that breaks creative flow states.',
      solution: 'Designed and built a local-first browser app with keyboard-first shortcuts, instant HTML5 Canvas sparklines, and seamless one-click invoice compilation.',
      results: [
        'Initial bundle size under 22KB with zero npm dependencies.',
        'Over 99.8% offline reliability rating leveraging LocalStorage and Service Workers.',
        'Rated 4.9/5 by 350+ freelance beta testers.'
      ],
      tech: ['Vanilla JS', 'HTML5 Canvas', 'Local Storage API', 'CSS Grid', 'Keyboard Shortcuts'],
      highlights: ['Instant Zero Latency', 'Keyboard Driven', '100% Client-Side Privacy']
    },
    {
      id: 'nebula',
      title: 'Nebula Audio — 3D Spatial Synthesizer',
      category: 'Creative Dev',
      year: '2025',
      client: 'Audio Synthesis Lab',
      tagline: 'Interactive sound interface featuring real-time generative harmonic rings and spatial panning.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'Visualizing complex multi-channel audio synthesis directly in the browser while maintaining high-fidelity DSP audio rendering without frame drops.',
      solution: 'Constructed an optimized Web Audio API node tree synchronized with a 60 FPS HTML5 Canvas particle system and responsive cursor-drag spatial coordinates.',
      results: [
        'Consistent 60 frames per second maintained across mobile and desktop browsers.',
        'Zero audio stuttering with custom AudioParam scheduling.',
        'Featured on creative coding design showcases.'
      ],
      tech: ['Web Audio API', 'Canvas 2D', 'DSP Math', 'Pointer Events', 'CSS Transforms'],
      highlights: ['Interactive Spatial Panning', 'Generative Harmonics', 'Kinetic Waveforms']
    },
    {
      id: 'lumina',
      title: 'Lumina — Architectural Luminaire Experience',
      category: 'Web Apps / Design',
      year: '2026',
      client: 'Studio Lumina Architecture',
      tagline: 'Editorial e-commerce experience for bespoke architectural lighting designers.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'High-end architectural lighting is difficult to convey through flat e-commerce grids without communicating spatial light temperature and beam angles.',
      solution: 'Crafted an editorial storytelling layout with interactive CSS light cones, ambient lux adjustments, and tactile drag-to-illuminate product previews.',
      results: [
        'Average customer session duration increased by 64%.',
        'Direct catalog requests jumped by 42% in Q1.',
        'Praised by design journalists for its tactile minimalism.'
      ],
      tech: ['Modern CSS Grid', 'Fluid Typography', 'CSS Houdini / Gradients', 'Figma', 'Vanilla JS'],
      highlights: ['Interactive Light Simulator', 'Editorial Layout', 'High-Contrast WCAG']
    },
    {
      id: 'kanso',
      title: 'Kanso Notes — Zen Markdown Workspace',
      category: 'Web App',
      year: '2025',
      client: 'Personal Productivity',
      tagline: 'Distraction-free, keyboard-driven markdown editor engineered for deep writing.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'Modern notes applications are bloated with artificial AI features, cluttered toolbars, and sluggish cloud sync delays.',
      solution: 'Built an elegant Japanese-inspired zen editor that opens instantly, saves to disk locally, and lets typography breathe with generous whitespace.',
      results: [
        'Loads in under 60 milliseconds on cold startup.',
        'Pure vanilla DOM manipulation with zero framework overhead.',
        'Over 50,000 words written in active community use.'
      ],
      tech: ['Vanilla JS', 'Local Storage', 'DOM Ops', 'CSS Typography', 'Responsive CSS'],
      highlights: ['Instant Offline Caching', 'Sub-pixel Typography', 'Clean Markdown Syntax']
    },
    {
      id: 'verve',
      title: 'Verve Magazine — Kinetic Editorial',
      category: 'Creative Dev / Editorial',
      year: '2026',
      client: 'Digital Editorial Collective',
      tagline: 'Experimental online publication exploring kinetic typography and split-screen storytelling.',
      demoUrl: '#projects',
      codeUrl: '#projects',
      challenge: 'Translating the tactile physicality and oversized typography of luxury print magazines to interactive, responsive digital screens.',
      solution: 'Implemented scroll-driven kinetic typography, split-screen synchronized viewports, and micro-delight hover physics.',
      results: [
        'Recognized for exceptional web typography and creative direction.',
        'Zero layout shifts (CLS = 0.00) during scroll timelines.',
        'Mobile swipe gestures aligned perfectly with desktop interactions.'
      ],
      tech: ['CSS Scroll Timeline', 'SVG Animation', 'Fluid Clamp', 'IntersectionObserver'],
      highlights: ['Kinetic Typography', 'Zero CLS', 'Print-Grade Grid Alignment']
    }
  ];

  // Filter Chips Functionality
  const filterChips = document.querySelectorAll('.filter-chip');
  const projectCards = document.querySelectorAll('.project-card');

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');

      const filter = chip.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category')?.split(',') || [];
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('is-hidden');
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.classList.add('is-hidden');
        }
      });
    });
  });

  // Project Modal System
  const projectModal = document.getElementById('project-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCategory = document.getElementById('modal-category');
  const modalTitle = document.getElementById('modal-project-title');
  const modalTagline = document.getElementById('modal-tagline');
  const modalYear = document.getElementById('modal-year');
  const modalClient = document.getElementById('modal-client');
  const modalChallenge = document.getElementById('modal-challenge');
  const modalSolution = document.getElementById('modal-solution');
  const modalResults = document.getElementById('modal-results');
  const modalTechTags = document.getElementById('modal-tech-tags');
  const modalHighlights = document.getElementById('modal-highlights');
  const modalPrevBtn = document.getElementById('modal-prev-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');

  function openProjectModal(index) {
    state.currentProjectIndex = (index + PROJECTS_DATA.length) % PROJECTS_DATA.length;
    const p = PROJECTS_DATA[state.currentProjectIndex];

    if (modalCategory) modalCategory.textContent = p.category;
    if (modalTitle) modalTitle.textContent = p.title;
    if (modalTagline) modalTagline.textContent = p.tagline;
    if (modalYear) modalYear.textContent = p.year;
    if (modalClient) modalClient.textContent = p.client;
    if (modalChallenge) modalChallenge.textContent = p.challenge;
    if (modalSolution) modalSolution.textContent = p.solution;

    if (modalResults) {
      modalResults.innerHTML = '';
      p.results.forEach((res) => {
        const li = document.createElement('li');
        li.textContent = res;
        modalResults.appendChild(li);
      });
    }

    if (modalTechTags) {
      modalTechTags.innerHTML = '';
      p.tech.forEach((t) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        modalTechTags.appendChild(span);
      });
    }

    if (modalHighlights) {
      modalHighlights.innerHTML = '';
      p.highlights.forEach((h) => {
        const li = document.createElement('li');
        li.textContent = h;
        modalHighlights.appendChild(li);
      });
    }

    if (projectModal) {
      projectModal.classList.add('is-active');
      projectModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalCloseBtn?.focus();
    }
  }

  function closeProjectModal() {
    if (projectModal) {
      projectModal.classList.remove('is-active');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  projectCards.forEach((card, idx) => {
    card.addEventListener('click', () => openProjectModal(idx));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProjectModal(idx);
      }
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  if (modalPrevBtn) modalPrevBtn.addEventListener('click', () => openProjectModal(state.currentProjectIndex - 1));
  if (modalNextBtn) modalNextBtn.addEventListener('click', () => openProjectModal(state.currentProjectIndex + 1));

  window.addEventListener('keydown', (e) => {
    if (projectModal?.classList.contains('is-active')) {
      if (e.key === 'Escape') closeProjectModal();
      if (e.key === 'ArrowLeft') openProjectModal(state.currentProjectIndex - 1);
      if (e.key === 'ArrowRight') openProjectModal(state.currentProjectIndex + 1);
    }
  });


  /* ============================================================================
     14. CASE STUDY DRAGGABLE PROCESS GALLERY (Mouse & Touch Drag Support)
     ============================================================================ */
  const dragTrack = document.getElementById('drag-gallery-track');
  if (dragTrack) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    dragTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - dragTrack.offsetLeft;
      scrollLeft = dragTrack.scrollLeft;
      dragTrack.style.cursor = 'grabbing';
    });

    dragTrack.addEventListener('mouseleave', () => {
      isDown = false;
      dragTrack.style.cursor = 'grab';
    });

    dragTrack.addEventListener('mouseup', () => {
      isDown = false;
      dragTrack.style.cursor = 'grab';
    });

    dragTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - dragTrack.offsetLeft;
      const walk = (x - startX) * 1.5;
      dragTrack.scrollLeft = scrollLeft - walk;
    });
  }


  /* ============================================================================
     15. PLAYGROUND: PICK YOUR VIBE COLOR SWITCHER (Live Updates + Persistence)
     ============================================================================ */
  const vibeButtons = document.querySelectorAll('.vibe-btn');
  const currentVibeName = document.getElementById('current-vibe-name');

  const vibePalettes = {
    coral: { name: 'Hot Coral', hex: '#ff4d2e', glow: 'rgba(255, 77, 46, 0.25)', subtle: 'rgba(255, 77, 46, 0.12)' },
    lime: { name: 'Electric Lime', hex: '#10e575', glow: 'rgba(16, 229, 117, 0.25)', subtle: 'rgba(16, 229, 117, 0.12)' },
    cyan: { name: 'Cyber Cyan', hex: '#00f0ff', glow: 'rgba(0, 240, 255, 0.25)', subtle: 'rgba(0, 240, 255, 0.12)' },
    purple: { name: 'Hyper Violet', hex: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)', subtle: 'rgba(168, 85, 247, 0.12)' },
    amber: { name: 'Amber Gold', hex: '#ffb703', glow: 'rgba(255, 183, 3, 0.25)', subtle: 'rgba(255, 183, 3, 0.12)' },
  };

  function applyVibe(vibeKey) {
    const palette = vibePalettes[vibeKey] || vibePalettes.coral;
    state.accentVibe = vibeKey;
    state.accentHex = palette.hex;

    document.documentElement.style.setProperty('--accent', palette.hex);
    document.documentElement.style.setProperty('--accent-glow', palette.glow);
    document.documentElement.style.setProperty('--accent-subtle', palette.subtle);

    vibeButtons.forEach((btn) => {
      if (btn.getAttribute('data-vibe') === vibeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (currentVibeName) {
      currentVibeName.textContent = `${palette.name} (${palette.hex})`;
    }

    storage.set('aks_vibe', vibeKey);
  }

  // Load saved vibe
  const savedVibe = storage.get('aks_vibe', 'coral');
  applyVibe(savedVibe);

  vibeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const vibe = btn.getAttribute('data-vibe');
      applyVibe(vibe);
      showToast(`Vibe updated to ${vibePalettes[vibe].name}! ✨`);
    });
  });


  /* ============================================================================
     16. PLAYGROUND: DRAGGABLE & TOSSABLE STICKER BOARD
     ============================================================================ */
  const sandbox = document.getElementById('sticker-sandbox');
  const stickers = document.querySelectorAll('.drag-sticker');
  const resetStickersBtn = document.getElementById('reset-stickers-btn');

  const initialStickerPositions = [
    { top: 40, left: 30, rotate: -4 },
    { top: 90, left: 240, rotate: 6 },
    { top: 180, left: 50, rotate: 3 },
    { top: 150, left: 260, rotate: -8 },
    { top: 100, left: 140, rotate: 2 }
  ];

  stickers.forEach((sticker, index) => {
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = initialStickerPositions[index]?.left || 30;
    let currentY = initialStickerPositions[index]?.top || 40;
    let velocityX = 0, velocityY = 0;
    let lastTime = 0, lastX = 0, lastY = 0;

    sticker.style.left = `${currentX}px`;
    sticker.style.top = `${currentY}px`;
    sticker.style.transform = `rotate(${initialStickerPositions[index]?.rotate || 0}deg)`;

    sticker.addEventListener('pointerdown', (e) => {
      isDragging = true;
      sticker.setPointerCapture(e.pointerId);
      startX = e.clientX - currentX;
      startY = e.clientY - currentY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      sticker.style.zIndex = '50';
      sticker.style.transform = `scale(1.08) rotate(${Math.random() * 8 - 4}deg)`;
    });

    sticker.addEventListener('pointermove', (e) => {
      if (!isDragging || !sandbox) return;
      const now = performance.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocityX = (e.clientX - lastX) / dt;
        velocityY = (e.clientY - lastY) / dt;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      currentX = e.clientX - startX;
      currentY = e.clientY - startY;

      // Keep within sandbox bounds
      const maxX = sandbox.clientWidth - sticker.offsetWidth;
      const maxY = sandbox.clientHeight - sticker.offsetHeight;
      currentX = Math.max(0, Math.min(maxX, currentX));
      currentY = Math.max(0, Math.min(maxY, currentY));

      sticker.style.left = `${currentX}px`;
      sticker.style.top = `${currentY}px`;
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      sticker.releasePointerCapture(e.pointerId);
      sticker.style.zIndex = '10';

      // Momentum toss physics
      let momentumX = velocityX * 12;
      let momentumY = velocityY * 12;
      currentX = Math.max(0, Math.min(sandbox.clientWidth - sticker.offsetWidth, currentX + momentumX));
      currentY = Math.max(0, Math.min(sandbox.clientHeight - sticker.offsetHeight, currentY + momentumY));

      sticker.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s ease';
      sticker.style.left = `${currentX}px`;
      sticker.style.top = `${currentY}px`;
      sticker.style.transform = `rotate(${Math.random() * 12 - 6}deg)`;

      setTimeout(() => {
        sticker.style.transition = '';
      }, 400);
    }

    sticker.addEventListener('pointerup', endDrag);
    sticker.addEventListener('pointercancel', endDrag);
  });

  if (resetStickersBtn) {
    resetStickersBtn.addEventListener('click', () => {
      stickers.forEach((sticker, i) => {
        const pos = initialStickerPositions[i] || { top: 40, left: 30, rotate: 0 };
        sticker.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        sticker.style.left = `${pos.left}px`;
        sticker.style.top = `${pos.top}px`;
        sticker.style.transform = `rotate(${pos.rotate}deg)`;
        setTimeout(() => { sticker.style.transition = ''; }, 500);
      });
      showToast('Stickers reset to original spots! ⚡');
    });
  }


  /* ============================================================================
     17. PLAYGROUND: CANVAS DOODLE PAD WITH PNG EXPORT
     ============================================================================ */
  const doodleCanvas = document.getElementById('doodle-canvas');
  const doodleClearBtn = document.getElementById('doodle-clear-btn');
  const doodleDownloadBtn = document.getElementById('doodle-download-btn');
  const brushButtons = document.querySelectorAll('.brush-btn');

  if (doodleCanvas) {
    const dctx = doodleCanvas.getContext('2d');
    let isDrawing = false;
    let brushSize = 3;
    let lastX = 0, lastY = 0;

    function resizeDoodleCanvas() {
      const rect = doodleCanvas.parentElement.getBoundingClientRect();
      doodleCanvas.width = rect.width;
      doodleCanvas.height = 230;
      clearDoodle();
    }
    resizeDoodleCanvas();
    window.addEventListener('resize', resizeDoodleCanvas);

    function clearDoodle() {
      dctx.fillStyle = state.theme === 'dark' ? '#0b0b0c' : '#f7f6f2';
      dctx.fillRect(0, 0, doodleCanvas.width, doodleCanvas.height);
      // Subtle grid watermark
      dctx.strokeStyle = state.theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
      dctx.lineWidth = 1;
      for (let x = 0; x < doodleCanvas.width; x += 25) {
        dctx.beginPath();
        dctx.moveTo(x, 0);
        dctx.lineTo(x, doodleCanvas.height);
        dctx.stroke();
      }
      for (let y = 0; y < doodleCanvas.height; y += 25) {
        dctx.beginPath();
        dctx.moveTo(0, y);
        dctx.lineTo(doodleCanvas.width, y);
        dctx.stroke();
      }
    }

    function getCoords(e) {
      const rect = doodleCanvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    }

    function startDraw(e) {
      isDrawing = true;
      const coords = getCoords(e);
      lastX = coords.x;
      lastY = coords.y;
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoords(e);

      dctx.strokeStyle = state.accentHex;
      dctx.lineWidth = brushSize;
      dctx.lineCap = 'round';
      dctx.lineJoin = 'round';
      dctx.shadowColor = state.accentHex;
      dctx.shadowBlur = brushSize > 5 ? 8 : 4;

      dctx.beginPath();
      dctx.moveTo(lastX, lastY);
      dctx.lineTo(coords.x, coords.y);
      dctx.stroke();

      lastX = coords.x;
      lastY = coords.y;
    }

    function stopDraw() {
      isDrawing = false;
    }

    doodleCanvas.addEventListener('mousedown', startDraw);
    doodleCanvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDraw);

    doodleCanvas.addEventListener('touchstart', startDraw, { passive: false });
    doodleCanvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDraw);

    brushButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        brushButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        brushSize = parseInt(btn.getAttribute('data-size'), 10) || 3;
      });
    });

    if (doodleClearBtn) {
      doodleClearBtn.addEventListener('click', () => {
        clearDoodle();
        showToast('Canvas cleared! 🧹');
      });
    }

    if (doodleDownloadBtn) {
      doodleDownloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'adarsh-doodle.png';
        link.href = doodleCanvas.toDataURL('image/png');
        link.click();
        showToast('Doodle exported as PNG! 🎨');
      });
    }
  }


  /* ============================================================================
     18. PLAYGROUND: INTERACTIVE SKILL ORBIT WHEEL
     ============================================================================ */
  const orbitWheel = document.getElementById('orbit-wheel');
  const orbitNodes = document.querySelectorAll('.orbit-node');
  const orbitPct = document.getElementById('orbit-pct');
  const orbitTitle = document.getElementById('orbit-title');
  const orbitDesc = document.getElementById('orbit-desc');
  const spinOrbitBtn = document.getElementById('spin-orbit-btn');

  let currentWheelAngle = 0;

  function selectOrbitNode(node) {
    orbitNodes.forEach((n) => n.classList.remove('active'));
    node.classList.add('active');

    const skill = node.getAttribute('data-skill');
    const level = node.getAttribute('data-level');
    const desc = node.getAttribute('data-desc');

    if (orbitTitle) orbitTitle.textContent = skill;
    if (orbitPct) orbitPct.textContent = level;
    if (orbitDesc) orbitDesc.textContent = desc;
  }

  orbitNodes.forEach((node) => {
    node.addEventListener('click', () => selectOrbitNode(node));
    node.addEventListener('mouseenter', () => selectOrbitNode(node));
  });

  if (spinOrbitBtn && orbitWheel) {
    spinOrbitBtn.addEventListener('click', () => {
      currentWheelAngle += 180 + Math.floor(Math.random() * 4) * 45;
      orbitWheel.style.transform = `rotate(${currentWheelAngle}deg)`;
      const randomIdx = Math.floor(Math.random() * orbitNodes.length);
      setTimeout(() => selectOrbitNode(orbitNodes[randomIdx]), 400);
    });
  }


  /* ============================================================================
     19. ACCESSIBLE ACCORDION WITH ANIMATED SKILL PROGRESS BARS
     ============================================================================ */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach((item) => {
    const headerBtn = item.querySelector('.accordion-header');
    if (!headerBtn) return;

    headerBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others (single accordion mode)
      accordionItems.forEach((other) => {
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.accordion-header');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        headerBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* ============================================================================
     20. INFINITE MARQUEE WITH SCROLL DIRECTION REVERSAL
     ============================================================================ */
  const marqueeTrack = document.getElementById('marquee-track');
  let lastScrollY = window.scrollY;

  function handleMarqueeScroll(currentScrollY) {
    if (!marqueeTrack) return;
    const diff = currentScrollY - lastScrollY;
    if (diff < -5) {
      // Scrolling up -> reverse marquee
      marqueeTrack.classList.add('is-reverse');
    } else if (diff > 5) {
      // Scrolling down -> forward marquee
      marqueeTrack.classList.remove('is-reverse');
    }
    lastScrollY = currentScrollY;
  }


  /* ============================================================================
     21. TESTIMONIALS CAROUSEL SLIDER (Drag, Swipe, Autoplay)
     ============================================================================ */
  const testimonialsStage = document.getElementById('testimonials-stage');
  const testimonialsTrack = document.getElementById('testimonials-track');
  const testimonialSlides = document.querySelectorAll('.testimonial-slide');
  const sliderDots = document.querySelectorAll('.slider-dot');
  const sliderPrevBtn = document.getElementById('slider-prev-btn');
  const sliderNextBtn = document.getElementById('slider-next-btn');

  let currentSlide = 0;
  let autoplayTimer = null;
  const totalSlides = testimonialSlides.length;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    if (testimonialsTrack) {
      testimonialsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    testimonialSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    sliderDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
      dot.setAttribute('aria-selected', String(i === currentSlide));
    });
  }

  function startTestimonialsAutoplay() {
    stopTestimonialsAutoplay();
    autoplayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5500);
  }

  function stopTestimonialsAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (sliderPrevBtn) {
    sliderPrevBtn.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
      startTestimonialsAutoplay();
    });
  }

  if (sliderNextBtn) {
    sliderNextBtn.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
      startTestimonialsAutoplay();
    });
  }

  sliderDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      goToSlide(idx);
      startTestimonialsAutoplay();
    });
  });

  if (testimonialsStage) {
    testimonialsStage.addEventListener('mouseenter', stopTestimonialsAutoplay);
    testimonialsStage.addEventListener('mouseleave', startTestimonialsAutoplay);

    // Touch Swipe Support
    let touchStartX = 0;
    testimonialsStage.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    testimonialsStage.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (diff > 50) {
        goToSlide(currentSlide + 1);
      } else if (diff < -50) {
        goToSlide(currentSlide - 1);
      }
    }, { passive: true });
  }

  startTestimonialsAutoplay();


  /* ============================================================================
     22. LIVE CONTACT FORM VALIDATION & SIMULATED SUBMISSION
     ============================================================================ */
  const contactForm = document.getElementById('contact-form');
  const inputName = document.getElementById('contact-name');
  const inputEmail = document.getElementById('contact-email');
  const inputMessage = document.getElementById('contact-message');
  const charCounter = document.getElementById('char-counter');
  const submitBtn = document.getElementById('submit-btn');
  const formSuccessBanner = document.getElementById('form-success-banner');

  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  // Character Counter for Message
  if (inputMessage && charCounter) {
    inputMessage.addEventListener('input', () => {
      const len = inputMessage.value.length;
      charCounter.textContent = `${len} / 500`;
    });
  }

  // Live Inline Validation
  function validateField(field, errorEl, condition, msg) {
    const group = field.closest('.form-group');
    if (!condition) {
      if (group) group.classList.add('has-error');
      if (errorEl) errorEl.textContent = msg;
      return false;
    } else {
      if (group) group.classList.remove('has-error');
      if (errorEl) errorEl.textContent = '';
      return true;
    }
  }

  inputName?.addEventListener('input', () => {
    validateField(inputName, errName, inputName.value.trim().length >= 2, 'Please enter at least 2 characters');
  });

  inputEmail?.addEventListener('input', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validateField(inputEmail, errEmail, emailRegex.test(inputEmail.value.trim()), 'Please enter a valid email address');
  });

  inputMessage?.addEventListener('input', () => {
    validateField(inputMessage, errMessage, inputMessage.value.trim().length >= 10, 'Message must be at least 10 characters long');
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isNameValid = validateField(inputName, errName, inputName.value.trim().length >= 2, 'Please enter at least 2 characters');
      const isEmailValid = validateField(inputEmail, errEmail, emailRegex.test(inputEmail.value.trim()), 'Please enter a valid email address');
      const isMsgValid = validateField(inputMessage, errMessage, inputMessage.value.trim().length >= 10, 'Message must be at least 10 characters long');

      if (!isNameValid || !isEmailValid || !isMsgValid) {
        showToast('Please fix errors in the form before submitting ⚠️');
        return;
      }

      // Simulate sending state
      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }

        contactForm.reset();
        if (charCounter) charCounter.textContent = '0 / 500';
        if (formSuccessBanner) formSuccessBanner.classList.add('is-visible');

        showToast('Message sent! Adarsh will reply within 24h. 🚀');
        triggerConfetti(60);

        setTimeout(() => {
          formSuccessBanner?.classList.remove('is-visible');
        }, 8000);
      }, 1200);
    });
  }


  /* ============================================================================
     23. EMAIL COPY TO CLIPBOARD WITH TOAST FEEDBACK
     ============================================================================ */
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const targetEmail = document.getElementById('target-email');
  const copyBtnText = document.getElementById('copy-btn-text');

  if (copyEmailBtn && targetEmail) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = targetEmail.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        if (copyBtnText) copyBtnText.textContent = 'Copied!';
        showToast('Email copied to clipboard! 📋');
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Email';
        }, 2500);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Email copied to clipboard! 📋');
      }
    });
  }


  /* ============================================================================
     24. LIVE LOCAL CLOCK (IST / UTC+5:30) & CURRENT YEAR
     ============================================================================ */
  const localClock = document.getElementById('local-clock');
  const currentYear = document.getElementById('current-year');

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  function updateClock() {
    if (!localClock) return;
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    try {
      const timeString = new Intl.DateTimeFormat('en-US', options).format(new Date());
      localClock.textContent = `${timeString} IST`;
    } catch (e) {
      // Fallback
      const d = new Date();
      localClock.textContent = d.toLocaleTimeString() + ' Local';
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============================================================================
     25. KONAMI CODE EASTER EGG & HIGH PERFORMANCE CANVAS CONFETTI
     ============================================================================ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confettiCtx = confettiCanvas?.getContext('2d');
  let confettiParticles = [];
  let confettiRunning = false;

  function resizeConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);

  function triggerConfetti(count = 100) {
    if (!confettiCanvas || !confettiCtx) return;
    const colors = [state.accentHex, '#b9a7ff', '#10e575', '#00f0ff', '#ffb703', '#ffffff'];

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 5 + 3,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 8,
        life: 1.0,
        decay: Math.random() * 0.008 + 0.005,
      });
    }

    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(renderConfetti);
    }
  }
  window.triggerConfetti = triggerConfetti;

  function renderConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vRot;
      p.life -= p.decay;

      if (p.life <= 0 || p.y > confettiCanvas.height) {
        confettiParticles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rot * Math.PI) / 180);
      confettiCtx.globalAlpha = p.life;
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      confettiCtx.restore();
    }

    if (confettiParticles.length > 0) {
      requestAnimationFrame(renderConfetti);
    } else {
      confettiRunning = false;
    }
  }

  // Konami Code Listener
  const konamiSequence = [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    const expectedKey = konamiSequence[konamiIndex];
    if (e.key.toLowerCase() === expectedKey.toLowerCase()) {
      konamiIndex++;
      if (konamiIndex === konamiSequence.length) {
        konamiIndex = 0;
        triggerConfetti(160);
        showToast('🎮 KONAMI CODE UNLOCKED! You found the secret Easter Egg! 🏆', 5000);
      }
    } else {
      konamiIndex = 0;
    }
  });


  /* ============================================================================
     SCROLL REVEAL OBSERVER
     ============================================================================ */
  function initScrollReveal() {
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Trigger reveal check initially
  initScrollReveal();
});
