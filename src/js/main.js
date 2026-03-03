/**
 * Main JavaScript for Oskar Gajcowski Landing Page
 * Vanilla JS, no dependencies except Lucide icons
 */


// Initialize preloader immediately
initPreloader();

document.addEventListener("DOMContentLoaded", () => {
  initIcons();
  initFAQ();
  initMobileMenu();
  initSmoothScroll();
  initScrollReveal();
  initLazyLoad();
  initLazyMapLoad();
  initAnimatedCounters();
  initLightbox();
  initStaggeredReveals();
  initHeroTypewriter();
  initScrollToTop();
  initScrollSpy();
  initCustomCursor();
  initWhatsAppModal();
  initPrivacyPolicy();
  initGalleryMarquee(); // NEW: Initialize gallery slider
});

/**
 * Gallery Infinite Marquee Initialization
 */
function initGalleryMarquee() {
  if (!document.getElementById("galleryTrack1")) return;

  // Slow down on mobile
  const isMobile = window.innerWidth <= 768;
  const speed = isMobile ? 0.3 : 0.5;

  const marquee1 = new InfiniteMarquee('galleryWrapper1', 'galleryTrack1', { speed: speed, direction: -1 });
  const marquee2 = new InfiniteMarquee('galleryWrapper2', 'galleryTrack2', { speed: speed, direction: 1 });

  const container = document.getElementById('galleryContainer');
  if (container && window.matchMedia('(hover: hover)').matches) {
    container.addEventListener('mouseenter', () => {
      marquee1.setPaused(true);
      marquee2.setPaused(true);
    });

    container.addEventListener('mouseleave', () => {
      marquee1.setPaused(false);
      marquee2.setPaused(false);
    });
  }
}

/**
 * Infinite Marquee Engine
 * Handles auto-scroll, drag, inertia and infinite loop
 */
class InfiniteMarquee {
  constructor(wrapperId, trackId, options = {}) {
    this.wrapper = document.getElementById(wrapperId);
    this.track = document.getElementById(trackId);
    if (!this.wrapper || !this.track) return;

    this.baseSpeed = options.speed || 0.5;
    this.direction = options.direction || -1;

    this.currentSpeed = this.baseSpeed * this.direction;
    this.position = 0;
    this.isDragging = false;
    this.isPaused = false;
    this.startX = 0;
    this.lastX = 0;
    this.dragVelocity = 0;
    this.rafId = null;
    this.wasDragged = false;

    this.init();
  }

  init() {
    // Clone items x3 for infinite loop buffer
    const items = Array.from(this.track.children);
    items.forEach(item => this.track.appendChild(item.cloneNode(true)));
    items.forEach(item => this.track.appendChild(item.cloneNode(true)));
    items.forEach(item => this.track.appendChild(item.cloneNode(true)));

    this.segmentWidth = this.track.scrollWidth / 4;
    this.position = -this.segmentWidth;

    // Interaction Events
    this.wrapper.addEventListener('mousedown', this.onDown.bind(this));
    this.wrapper.addEventListener('touchstart', this.onDown.bind(this), { passive: true });

    window.addEventListener('mousemove', this.onMove.bind(this));
    window.addEventListener('touchmove', this.onMove.bind(this), { passive: true });

    window.addEventListener('mouseup', this.onUp.bind(this));
    window.addEventListener('touchend', this.onUp.bind(this));

    this.animate();
  }

  setPaused(paused) {
    this.isPaused = paused;
  }

  onDown(e) {
    this.isDragging = true;
    this.wasDragged = false;
    this.startX = e.pageX || e.touches[0].pageX;
    this.lastX = this.startX;
    this.dragVelocity = 0;
    this.wrapper.style.cursor = 'grabbing';
    cancelAnimationFrame(this.rafId);
  }

  onMove(e) {
    if (!this.isDragging) return;

    const x = e.pageX || e.touches[0].pageX;
    const delta = x - this.lastX;

    if (Math.abs(x - this.startX) > 5) {
      this.wasDragged = true;
    }

    this.position += delta;
    this.lastX = x;
    this.dragVelocity = delta;
    this.render();
  }

  onUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.wrapper.style.cursor = 'grab';
    this.animate();
  }

  render() {
    if (this.position <= -this.segmentWidth * 3) {
      this.position += this.segmentWidth;
    } else if (this.position > -this.segmentWidth) {
      this.position -= this.segmentWidth;
    }
    this.track.style.transform = `translate3d(${this.position}px, 0, 0)`;
  }

  animate() {
    if (this.isDragging) return;

    let targetSpeed = this.baseSpeed * this.direction;
    if (this.isPaused) targetSpeed = 0;

    if (Math.abs(this.dragVelocity) > 0.1) {
      this.position += this.dragVelocity;
      this.dragVelocity *= 0.95;
    } else {
      this.currentSpeed += (targetSpeed - this.currentSpeed) * 0.05;
      this.position += this.currentSpeed;
    }

    this.render();
    this.rafId = requestAnimationFrame(this.animate.bind(this));
  }
}

/**
 * Privacy Policy Modal Logic
 */
function initPrivacyPolicy() {
  const modal = document.getElementById("privacyModal");
  const closeBtn = modal?.querySelector(".wa-modal__close");
  const backdrop = modal?.querySelector(".wa-modal__backdrop");
  const contentContainer = document.getElementById("privacyContent");
  const triggers = document.querySelectorAll("[data-privacy-trigger]");

  if (!modal || triggers.length === 0) return;

  let contentLoaded = false;

  const loadContent = () => {
    if (contentLoaded || !contentContainer) return;
    
    if (typeof PRIVACY_POLICY_CONTENT !== "undefined") {
      contentContainer.innerHTML = PRIVACY_POLICY_CONTENT;
      contentLoaded = true;
    } else {
      contentContainer.innerHTML = "<p>Nie udało się załadować treści polityki prywatności. Proszę spróbować później.</p>";
    }
  };

  const openModal = () => {
    loadContent();
    modal.classList.add("active");
    // Ensure privacy modal is on top if opened from another modal
    modal.style.zIndex = "10002";
    document.body.classList.add("privacy-modal-open");
    // Mobile: auto-hide scrollbar
    initContentScrollbar();
  };

  const closeModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("privacy-modal-open");
    // Reset z-index after transition (timeout matches css transition)
    setTimeout(() => { modal.style.zIndex = ""; }, 300);
  };

  // Auto-hide scrollbar for mobile
  let scrollTimeout = null;
  const initContentScrollbar = () => {
    const scrollElement = modal.querySelector(".wa-modal__content-scroll");
    if (!scrollElement || window.innerWidth > 768) return;

    scrollElement.addEventListener("scroll", () => {
      scrollElement.classList.add("is-scrolling");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollElement.classList.remove("is-scrolling");
      }, 1000);
    }, { passive: true });
  };

  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

/**
 * Preloader - Fight Mode
 * Aggressive boxing-themed preloader with word flash sequence
 */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  const wordCycler = document.getElementById("preloaderWords");
  const percentDisplay = document.getElementById("preloaderPercent");
  const progressFill = document.getElementById("preloaderFill");
  const loaderLayout = document.getElementById("preloaderLoader");

  if (!preloader || !wordCycler) return;

  // Lock scroll during preloader
  document.body.classList.add("preloader-active");

  // Fighting words sequence
  const words = [
    "SIŁA",
    "WALKA",
    "FORMA",
    "PASJA",
    "WYTRWAŁOŚĆ",
    "DYSCYPLINA",
    "ODWAGA",
    "WYZWANIE",
    "TRENING",
    "MISTRZOSTWO",
    "ZWYCIĘSTWO",
  ];

  let progress = 0;
  let wordIndex = 0;

  const showWord = (text, isFinal = false) => {
    wordCycler.className = "preloader__words";
    void wordCycler.offsetWidth; // Force reflow

    if (isFinal) {
      wordCycler.innerHTML = "OSKAR <span>GAJCOWSKI</span>";
      wordCycler.classList.add("final-name");
      wordCycler.classList.add("knockout");
    } else {
      wordCycler.innerText = text;
      wordCycler.classList.add("punch-in");
    }
  };

  // Start with first word
  showWord(words[0]);

  const interval = setInterval(() => {
    let increment = Math.floor(Math.random() * 3) + 1;
    progress += increment;
    if (progress > 100) progress = 100;

    // Update percent with leading zero
    if (percentDisplay) {
      percentDisplay.innerText = `${progress < 10 ? "0" : ""}${progress}%`;
    }
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    // Calculate segment for word change
    const segmentSize = 100 / words.length;
    const currentSegment = Math.floor(progress / segmentSize);

    if (currentSegment > wordIndex && currentSegment < words.length) {
      wordCycler.classList.remove("punch-in");
      wordCycler.classList.add("blur-out");
      setTimeout(() => {
        wordIndex = currentSegment;
        showWord(words[wordIndex]);
      }, 150);
    }

    if (progress >= 100) {
      clearInterval(interval);

      setTimeout(() => {
        // Hide loader layout
        if (loaderLayout) {
          loaderLayout.style.opacity = "0";
        }

        // Final knockout with name
        showWord("", true);

        // Hide preloader at the end of knockout animation
        setTimeout(() => {
          preloader.classList.add("hidden");
          document.body.classList.remove("preloader-active");
          // Remove from DOM
          setTimeout(() => {
            preloader.remove();
          }, 100);
        }, 1400);
      }, 200);
    }
  }, 40);
}

/**
 * Initialize Lucide Icons
 */
function initIcons() {
  try {
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  } catch (error) {
    console.warn("Lucide icons failed to load:", error.message);
  }
}

/**
 * FAQ Accordion Logic
 * Only one item can be open at a time
 */
function initFAQ() {
  const faqItems = document.querySelectorAll(".faq__item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq__question");
    const answer = item.querySelector(".faq__answer");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items with smooth animation
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          const otherQuestion = otherItem.querySelector(".faq__question");
          const otherAnswer = otherItem.querySelector(".faq__answer");
          otherQuestion.setAttribute("aria-expanded", "false");
          otherAnswer.style.maxHeight = "0";
        }
      });

      // Toggle current item with dynamic height
      if (!isActive) {
        item.classList.add("active");
        question.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        item.classList.remove("active");
        question.setAttribute("aria-expanded", "false");
        answer.style.maxHeight = "0";
      }
    });

    // Keyboard accessibility
    question.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
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
  const menuBtn = document.querySelector(".nav__menu-btn");
  const navLinks = document.querySelector(".nav__links");

  if (!menuBtn || !navLinks) return;

  const toggleMenu = (open) => {
    const isExpanded =
      open !== undefined
        ? !open
        : menuBtn.getAttribute("aria-expanded") === "true";
    menuBtn.setAttribute("aria-expanded", !isExpanded);
    navLinks.classList.toggle("active", !isExpanded);

    // Toggle body scroll lock
    document.body.classList.toggle("menu-open", !isExpanded);
  };

  const closeMenu = () => {
    navLinks.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  menuBtn.addEventListener("click", () => toggleMenu());

  // Close menu on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
      closeMenu();
    }
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !menuBtn.contains(e.target) &&
      !navLinks.contains(e.target) &&
      navLinks.classList.contains("active")
    ) {
      closeMenu();
    }
  });

  // Close menu when clicking on nav link
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      const navLinks = document.querySelector(".nav__links");
      const menuBtn = document.querySelector(".nav__menu-btn");
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }

      // Scroll to target with offset for fixed nav
      const navHeight = document.querySelector(".nav")?.offsetHeight || 70;
      const targetPosition =
        target.getBoundingClientRect().top + window.pageYOffset - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Update focus for accessibility
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });
}

/**
 * Scroll Reveal Animation using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");

  if (revealElements.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    // Show all elements immediately if user prefers reduced motion
    revealElements.forEach((el) => {
      el.classList.add("revealed");
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * Lazy Loading for Map iframe
 * Loads the map only when user scrolls near the contact section
 */
function initLazyMapLoad() {
  const mapIframe = document.querySelector(".contact__map-iframe[data-src]");
  if (!mapIframe) return;

  const observerOptions = {
    root: null,
    rootMargin: "200px 0px",
    threshold: 0,
  };

  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute("data-src");
        mapObserver.unobserve(iframe);
      }
    });
  }, observerOptions);

  mapObserver.observe(mapIframe);
}

/**
 * Lazy Loading for Images
 */
function initLazyLoad() {
  const lazyImages = document.querySelectorAll("img[data-src]");

  if (lazyImages.length === 0) return;

  // Check for native lazy loading support
  if ("loading" in HTMLImageElement.prototype) {
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.removeAttribute("data-src");
      img.removeAttribute("data-srcset");
    });
    return;
  }

  // Fallback to IntersectionObserver
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.removeAttribute("data-src");
          img.removeAttribute("data-srcset");
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      });
    },
    { rootMargin: "50px 0px" }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
}

/**
 * Animated Counters for Stats Section
 */
function initAnimatedCounters() {
  const statsItems = document.querySelectorAll(".stats__number");

  if (statsItems.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  const counters = [];

  statsItems.forEach((item) => {
    const text = item.textContent.trim();
    // Parse value and suffix (e.g., "150+" => 150, "+")
    const match = text.match(/^(\d+)(.*)$/);
    if (match) {
      const targetValue = parseInt(match[1], 10);
      const suffix = match[2] || "";
      counters.push({
        element: item,
        target: targetValue,
        suffix: suffix,
        counted: false,
      });
      // Set initial value to 0
      item.innerHTML = `<span class="counter-value">0</span><span class="counter-suffix">${suffix}</span>`;
    }
  });

  const animateCounter = (counter) => {
    if (counter.counted) return;
    counter.counted = true;

    const duration = 2000;
    const startTime = performance.now();
    const valueElement = counter.element.querySelector(".counter-value");

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
    threshold: 0.3,
    rootMargin: "-100px 0px",
  };

  // Observe parent .stats__item for better intersection detection
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Find all counters whose elements are inside this stats__item
        const statsNumber = entry.target.querySelector(".stats__number");
        const counter = counters.find((c) => c.element === statsNumber);
        if (counter) {
          animateCounter(counter);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe the parent .stats__item elements instead of the spans
  const statsContainers = document.querySelectorAll(".stats__item");
  statsContainers.forEach((item) => observer.observe(item));
}

/**
 * Gallery Lightbox
 */
function initLightbox() {
  const galleryContainer = document.getElementById("galleryContainer");
  if (!galleryContainer) return;

  // Create lightbox HTML if not exists
  if (!document.getElementById("lightbox")) {
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
    document.body.insertAdjacentHTML("beforeend", lightboxHTML);
    initIcons(); // Re-init icons for the new HTML
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox.querySelector(".lightbox__image");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".lightbox__nav--next");

  // Original images data (for navigation) - we only need unique images
  const originalItems = Array.from(document.querySelectorAll(".gallery-track .gallery__item[data-index]"));
  const images = originalItems.sort((a, b) => a.dataset.index - b.index).map((item) => {
    const img = item.querySelector("img");
    return { src: img.currentSrc || img.src, alt: img.alt };
  });

  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = parseInt(index);
    // Use the latest available image source from the data-index matched original
    const targetImg = document.querySelector(`.gallery-track .gallery__item[data-index="${currentIndex}"] img`);
    lightboxImage.src = targetImg.currentSrc || targetImg.src;
    lightboxImage.alt = targetImg.alt;
    
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  const showPrev = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openLightbox(currentIndex);
  };

  const showNext = () => {
    currentIndex = (currentIndex + 1) % images.length;
    openLightbox(currentIndex);
  };

  // Event Delegation for gallery items (handles clones)
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery__item");
    if (!item || !galleryContainer.contains(item)) return;

    // Don't open if it was a drag operation (handled by InfiniteMarquee wasDragged)
    // We check if the InfiniteMarquee instances flagged a drag
    // But since we are in a separate function, we can check for a global flag or rely on small movement
    // Actually, InfiniteMarquee has its own click listener for Lightbox simulation in prototype.
    // Let's integrate it here.
    
    const index = item.getAttribute("data-index");
    if (index !== null) {
      openLightbox(index);
    }
  });

  // Lightbox controls
  closeBtn.addEventListener("click", closeLightbox);
  prevBtn.addEventListener("click", showPrev);
  nextBtn.addEventListener("click", showNext);

  // Close on background click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    switch (e.key) {
      case "Escape":
        closeLightbox();
        break;
      case "ArrowLeft":
        showPrev();
        break;
      case "ArrowRight":
        showNext();
        break;
      case "Tab":
        e.preventDefault();
        const focusableElements = [closeBtn, prevBtn, nextBtn];
        const currentFocus = document.activeElement;
        const currentIdx = focusableElements.indexOf(currentFocus);

        if (e.shiftKey) {
          const prevIdx = currentIdx <= 0 ? focusableElements.length - 1 : currentIdx - 1;
          focusableElements[prevIdx].focus();
        } else {
          const nextIdx = currentIdx >= focusableElements.length - 1 ? 0 : currentIdx + 1;
          focusableElements[nextIdx].focus();
        }
        break;
    }
  });
}

/**
 * Add stagger delays to grouped reveal elements
 */
function initStaggeredReveals() {
  // Feature cards
  const features = document.querySelectorAll(".feature");
  features.forEach((el, i) => el.setAttribute("data-delay", i + 1));

  // Offer cards
  const offers = document.querySelectorAll(".offer__card");
  offers.forEach((el, i) => el.setAttribute("data-delay", i + 1));

  // Stats items
  const stats = document.querySelectorAll(".stats__item");
  stats.forEach((el, i) => el.setAttribute("data-delay", i + 1));

  // About achievements - removed reveal animation to keep them always visible
  // The parent .about__content already has reveal animation
}

/**
 * Global function for mobile menu toggle (used in onclick)
 */
window.toggleMenu = function () {
  const menuBtn = document.querySelector(".nav__menu-btn");
  if (menuBtn) menuBtn.click();
};

/**
 * Hero Typewriter Effect
 * Cycles through words with typewriter animation
 */
function initHeroTypewriter() {
  const typewriterEl = document.getElementById("heroTypewriter");
  if (!typewriterEl) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  const words = ["WALKA", "SIŁA", "FORMA", "WYGRANA", "PASJA"];
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
 * Scroll Spy - Highlight active nav link based on scroll position
 */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px",
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute("id");

        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${activeId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/**
 * Scroll to Top Button with Progress Ring
 * Shows/hides button based on scroll position and updates progress ring
 */
function initScrollToTop() {
  const scrollBtn = document.getElementById("scrollToTop");
  if (!scrollBtn) return;

  const progressCircle = scrollBtn.querySelector(".progress-ring__circle");
  const scrollThreshold = 300;

  // Calculate circumference for progress ring (r=23, circumference = 2 * PI * r)
  const radius = 23;
  const circumference = radius * 2 * Math.PI;

  if (progressCircle) {
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;
  }

  const onScroll = () => {
    // Show/hide button
    if (window.scrollY > scrollThreshold) {
      scrollBtn.classList.add("visible");
    } else {
      scrollBtn.classList.remove("visible");
    }

    // Update progress ring
    if (progressCircle) {
      const scrollTotal =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollCurrent = window.scrollY;
      const scrollPercentage =
        scrollTotal > 0 ? scrollCurrent / scrollTotal : 0;
      const offset = circumference - scrollPercentage * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }
  };

  // Listen for scroll with passive for performance
  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial state
  onScroll();

  // Scroll to top on click
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Remove focus/hover state on touch devices
    scrollBtn.blur();
  });

  // Keyboard support
  scrollBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollBtn.click();
    }
  });
}

/**
 * Custom Cursor
 * Follows mouse with smooth lag, changes on interactive elements
 */
function initCustomCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor) return;

  // Check for touch device or small screen
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

  if (isTouchDevice || isSmallScreen) {
    cursor.style.display = "none";
    return;
  }

  // Hide default cursor
  document.body.style.cursor = "none";

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;

  // Track mouse position
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor animation
  function animateCursor() {
    const speed = 0.5;

    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Event Delegation for Hover States (handles dynamic content)
  document.addEventListener("mouseover", (e) => {
    // Check if target is interactive or inside interactive element
    const target = e.target.closest("a, button, .gallery__item, .faq__question, input, textarea, select, .custom-checkbox, .text-link, .footer__link-btn");
    
    if (target) {
      // Special handling for text inputs
      if (target.matches('input[type="text"], input[type="email"], input[type="tel"], textarea')) {
        cursor.classList.remove("cursor--hover");
        cursor.classList.add("cursor--text");
      } else {
        cursor.classList.remove("cursor--text");
        cursor.classList.add("cursor--hover");
      }
    } else {
      cursor.classList.remove("cursor--hover", "cursor--text");
    }
  });

  // Click state
  document.addEventListener("mousedown", () => {
    cursor.classList.add("cursor--click");
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("cursor--click");
  });

  // Hide cursor when leaving window
  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
  });
}

/**
 * WhatsApp Pre-Qualification Modal
 * Collects user info before redirecting to WhatsApp with personalized message
 */
function initWhatsAppModal() {
  const modal = document.getElementById("waModal");
  const form = document.getElementById("waModalForm");
  const skipBtn = document.getElementById("waModalSkip");
  const closeBtn = modal?.querySelector(".wa-modal__close");
  const backdrop = modal?.querySelector(".wa-modal__backdrop");
  const triggers = document.querySelectorAll("[data-wa-modal]");
  const consentCheckbox = document.getElementById("waConsent");

  if (!modal || !form || triggers.length === 0) return;

  // Form state
  const formData = {
    name: "",
    age: null,
    gender: null,
    level: null,
    goal: null,
  };

  // Phone number from config
  const phoneNumber = typeof CONFIG !== "undefined" ? CONFIG.PHONE_LINK : "48784036721";

  // Pages Function endpoint
  const WORKER_URL = '/api/whatsapp';

  /**
   * Open modal
   */
  const openModal = () => {
    modal.classList.add("active");
    document.body.classList.add("wa-modal-open");

    // Reinitialize Lucide icons for modal
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }

    // Focus first input
    setTimeout(() => {
      const nameInput = document.getElementById("waName");
      if (nameInput) nameInput.focus();
    }, 300);

    // Mobile: auto-hide scrollbar (show only while scrolling)
    initFormScrollbar();
  };

  /**
   * Auto-hide scrollbar for mobile form
   */
  let scrollTimeout = null;
  const initFormScrollbar = () => {
    const formElement = modal.querySelector(".wa-modal__form");
    if (!formElement || window.innerWidth > 768) return;

    formElement.addEventListener("scroll", () => {
      formElement.classList.add("is-scrolling");

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        formElement.classList.remove("is-scrolling");
      }, 1000);
    }, { passive: true });
  };

  /**
   * Close modal and reset form
   */
  const closeModal = () => {
    modal.classList.remove("active");
    document.body.classList.remove("wa-modal-open");
    resetForm();
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    form.reset();
    formData.name = "";
    formData.age = null;
    formData.gender = null;
    formData.level = null;
    formData.goal = null;

    if (consentCheckbox) {
      consentCheckbox.checked = false;
      consentCheckbox.parentElement.classList.remove("error");
    }

    // Remove all selected states from chips
    modal.querySelectorAll(".wa-modal__chip.selected").forEach((chip) => {
      chip.classList.remove("selected");
    });

    // Reset Turnstile (auto-render mode)
    if (typeof turnstile !== 'undefined') {
      turnstile.reset();
    }
    const errorEl = document.getElementById('turnstileError');
    if (errorEl) errorEl.style.display = 'none';
  };

  /**
   * Build WhatsApp message from form data
   */
  const buildMessage = () => {
    const parts = [];

    // Greeting with optional name
    if (formData.name && formData.name.trim()) {
      parts.push(`Cześć! Mam na imię ${formData.name.trim()}.`);
    } else {
      parts.push("Cześć!");
    }

    // Age and gender in one sentence if both provided
    const hasAge = formData.age && formData.age !== "skip";
    const hasGender = formData.gender && formData.gender !== "skip";

    if (hasAge && hasGender) {
      parts.push(`Mam ${formData.age} lat, jestem ${formData.gender}.`);
    } else if (hasAge) {
      parts.push(`Mam ${formData.age} lat.`);
    } else if (hasGender) {
      parts.push(`Jestem ${formData.gender}.`);
    }

    // Level and goal
    const hasLevel = formData.level && formData.level !== "skip";
    const hasGoal = formData.goal && formData.goal !== "skip";

    if (hasLevel && hasGoal) {
      parts.push(`Jestem na poziomie ${formData.level} i zależy mi na ${formData.goal}.`);
    } else if (hasLevel) {
      parts.push(`Jestem na poziomie ${formData.level}.`);
    } else if (hasGoal) {
      parts.push(`Zależy mi na ${formData.goal}.`);
    }

    // Call to action
    parts.push("Chciałbym umówić się na próbny trening wstępny!");

    return parts.join(" ");
  };

  /**
   * Validate with Worker and redirect to WhatsApp
   */
  const redirectToWhatsApp = async (useFormData = true) => {
    // Read Turnstile token from auto-generated hidden input
    const turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    const turnstileToken = turnstileInput ? turnstileInput.value : '';

    if (!turnstileToken) {
      const errorEl = document.getElementById('turnstileError');
      if (errorEl) {
        errorEl.querySelector('span').textContent = 'Proszę ukończyć weryfikację.';
        errorEl.style.display = 'block';
      }
      return;
    }

    // Show loading state on submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.textContent = 'Weryfikacja...';
      submitBtn.disabled = true;
    }

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: turnstileToken,
          formData: useFormData ? formData : null,
          phoneNumber: phoneNumber,
        }),
      });

      const result = await response.json();

      if (result.success && result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
        closeModal();
      } else {
        const errorEl = document.getElementById('turnstileError');
        if (errorEl) {
          errorEl.querySelector('span').textContent = result.error || 'Błąd weryfikacji.';
          errorEl.style.display = 'block';
        }
        // Reset Turnstile for retry
        if (typeof turnstile !== 'undefined') {
          turnstile.reset();
        }
      }
    } catch (error) {
      console.error('Request failed:', error);
      const errorEl = document.getElementById('turnstileError');
      if (errorEl) {
        errorEl.querySelector('span').textContent = 'Błąd połączenia. Spróbuj ponownie.';
        errorEl.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    }
  };

  /**
   * Validate Consent
   */
  const validateConsent = () => {
    if (consentCheckbox && !consentCheckbox.checked) {
      const wrapper = consentCheckbox.parentElement;
      wrapper.classList.remove("error");
      void wrapper.offsetWidth; // Force reflow
      wrapper.classList.add("error");
      return false;
    }
    return true;
  };

  /**
   * Handle chip selection (single select per group)
   */
  const handleChipClick = (chip) => {
    const chipsContainer = chip.closest(".wa-modal__chips");
    const field = chipsContainer.dataset.field;
    const value = chip.dataset.value;

    // Deselect all chips in this group
    chipsContainer.querySelectorAll(".wa-modal__chip").forEach((c) => {
      c.classList.remove("selected");
    });

    // Select clicked chip
    chip.classList.add("selected");

    // Update form data
    formData[field] = value;
  };

  // Event Listeners

  // Trigger buttons open modal
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // Backdrop click closes modal
  if (backdrop) {
    backdrop.addEventListener("click", closeModal);
  }

  // Escape key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });

  // Chip selection
  modal.querySelectorAll(".wa-modal__chip").forEach((chip) => {
    chip.addEventListener("click", () => handleChipClick(chip));
  });

  // Name input
  const nameInput = document.getElementById("waName");
  if (nameInput) {
    nameInput.addEventListener("input", (e) => {
      formData.name = e.target.value;
    });
  }

  // Remove error on change
  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", () => {
      if (consentCheckbox.checked) {
        consentCheckbox.parentElement.classList.remove("error");
      }
    });
  }

  // Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validateConsent()) return;
    await redirectToWhatsApp(true);  // true = use formData
  });

  // Skip button - redirect with default message
  if (skipBtn) {
    skipBtn.addEventListener("click", async () => {
      if (!validateConsent()) return;
      await redirectToWhatsApp(false);  // false = default message
    });
  }
}
