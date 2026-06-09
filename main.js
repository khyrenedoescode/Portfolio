// ============================================================
// PARTICLE COLORS
// ============================================================
let particleColor = "rgba(239, 68, 68,";
let lineColor = "rgba(239, 68, 68,";

// ============================================================
// DARK / LIGHT MODE TOGGLE
// ============================================================
const themeBtn = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

function updateThemeIcon(theme) {
  const icon = themeBtn.querySelector("i");
  icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
  themeBtn.setAttribute(
    "aria-label",
    theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode",
  );
}

function applyTheme(theme) {
  // ✅ FIX: This line was missing — data-theme was never being set on toggle
  htmlEl.setAttribute("data-theme", theme);

  if (theme === "light") {
    document.body.style.background = "#f0f2f5";
    particleColor = "rgba(180, 30, 30,";
    lineColor = "rgba(180, 30, 30,";
  } else {
    document.body.style.background = "#0a0a0f";
    particleColor = "rgba(239, 68, 68,";
    lineColor = "rgba(239, 68, 68,";
  }
}

// Apply saved theme on load
const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = htmlEl.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
  updateThemeIcon(next);
});

// ============================================================
// MOBILE MENU TOGGLE
// ============================================================
const menuIcon = document.getElementById("menu-icon");
const navLinks = document.querySelector(".nav-links");

const overlay = document.createElement("div");
overlay.classList.add("nav-overlay");
document.body.appendChild(overlay);

function openMenu() {
  navLinks.classList.add("active");
  overlay.classList.add("active");
  menuIcon.querySelector("i").className = "fas fa-xmark";
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  navLinks.classList.remove("active");
  overlay.classList.remove("active");
  menuIcon.querySelector("i").className = "fas fa-bars";
  document.body.style.overflow = "";
}

menuIcon.addEventListener("click", () => {
  navLinks.classList.contains("active") ? closeMenu() : openMenu();
});

overlay.addEventListener("click", closeMenu);

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

// ============================================================
// ACTIVE NAV LINK ON SCROLL
// ============================================================
const sections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav-links a");

function updateActiveNav() {
  const scrollPos = window.scrollY + 150;
  let matched = false;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (scrollPos >= top && scrollPos < bottom) {
      allNavLinks.forEach((l) => l.classList.remove("active"));
      const match = document.querySelector(
        `.nav-links a[href="#${section.id}"]`,
      );
      if (match) match.classList.add("active");
      matched = true;
    }
  });

  // Always highlight Home when at very top
  if (!matched || window.scrollY < 80) {
    allNavLinks.forEach((l) => l.classList.remove("active"));
    const homeLink = document.querySelector('.nav-links a[href="#home"]');
    if (homeLink) homeLink.classList.add("active");
  }
}

// ============================================================
// PARTICLE BACKGROUND
// ============================================================
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let width, height, particles;
const PARTICLE_COUNT = 80;
const MAX_DIST = 140;
const MOUSE_RADIUS = 120;
let mouse = { x: -9999, y: -9999 };
let scrollY = 0;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

class Particle {
  constructor() {
    this.reset(true);
  }
  reset(initial) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + 10;
    this.size = Math.random() * 2 + 1;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = -(Math.random() * 0.3 + 0.1);
    this.opacity = Math.random() * 0.5 + 0.2;
    this.scrollFactor = Math.random() * 0.08 + 0.02;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < MOUSE_RADIUS) {
      const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
      this.x += dx * force * 0.015;
      this.y += dy * force * 0.015;
    }
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < -10) this.reset(false);
  }
  draw() {
    const drawY = this.y + scrollY * this.scrollFactor;
    ctx.beginPath();
    ctx.arc(this.x, drawY, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `${particleColor} ${this.opacity})`;
    ctx.fill();
  }
}

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const ayDraw = a.y + scrollY * a.scrollFactor;
      const byDraw = b.y + scrollY * b.scrollFactor;
      const dx = a.x - b.x;
      const dy = ayDraw - byDraw;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.18;
        ctx.strokeStyle = `${lineColor} ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, ayDraw);
        ctx.lineTo(b.x, byDraw);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  drawLines();
  requestAnimationFrame(animate);
}

function init() {
  resize();
  particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  animate();
}

// ============================================================
// TYPING EFFECT
// ============================================================
// ✅ Typed.js is loaded from CDN in Homepage.html before this script
if (typeof Typed !== "undefined" && document.getElementById("element")) {
  new Typed("#element", {
    strings: [
      "Full Stack Developer",
      "Frontend Developer",
      "Back End Developer",
      "Web Developer",
      "UI/UX Designer",
      "Mobile App Developer",
    ],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    loop: true,
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  updateActiveNav();
});
window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});
window.addEventListener("resize", resize);

updateActiveNav();
init();

// ============================================================
// CLEAR FORM AFTER SUBMIT
// ============================================================
const contactForm = document.querySelector(".contact-form-side form");
if (contactForm) {
  contactForm.addEventListener("submit", () => {
    setTimeout(() => contactForm.reset(), 100);
  });
}

// ============================================================
// CV DROPDOWN TOGGLE
// ============================================================
const cvBtn = document.getElementById('download-cv-btn');
const cvWrap = cvBtn ? cvBtn.closest('.cv-dropdown-wrap') : null;

if (cvBtn && cvWrap) {
    cvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cvWrap.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        cvWrap.classList.remove('open');
    });
}

// ============================================================
// CERTIFICATES SHOW MORE TOGGLE
// ============================================================
const certsToggleBtn = document.getElementById('certs-toggle-btn');
const certsGrid = document.getElementById('certs-grid');
// AFTER
if (certsToggleBtn && certsGrid) {
    certsToggleBtn.addEventListener('click', () => {
        const isExpanded = certsGrid.classList.toggle('expanded');
        certsToggleBtn.classList.toggle('open', isExpanded);
        certsToggleBtn.querySelector('span').textContent = isExpanded ? 'Show Less' : 'Show More';

        if (!isExpanded) {
            setTimeout(() => {
                document.getElementById('certificates').scrollIntoView({ behavior: 'smooth' });
            }, 350);
        }
    });
}
// ============================================================
// CERTIFICATES COUNT
// ============================================================
const certsCountEl = document.getElementById('certs-count');
const allCertCards = document.querySelectorAll('#certs-grid .cert-new-card');

if (certsCountEl && allCertCards.length) {
    certsCountEl.textContent = allCertCards.length;
}