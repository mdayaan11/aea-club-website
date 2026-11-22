/* ══════════════════════════════════════════════
   AEA CLUB — app.js
   Orbital canvas · Reveal · Header · Mobile menu
   Scroll progress · Join form → /api/join
   ══════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────
     SCROLL PROGRESS BAR
  ───────────────────────────── */
  const progressBar = document.querySelector('.scroll-progress span');
  function updateProgress() {
    const h = document.documentElement;
    const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
    if (progressBar) progressBar.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });

  /* ─────────────────────────────
     HEADER — scroll state
  ───────────────────────────── */
  const header = document.querySelector('.site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ─────────────────────────────
     MOBILE MENU
  ───────────────────────────── */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger to X
      const spans = menuToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-6.5px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      });
    });
  }

  /* ─────────────────────────────
     REVEAL ON SCROLL
  ───────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  /* ─────────────────────────────
     SMOOTH SCROLL for anchor links
  ───────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─────────────────────────────
     ORBITAL CANVAS ANIMATION
  ───────────────────────────── */
  const canvas = document.getElementById('orbital-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, animId;
    let mouseX = -1000, mouseY = -1000;

    // Node colours matching the coral/navy/gold palette
    const COLORS = [
      '#c94b2b', '#e8614a', '#c4973a',
      '#14213d', '#2a4580', '#7a7268',
      '#d4a853', '#e8c87a', '#8b6e4a'
    ];

    // Nodes
    const NODES = 48;
    let nodes = [];

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width  = r.width  * devicePixelRatio;
      canvas.height = r.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      W = r.width; H = r.height;
    }

    function initNodes() {
      nodes = [];
      const cx = W / 2, cy = H / 2;
      const rings = [0.18, 0.32, 0.44, 0.5];
      rings.forEach((r, ri) => {
        const count = ri === 0 ? 1 : 6 + ri * 4;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + ri * 0.5;
          const radius = r * Math.min(W, H);
          nodes.push({
            x:     cx + Math.cos(angle) * radius,
            y:     cy + Math.sin(angle) * radius,
            ox:    cx + Math.cos(angle) * radius,
            oy:    cy + Math.sin(angle) * radius,
            vx:    (Math.random() - 0.5) * 0.3,
            vy:    (Math.random() - 0.5) * 0.3,
            r:     ri === 0 ? 5 : 2 + Math.random() * 2.5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            angle: angle,
            orbit: r * Math.min(W, H),
            speed: (0.001 + Math.random() * 0.002) * (ri % 2 === 0 ? 1 : -1),
            phase: angle,
            ring:  ri
          });
        }
      });
    }

    function drawFrame(t) {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;

      // Draw orbit rings
      [0.18, 0.32, 0.44, 0.5].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r * Math.min(W, H), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(26,24,18,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Update node positions
      nodes.forEach(n => {
        n.phase += n.speed;
        const tx = cx + Math.cos(n.phase) * n.orbit;
        const ty = cy + Math.sin(n.phase) * n.orbit;

        // Mouse repulsion
        const dx = tx - mouseX, dy = ty - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (80 - dist) / 80 * 15;
          n.x += (dx / dist) * force;
          n.y += (dy / dist) * force;
        }

        n.x += (tx - n.x) * 0.05;
        n.y += (ty - n.y) * 0.05;
      });

      // Draw connections
      const CONN_DIST = 85;
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONN_DIST) {
            const alpha = (1 - d / CONN_DIST) * 0.3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(201,75,43,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach(n => {
        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, n.color + '55');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      });

      // Central pulse
      const pulse = 1 + 0.08 * Math.sin(t * 0.002);
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,75,43,0.9)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(201,75,43,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(drawFrame);
    }

    // Mouse tracking on canvas
    const heroStage = canvas.closest('.hero-stage');
    if (heroStage) {
      heroStage.addEventListener('mousemove', e => {
        const r = canvas.getBoundingClientRect();
        mouseX = e.clientX - r.left;
        mouseY = e.clientY - r.top;
      });
      heroStage.addEventListener('mouseleave', () => {
        mouseX = -1000; mouseY = -1000;
      });
    }

    // Init and resize
    resize();
    initNodes();
    requestAnimationFrame(drawFrame);

    let resizeTO;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTO);
      resizeTO = setTimeout(() => {
        cancelAnimationFrame(animId);
        resize();
        initNodes();
        requestAnimationFrame(drawFrame);
      }, 200);
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        requestAnimationFrame(drawFrame);
      }
    });
  }

  /* ─────────────────────────────
     JOIN FORM → /api/join
  ───────────────────────────── */
  const joinForm    = document.getElementById('joinForm');
  const joinSuccess = document.getElementById('joinSuccess');
  const joinError   = document.getElementById('joinError');
  const joinBtn     = document.getElementById('joinSubmitBtn');

  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (joinError) joinError.textContent = '';

      const name       = document.getElementById('jf-name').value.trim();
      const email      = document.getElementById('jf-email').value.trim();
      const department = document.getElementById('jf-dept').value;
      const year       = document.getElementById('jf-year').value;
      const motivation = document.getElementById('jf-motivation').value.trim();

      if (!name || !email || !department || !year) {
        if (joinError) joinError.textContent = 'Please fill in all required fields.';
        return;
      }

      // Set loading state
      const btnSpan  = joinBtn.querySelector('span');
      const origText = btnSpan ? btnSpan.textContent : joinBtn.textContent;
      joinBtn.disabled = true;
      if (btnSpan) btnSpan.textContent = 'Sending…';

      try {
        const res  = await fetch('/api/join', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ name, email, department, year, motivation }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          // Hide form
          joinForm.style.display = 'none';
          // Build and show success card with Member ID + WhatsApp link
          if (joinSuccess) {
            joinSuccess.innerHTML = `
              <div class="success-mark">✓</div>
              <h3>Welcome to AEA, ${name.split(' ')[0]}!</h3>
              <div class="member-id-box">
                <span class="mid-label">YOUR MEMBER ID</span>
                <span class="mid-value">${data.memberId}</span>
                <span class="mid-note">Save this — you need it to access the Projects &amp; Members area.</span>
              </div>
              <a class="whatsapp-join-btn" href="https://chat.whatsapp.com/GXeU4KvBVwX89RxCLUNIZD" target="_blank" rel="noopener">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Join our WhatsApp Community
                <span style="font-size:1.1rem;">↗</span>
              </a>
              <p>A confirmation email has been sent to <strong>${email}</strong> with your Member ID. We'll review and get back to you within 48 hours.</p>
            `;
            joinSuccess.classList.add('show');
          }

        } else {
          if (joinError) joinError.textContent = data.error || 'Something went wrong. Please try again.';
          joinBtn.disabled = false;
          if (btnSpan) btnSpan.textContent = origText;
        }
      } catch {
        if (joinError) joinError.textContent = 'Network error. Please check your connection.';
        joinBtn.disabled = false;
        if (btnSpan) btnSpan.textContent = origText;
      }
    });
  }


  /* ─────────────────────────────
     TILT EFFECT on department cards
  ───────────────────────────── */
  document.querySelectorAll('.department-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r   = card.getBoundingClientRect();
      const x   = (e.clientX - r.left) / r.width  - 0.5;
      const y   = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
