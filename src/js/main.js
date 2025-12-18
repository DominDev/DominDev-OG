/**
 * Main JavaScript for Oskar Gajcowski Landing Page
 * Vanilla JS, no dependencies except Lucide icons
 */

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initFAQ();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initLazyLoad();
  initAnimatedCounters();
  initLightbox();
  initStaggeredReveals();
  initHeroTypewriter();
  initScrollToTop();
});

/**
 * Initialize Lucide Icons
 */
function initIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * FAQ Accordion Logic
 * Only one item can be open at a time
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq__item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq__question');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      const answer = item.querySelector('.faq__answer');

      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherQuestion = otherItem.querySelector('.faq__question');
          otherQuestion.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      }
    });

    // Keyboard accessibility
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
}

/**
 * Mobile Menu Toggle with Accessibility and Scroll Lock
 */
function initMobileMenu() {
  const menuBtn = document.querySelector('.nav__menu-btn');
  const navLinks = document.querySelector('.nav__links');

  if (!menuBtn || !navLinks) return;

  const toggleMenu = (open) => {
    const isExpanded = open !== undefined ? !open : menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active', !isExpanded);

    // Toggle body scroll lock
    document.body.classList.toggle('menu-open', !isExpanded);

    // Toggle icon
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', isExpanded ? 'menu' : 'x');
      lucide.createIcons();
    }
  };

  const closeMenu = () => {
    navLinks.classList.remove('active');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    const icon = menuBtn.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'menu');
      lucide.createIcons();
    }
  };

  menuBtn.addEventListener('click', () => toggleMenu());

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close menu when clicking on nav link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      const navLinks = document.querySelector('.nav__links');
      const menuBtn = document.querySelector('.nav__menu-btn');
      if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }

      // Scroll to target with offset for fixed nav
      const navHeight = document.querySelector('.nav')?.offsetHeight || 70;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/**
 * Scroll Reveal Animation using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show all elements immediately if user prefers reduced motion
    revealElements.forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
}

/**
 * Lazy Loading for Images
 */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  if (lazyImages.length === 0) return;

  // Check for native lazy loading support
  if ('loading' in HTMLImageElement.prototype) {
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.removeAttribute('data-src');
      img.removeAttribute('data-srcset');
    });
    return;
  }

  // Fallback to IntersectionObserver
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '50px 0px' });

  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Animated Counters for Stats Section
 */
function initAnimatedCounters() {
  const statsItems = document.querySelectorAll('.stats__item h3');

  if (statsItems.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) return;

  const counters = [];

  statsItems.forEach(item => {
    const text = item.textContent.trim();
    // Parse value and suffix (e.g., "150+" => 150, "+")
    const match = text.match(/^(\d+)(.*)$/);
    if (match) {
      const targetValue = parseInt(match[1], 10);
      const suffix = match[2] || '';
      counters.push({ element: item, target: targetValue, suffix: suffix, counted: false });
      // Set initial value to 0
      item.innerHTML = `<span class="counter-value">0</span><span class="counter-suffix">${suffix}</span>`;
    }
  });

  const animateCounter = (counter) => {
    if (counter.counted) return;
    counter.counted = true;

    const duration = 2000;
    const startTime = performance.now();
    const valueElement = counter.element.querySelector('.counter-value');

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * counter.target);

      valueElement.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        valueElement.textContent = counter.target;
      }
    };

    requestAnimationFrame(updateCounter);
  };

  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = counters.find(c => c.element === entry.target);
        if (counter) {
          animateCounter(counter);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter.element));
}

/**
 * Gallery Lightbox
 */
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery__item');

  if (galleryItems.length === 0) return;

  // Create lightbox HTML
  const lightboxHTML = `
    <div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Galeria zdjęć">
      <div class="lightbox__content">
        <button class="lightbox__close" aria-label="Zamknij galerię">
          <i data-lucide="x" aria-hidden="true"></i>
        </button>
        <button class="lightbox__nav lightbox__nav--prev" aria-label="Poprzednie zdjęcie">
          <i data-lucide="chevron-left" aria-hidden="true"></i>
        </button>
        <img class="lightbox__image" src="" alt="">
        <button class="lightbox__nav lightbox__nav--next" aria-label="Następne zdjęcie">
          <i data-lucide="chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', lightboxHTML);

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = lightbox.querySelector('.lightbox__image');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
  const nextBtn = lightbox.querySelector('.lightbox__nav--next');

  let currentIndex = 0;
  const images = Array.from(galleryItems).map(item => {
    const img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImage.src = images[index].src;
    lightboxImage.alt = images[index].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    galleryItems[currentIndex].focus();
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImage.src = images[currentIndex].src;
    lightboxImage.alt = images[currentIndex].alt;
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImage.src = images[currentIndex].src;
    lightboxImage.alt = images[currentIndex].alt;
  };

  // Add click handlers to gallery items
  galleryItems.forEach((item, index) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Otwórz zdjęcie w powiększeniu');

    item.addEventListener('click', () => openLightbox(index));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Lightbox controls
  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
    }
  });
}

/**
 * Add stagger delays to grouped reveal elements
 */
function initStaggeredReveals() {
  // Feature cards
  const features = document.querySelectorAll('.feature');
  features.forEach((el, i) => el.setAttribute('data-delay', i + 1));

  // Offer cards
  const offers = document.querySelectorAll('.offer__card');
  offers.forEach((el, i) => el.setAttribute('data-delay', i + 1));

  // Stats items
  const stats = document.querySelectorAll('.stats__item');
  stats.forEach((el, i) => el.setAttribute('data-delay', i + 1));

  // About achievements
  const achievements = document.querySelectorAll('.about__achievements li');
  achievements.forEach((el, i) => {
    el.classList.add('reveal');
    el.setAttribute('data-delay', i + 1);
  });
}

/**
 * Global function for mobile menu toggle (used in onclick)
 */
window.toggleMenu = function() {
  const menuBtn = document.querySelector('.nav__menu-btn');
  if (menuBtn) menuBtn.click();
};

/**
 * Hero Typewriter Effect
 * Cycles through words with typewriter animation
 */
function initHeroTypewriter() {
  const typewriterEl = document.getElementById('heroTypewriter');
  if (!typewriterEl) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const words = ['TRENING', 'WALKA', 'SIŁA', 'FORMA', 'WYGRANA'];
  let wordIndex = 0;
  let charIndex = words[0].length;
  let isDeleting = true;
  let isPaused = false;

  const typeSpeed = 80;
  const deleteSpeed = 50;
  const pauseTime = 2000;

  function type() {
    const currentWord = words[wordIndex];

    if (isPaused) {
      isPaused = false;
      isDeleting = true;
      setTimeout(type, pauseTime);
      return;
    }

    if (isDeleting) {
      charIndex--;
      typewriterEl.textContent = currentWord.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
      setTimeout(type, deleteSpeed);
    } else {
      charIndex++;
      typewriterEl.textContent = words[wordIndex].substring(0, charIndex);

      if (charIndex === words[wordIndex].length) {
        isPaused = true;
        setTimeout(type, 100);
        return;
      }
      setTimeout(type, typeSpeed);
    }
  }

  // Start after initial pause
  setTimeout(type, pauseTime);
}

/**
 * Scroll to Top Button
 * Shows/hides button based on scroll position
 */
function initScrollToTop() {
  const scrollBtn = document.getElementById('scrollToTop');
  if (!scrollBtn) return;

  const scrollThreshold = 400;

  const toggleVisibility = () => {
    if (window.scrollY > scrollThreshold) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  // Check initial state
  toggleVisibility();

  // Listen for scroll with passive for performance
  window.addEventListener('scroll', toggleVisibility, { passive: true });

  // Scroll to top on click
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Keyboard support
  scrollBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollBtn.click();
    }
  });
}
