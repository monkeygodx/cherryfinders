/* ============================================================
   CHERRY FINDERS — shared behavior
   Runs on every page. Everything is feature-guarded so a page
   without a given element simply skips that block.
   ============================================================ */
(function () {
  'use strict';

  /* ── Nav: glass on scroll ──────────────────────────────── */
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Mobile menu toggle ────────────────────────────────── */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ── Reveal on scroll ──────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ── Smooth-scroll same-page anchors ───────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var id = link.getAttribute('href');
    if (id.length < 2) return;
    link.addEventListener('click', function (e) {
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Current-year in footers ───────────────────────────── */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ── Lead / contact form → Formspree ───────────────────── */
  /* WHERE LEADS GO:
     1. Create a free form at https://formspree.io  →  copy its endpoint
        (looks like https://formspree.io/f/abcdwxyz).
     2. Paste it into the form's  data-endpoint="..."  attribute in the HTML.
     Every submission is emailed to you. No lead data is stored on the site. */
  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
    var endpoint = form.getAttribute('data-endpoint');
    var successEl = form.parentElement.querySelector('.form-success');
    var submitBtn = form.querySelector('[type="submit"]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Validate required fields
      var required = form.querySelectorAll('[required]');
      var firstBad = null;
      required.forEach(function (el) {
        el.classList.remove('invalid');
        var empty = !el.value.trim();
        // basic email sanity
        var badEmail = el.type === 'email' && el.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value);
        if (empty || badEmail) {
          el.classList.add('invalid');
          if (!firstBad) firstBad = el;
        }
      });
      if (firstBad) { firstBad.focus(); return; }

      var priorErr = form.querySelector('.form-error');
      if (priorErr) priorErr.remove();

      var label = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      // If endpoint not configured yet, show a friendly notice instead of failing silently
      if (!endpoint || /YOUR_FORM_ID/.test(endpoint)) {
        showError(form, submitBtn, label,
          'Form not connected yet — add your Formspree endpoint to finish setup.');
        return;
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          form.classList.add('sent');
          if (successEl) {
            successEl.classList.add('show');
            successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          throw new Error('bad status');
        }
      }).catch(function () {
        showError(form, submitBtn, label,
          'Something went wrong — please try again, or email cherryfinders@gmail.com directly.');
      });
    });
  });

  function showError(form, submitBtn, label, msg) {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
    var existing = form.querySelector('.form-error');
    if (existing) existing.remove();
    var p = document.createElement('p');
    p.className = 'form-error';
    p.setAttribute('role', 'alert');
    p.textContent = msg;
    (submitBtn || form).insertAdjacentElement('afterend', p);
  }

  /* ── FAQ: close siblings when one opens (single-open) ──── */
  var faq = document.querySelector('.faq');
  if (faq) {
    var items = faq.querySelectorAll('details');
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) {
          items.forEach(function (other) {
            if (other !== d) other.open = false;
          });
        }
      });
    });
  }
})();
