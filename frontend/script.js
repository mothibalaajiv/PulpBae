// Beginner note:
// This file powers the animation, mobile menu, live MongoDB-backed order counter,
// modal popup, statistics animation, testimonials slider, and newsletter UI.

const apiBaseUrl = (window.PULPBAE_API_URL || "").replace(/\/$/, "");

const pageLoader = document.querySelector("#pageLoader");
const scrollProgress = document.querySelector("#scrollProgress");
const siteHeader = document.querySelector("#siteHeader");
const navToggle = document.querySelector("#navToggle");
const navLinks = document.querySelector("#navLinks");
const orderButtons = document.querySelectorAll("[data-order-button]");
const productCards = document.querySelectorAll("[data-product-card]");
const newsletterForm = document.querySelector("#newsletterForm");
const newsletterMessage = document.querySelector("#newsletterMessage");
const year = document.querySelector("#year");
const comingSoonPageUrl = "coming-soon.html";

const testimonials = [
  {
    text: "The orange juice feels like sunshine with a black cap. Premium, playful, and dangerously easy to crave.",
    name: "Aarav M.",
    role: "Fitness Creator"
  },
  {
    text: "Coconut Water is clean, chilled, and exactly what I want after a long commute. PulpBae has main-character energy.",
    name: "Nisha R.",
    role: "Startup Founder"
  },
  {
    text: "The lime juice hits that tangy-cool spot perfectly. It tastes like summer finally learned branding.",
    name: "Dev K.",
    role: "Food Blogger"
  }
];

let testimonialIndex = 0;

function setLoadingDone() {
  window.setTimeout(() => {
    pageLoader.classList.add("hidden");
  }, 550);
}

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

  scrollProgress.style.width = `${progress}%`;
  siteHeader.classList.toggle("scrolled", scrollTop > 12);
}

function toggleMobileNavigation() {
  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMobileNavigation() {
  navLinks.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function animateNumber(element, start, end, duration = 700) {
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (end - start) * easedProgress);

    element.textContent = value.toLocaleString("en-IN");

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

async function postAnalyticsAndRedirect(path, body = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 1500);

  try {
    await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (error) {
    // Keep the customer journey smooth even if analytics is temporarily unavailable.
  } finally {
    window.clearTimeout(timeout);
    window.location.href = comingSoonPageUrl;
  }
}

function incrementOrderCount(button) {
  button.disabled = true;
  button.textContent = "Opening...";
  postAnalyticsAndRedirect("/api/orders/increment");
}

function recordProductCardClick(card) {
  const product = card.dataset.productCard;

  card.classList.add("was-clicked");
  window.setTimeout(() => {
    card.classList.remove("was-clicked");
  }, 450);

  postAnalyticsAndRedirect("/api/products/click", { product });
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupStatisticCounters() {
  const statNumbers = document.querySelectorAll("[data-stat-target]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const target = Number(entry.target.dataset.statTarget);
        animateNumber(entry.target, 0, target, 900);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.45
    }
  );

  statNumbers.forEach((number) => observer.observe(number));
}

function renderTestimonial() {
  const testimonial = testimonials[testimonialIndex];
  document.querySelector("#testimonialText").textContent = testimonial.text;
  document.querySelector("#testimonialName").textContent = testimonial.name;
  document.querySelector("#testimonialRole").textContent = testimonial.role;

  document.querySelectorAll(".testimonial-dots button").forEach((button, index) => {
    button.classList.toggle("active", index === testimonialIndex);
  });
}

function setupTestimonials() {
  const dotsContainer = document.querySelector("#testimonialDots");

  testimonials.forEach((testimonial, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Show testimonial from ${testimonial.name}`);
    button.addEventListener("click", () => {
      testimonialIndex = index;
      renderTestimonial();
    });
    dotsContainer.appendChild(button);
  });

  renderTestimonial();

  window.setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % testimonials.length;
    renderTestimonial();
  }, 4500);
}

function setupNewsletter() {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailInput = document.querySelector("#newsletterEmail");
    newsletterMessage.textContent = `You're on the first-pour list, ${emailInput.value}.`;
    newsletterForm.reset();
  });
}

function setupEventListeners() {
  window.addEventListener("load", setLoadingDone);
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  navToggle.addEventListener("click", toggleMobileNavigation);
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNavigation);
  });

  orderButtons.forEach((button) => {
    button.addEventListener("click", () => incrementOrderCount(button));
  });

  productCards.forEach((card) => {
    card.addEventListener("click", () => recordProductCardClick(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        recordProductCardClick(card);
      }
    });
  });

}

function init() {
  year.textContent = new Date().getFullYear();
  updateScrollProgress();
  setupEventListeners();
  setupRevealAnimations();
  setupStatisticCounters();
  setupTestimonials();
  setupNewsletter();
}

init();
