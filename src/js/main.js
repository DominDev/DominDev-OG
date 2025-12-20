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
});

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
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
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
  const statsItems = document.querySelectorAll(".stats__item h3");

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
    threshold: 0.5,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = counters.find((c) => c.element === entry.target);
        if (counter) {
          animateCounter(counter);
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach((counter) => observer.observe(counter.element));
}

/**
 * Gallery Lightbox
 */
function initLightbox() {
  const galleryItems = document.querySelectorAll(".gallery__item");

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

  document.body.insertAdjacentHTML("beforeend", lightboxHTML);

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = lightbox.querySelector(".lightbox__image");
  const closeBtn = lightbox.querySelector(".lightbox__close");
  const prevBtn = lightbox.querySelector(".lightbox__nav--prev");
  const nextBtn = lightbox.querySelector(".lightbox__nav--next");

  let currentIndex = 0;
  const images = Array.from(galleryItems).map((item) => {
    const img = item.querySelector("img");
    return { src: img.src, alt: img.alt };
  });

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImage.src = images[index].src;
    lightboxImage.alt = images[index].alt;
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    lucide.createIcons();
    closeBtn.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
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
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", "Otwórz zdjęcie w powiększeniu");

    item.addEventListener("click", () => openLightbox(index));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(index);
      }
    });
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
    const speed = 0.15;

    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  // Interactive elements hover state
  const interactiveElements = document.querySelectorAll(
    "a, button, .gallery__item, .faq__question, input, textarea, select"
  );

  interactiveElements.forEach((el) => {
    el.style.cursor = "none";

    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor--hover");
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor--hover");
    });
  });

  // Text input hover state
  const textElements = document.querySelectorAll(
    'input[type="text"], input[type="email"], input[type="tel"], textarea'
  );

  textElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.remove("cursor--hover");
      cursor.classList.add("cursor--text");
    });

    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor--text");
    });
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
