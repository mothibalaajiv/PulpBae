// Beginner note:
// This file powers loading, navigation, reveal animations, and private click tracking.

const apiBaseUrl = (window.PULPBAE_API_URL || "").replace(/\/$/, "");

const pageLoader = document.querySelector("#pageLoader");
const scrollProgress = document.querySelector("#scrollProgress");
const siteHeader = document.querySelector("#siteHeader");
const navToggle = document.querySelector("#navToggle");
const navLinks = document.querySelector("#navLinks");
const orderButtons = document.querySelectorAll("[data-order-button]");
const productCards = document.querySelectorAll("[data-product-card]");
const comingSoonPageUrl = "coming-soon.html";

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
  if (!navToggle) {
    return;
  }

  const isOpen = navLinks.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

function closeMobileNavigation() {
  navLinks.classList.remove("is-open");

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
  }
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

function setupEventListeners() {
  window.addEventListener("load", setLoadingDone);
  window.addEventListener("scroll", updateScrollProgress, { passive: true });

  if (navToggle) {
    navToggle.addEventListener("click", toggleMobileNavigation);
  }
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
  updateScrollProgress();
  setupEventListeners();
  setupRevealAnimations();
}

init();
