/* ══════════════════════════════════════════════
   AEA CLUB — effects.js
   Pure live effects — zero UI changes
   • Custom cursor
   • Animated stat counters
   • Hero mouse parallax
   • Magnetic buttons
   • Text scramble on hero h1
   • Active nav section tracker
   • Floating background particles
   • Stagger card animations
   • Typing cursor on eyebrow
   ══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════
     1. CUSTOM CURSOR FOLLOWER
  ═══════════════════════════════ */
  const cursorDot  = document.createElement('div');
  const cursorRing = document.createElement('div');
  cursorDot.className  = 'fx-cursor-dot';
  cursorRing.className = 'fx-cursor-ring';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursorDot.style.transform = `translate(${mx}px,${my}px)`;
  });

  // Ring lags behind for smooth feel
  (function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animateRing);
  })();

  // Grow ring on interactive elements
  document.querySelectorAll('a, button, .department-card, .role-row, .person-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('fx-cursor-hover'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('fx-cursor-hover'));
    });

  /* ═══════════════════════════════
     2. ANIMATED STAT COUNTERS
  ═══════════════════════════════ */
  function animateCounter(el, target, suffix, duration) {
    let start = null;
    const startVal = 0;
    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = (current < 10 && target < 10)
        ? String(current).padStart(2, '0')
        : current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target < 10 ? String(target).padStart(2,'0') : target;
    }
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      statsObserver.unobserve(entry.target);

      entry.target.querySelectorAll('strong').forEach(strong => {
        const text   = strong.textContent.replace(/[^0-9]/g, '');
        const target = parseInt(text, 10);
        const suffix = strong.querySelector('span') ? strong.querySelector('span').textContent : '';
        // Clear and animate
        if (strong.querySelector('span')) {
          const spanEl = strong.querySelector('span');
          strong.textContent = '';
          strong.appendChild(document.createTextNode('0'));
          strong.appendChild(spanEl);
          animateCounter({ 
            set textContent(v) { strong.firstChild.textContent = v; } 
          }, target, suffix, 1800);
        } else {
          strong.textContent = target < 10 ? '00' : '0';
          animateCounter(strong, target, '', 1800);
        }
      });
    });
  }, { threshold: 0.4 });

  const statsEl = document.querySelector('.story-stats');
  if (statsEl) statsObserver.observe(statsEl);

  /* ═══════════════════════════════
     3. HERO MOUSE PARALLAX
  ═══════════════════════════════ */
  const hero      = document.querySelector('.hero');
  const heroCopy  = document.querySelector('.hero-copy');
  const heroStage = document.querySelector('.hero-stage');

  if (hero && heroCopy && heroStage) {
    let ticking = false;
    hero.addEventListener('mousemove', e => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const r   = hero.getBoundingClientRect();
        const x   = (e.clientX - r.left - r.width  / 2) / r.width;
        const y   = (e.clientY - r.top  - r.height / 2) / r.height;
        heroCopy.style.transform  = `translate(${x * -10}px, ${y * -6}px)`;
        heroStage.style.transform = `translate(${x *  14}px, ${y *  8}px)`;
        ticking = false;
      });
    });
    hero.addEventListener('mouseleave', () => {
      heroCopy.style.transform  = '';
      heroStage.style.transform = '';
    });
  }

  /* ═══════════════════════════════
     4. MAGNETIC BUTTONS
  ═══════════════════════════════ */
  document.querySelectorAll('.button, .header-cta, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const x   = e.clientX - r.left - r.width  / 2;
      const y   = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      setTimeout(() => btn.style.transition = '', 400);
    });
  });

  /* ═══════════════════════════════
     5. TEXT SCRAMBLE ON HERO H1
  ═══════════════════════════════ */
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    const chars    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ01!@#';
    const original = h1.innerHTML;
    const textOnly = h1.textContent;
    let frame = 0, iteration = 0;
    let interval = null;

    function scramble() {
      h1.innerHTML = textOnly.split('').map((char, i) => {
        if (char === '\n' || char === ' ') return char === '\n' ? '<br/>' : ' ';
        if (i < iteration) return original.includes('<em>') && i >= textOnly.indexOf('moves') && i < textOnly.indexOf('moves') + 5
          ? `<em>${char}</em>`
          : char;
        return `<span style="color:var(--coral);opacity:0.6">${chars[Math.floor(Math.random() * chars.length)]}</span>`;
      }).join('');

      if (iteration >= textOnly.length) {
        clearInterval(interval);
        h1.innerHTML = original;
        return;
      }
      if (frame % 3 === 0) iteration += 1.5;
      frame++;
    }

    // Run once after 600ms
    setTimeout(() => {
      interval = setInterval(scramble, 40);
    }, 600);
  }

  /* ═══════════════════════════════
     6. ACTIVE NAV SECTION TRACKER
  ═══════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ═══════════════════════════════
     7. FLOATING BACKGROUND PARTICLES
  ═══════════════════════════════ */
  function createParticles(section, count) {
    if (!section) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'fx-particle';
      p.style.cssText = `
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        width:${2 + Math.random() * 3}px;
        height:${2 + Math.random() * 3}px;
        animation-delay:${Math.random() * 6}s;
        animation-duration:${5 + Math.random() * 8}s;
        opacity:${0.1 + Math.random() * 0.25};
      `;
      section.style.position = 'relative';
      section.appendChild(p);
    }
  }

  createParticles(document.querySelector('.story'),      12);
  createParticles(document.querySelector('.departments'), 10);
  createParticles(document.querySelector('.roles'),       8);

  /* ═══════════════════════════════
     8. STAGGER DEPARTMENT CARDS
  ═══════════════════════════════ */
  const cards = document.querySelectorAll('.department-card');
  const cardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = Array.from(cards).indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, idx * 80);
      cardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  cards.forEach(c => {
    c.style.opacity  = '0';
    c.style.transform = 'translateY(24px)';
    c.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    cardObserver.observe(c);
  });

  /* ═══════════════════════════════
     9. STAGGER ROLE ROWS
  ═══════════════════════════════ */
  const rows = document.querySelectorAll('.role-row');
  const rowObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = Array.from(rows).indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }, idx * 100);
      rowObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  rows.forEach(r => {
    r.style.opacity   = '0';
    r.style.transform = 'translateX(-20px)';
    r.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    rowObserver.observe(r);
  });

  /* ═══════════════════════════════
     10. PERSON CARD FLIP GLOW
  ═══════════════════════════════ */
  document.querySelectorAll('.person-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 2;
      card.style.transform = `perspective(800px) rotateY(${x*5}deg) rotateX(${-y*5}deg) scale(1.02)`;
      card.style.boxShadow = `${-x*8}px ${-y*8}px 24px rgba(201,75,43,0.1)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.boxShadow  = '';
    });
  });

  /* ═══════════════════════════════
     11. EYEBROW TYPING CURSOR BLINK
  ═══════════════════════════════ */
  const eyebrow = document.querySelector('.eyebrow');
  if (eyebrow) {
    const cursor = document.createElement('span');
    cursor.className = 'fx-type-cursor';
    cursor.textContent = '|';
    eyebrow.appendChild(cursor);
  }

  /* ═══════════════════════════════
     12. SIGNAL STRIP PAUSE ON HOVER
  ═══════════════════════════════ */
  const track = document.querySelector('.signal-track');
  if (track) {
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }

  /* ═══════════════════════════════
     13. TEAM CAROUSEL
  ═══════════════════════════════ */
  const carousel  = document.getElementById('teamCarousel');
  const prevBtn   = document.getElementById('tcPrev');
  const nextBtn   = document.getElementById('tcNext');
  const dots      = document.querySelectorAll('.tc-dot');
  const totalCards = 5;

  if (carousel && prevBtn && nextBtn) {
    let current  = 0;
    let autoTimer = null;

    function getPerView() {
      if (window.innerWidth <= 640)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function maxIndex() { return Math.max(0, totalCards - getPerView()); }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex()));
      const cardW = carousel.children[0].offsetWidth + 2; // +gap
      carousel.style.transform = `translateX(-${current * cardW}px)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current >= maxIndex() ? 0 : current + 1); }
    function prev() { goTo(current <= 0 ? maxIndex() : current - 1); }

    function startAuto() { autoTimer = setInterval(next, 3000); }
    function stopAuto()  { clearInterval(autoTimer); }

    nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Touch swipe
    let touchStartX = 0;
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend',   e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { stopAuto(); diff > 0 ? next() : prev(); startAuto(); }
    });

    // Recalc on resize
    window.addEventListener('resize', () => goTo(current));

    startAuto();
  }

})();
