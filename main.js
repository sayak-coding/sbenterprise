/* S. B. Enterprise – main.js */
'use strict';

/* ── HEADER SCROLL ─────────────────────── */
const hdr = document.querySelector('.hdr');
const nav = document.querySelector('.nav');
const btn = document.querySelector('.burger');
const onScroll = () => hdr.classList.toggle('solid', scrollY > 50);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

/* ── MOBILE MENU ───────────────────────── */
btn && btn.addEventListener('click', () => {
  const o = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', o);
});
nav && nav.addEventListener('click', e => {
  if (e.target.closest('a')) nav.classList.remove('open');
});

/* ── YEAR ──────────────────────────────── */
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

/* ── SCROLL REVEAL ─────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger');
if (revealEls.length) {
  const ro = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        ro.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => ro.observe(el));
}

/* ── PARALLAX ──────────────────────────── */
const parallaxBgs = document.querySelectorAll('.parallax-strip .bg, .hero-bg img');
let ticking = false;
function doParallax() {
  parallaxBgs.forEach(el => {
    const rect = el.closest('.parallax-strip, .hero') ?.getBoundingClientRect();
    if (!rect) return;
    const progress = -rect.top / (rect.height + window.innerHeight);
    const shift = progress * 80; // px
    el.style.transform = `translateY(${shift}px)`;
  });
  ticking = false;
}
if (parallaxBgs.length) {
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(doParallax); ticking = true; }
  }, { passive: true });
  doParallax();
}

/* ── CURSOR GLOW ───────────────────────── */
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);
let glowX = 0, glowY = 0, currentX = 0, currentY = 0;
let glowTicking = false;
document.addEventListener('mousemove', e => {
  glowX = e.clientX; glowY = e.clientY;
  if (!glowTicking) {
    requestAnimationFrame(() => {
      currentX += (glowX - currentX) * 0.08;
      currentY += (glowY - currentY) * 0.08;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      glowTicking = false;
    });
    glowTicking = true;
  }
});
document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });

/* ── SMOOTH COUNT-UP (stats numbers) ─────── */
function countUp(el, target, duration = 1600) {
  const isNum = !isNaN(parseInt(target));
  if (!isNum) return;
  let start = 0;
  const startTime = performance.now();
  const suffix = target.replace(/[0-9]/g, '');
  const num = parseInt(target);
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const cur = Math.round(eased * num);
    el.textContent = cur + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
const statNums = document.querySelectorAll('.stats strong');
if (statNums.length) {
  const sro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const original = e.target.dataset.val || e.target.textContent;
        e.target.dataset.val = original;
        countUp(e.target, original);
        sro.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => sro.observe(el));
}

/* ── CARD TILT (subtle 3D on hover) ───── */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── ENQUIRY FORM ──────────────────────── */
const form = document.getElementById('enq');
if (form) {
  const out = form.querySelector('.fstatus');
  const say = (m, e) => { out.textContent = m; out.classList.toggle('err', !!e); };
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const d = Object.fromEntries(new FormData(form));
    const to = form.dataset.email;
    if (form.dataset.endpoint) {
      say('Sending…');
      try {
        const r = await fetch(form.dataset.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(d)
        });
        if (!r.ok) throw 0;
        form.reset();
        say('Thank you. We have received your enquiry and will reply soon.');
      } catch {
        say('Something went wrong. Please email us at ' + to + ' instead.', 1);
      }
      return;
    }
    const body = Object.entries(d).map(([k, v]) => k + ': ' + v).join('\n');
    location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Enquiry: ' + d.Product) + '&body=' + encodeURIComponent(body);
    say('Your email app should open with your enquiry filled in. Press send there to finish.');
  });
}
