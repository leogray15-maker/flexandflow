// ===================== Sticky header on scroll =====================
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===================== Mobile nav =====================
const navToggle = document.getElementById('navToggle');
const body = document.body;

const closeNav = () => {
  body.classList.remove('nav-open');
  navToggle.setAttribute('aria-expanded', 'false');
};

navToggle.addEventListener('click', () => {
  const open = body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close menu when a link is tapped
document.querySelectorAll('#nav a').forEach((link) =>
  link.addEventListener('click', closeNav)
);

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});

// ===================== Scroll reveal =====================
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}

// ===================== Contact form (front-end demo) =====================
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'form-status';

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  const company = form.company ? form.company.value : '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !email || !message) {
    status.textContent = 'Please fill in all fields.';
    status.classList.add('error');
    return;
  }
  if (!emailOk) {
    status.textContent = 'Please enter a valid email address.';
    status.classList.add('error');
    return;
  }

  submitBtn.disabled = true;
  const originalLabel = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  status.textContent = '';

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, company }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok) {
      status.textContent = `Thanks ${name}! Your message is on its way — we'll be in touch soon.`;
      status.classList.add('success');
      form.reset();
    } else {
      status.textContent = data.error || 'Something went wrong. Please try again.';
      status.classList.add('error');
    }
  } catch (_) {
    status.textContent = 'Network error. Please check your connection and try again.';
    status.classList.add('error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
});

// ===================== Footer year =====================
document.getElementById('year').textContent = new Date().getFullYear();
