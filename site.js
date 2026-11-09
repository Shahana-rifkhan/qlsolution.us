(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const phone = '94757544000';
  const email = 'qlsolution.us@gmail.com';

  function openExternal(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function initHeader() {
    const header = $('.site-header');
    const progress = $('.scroll-progress');
    const topButton = $('.back-to-top');
    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle('scrolled', y > 16);
      topButton?.classList.toggle('show', y > 560);
      if (progress) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${total > 0 ? Math.min(100, (y / total) * 100) : 0}%`;
      }
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    topButton?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function initNavigation() {
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');
    const overlay = $('.nav-overlay');
    if (!toggle || !links) return;

    const setOpen = (open) => {
      links.classList.toggle('open', open);
      overlay?.classList.toggle('show', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      const icon = $('i', toggle);
      if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };

    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    overlay?.addEventListener('click', () => setOpen(false));
    $$('a', links).forEach(link => link.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
  }

  function initReveal() {
    const elements = $$('.reveal');
    if (!elements.length) return;
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    elements.forEach(el => el.classList.add('reveal-pending'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('reveal-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px' });
    elements.forEach(el => observer.observe(el));
  }

  function initCards() {
    if (!matchMedia('(pointer:fine)').matches) return;
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', event => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    });
  }

  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();
        const render = now => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = `${Math.floor(target * eased).toLocaleString()}${suffix}`;
          if (progress < 1) requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        observer.unobserve(el);
      });
    }, { threshold: .4 });
    counters.forEach(el => observer.observe(el));
  }

  function initFilters() {
    $$('[data-filter-system]').forEach(system => {
      const cards = $$('[data-filter-card]', system);
      const chips = $$('[data-filter]', system);
      const search = $('[data-search]', system);
      const empty = $('.empty-state', system);
      let active = 'all';

      const apply = () => {
        const query = (search?.value || '').trim().toLowerCase();
        let visible = 0;
        cards.forEach(card => {
          const categories = (card.dataset.category || '').split(' ');
          const categoryMatch = active === 'all' || categories.includes(active);
          const textMatch = !query || card.textContent.toLowerCase().includes(query);
          const show = categoryMatch && textMatch;
          card.classList.toggle('hidden-card', !show);
          if (show) visible++;
        });
        if (empty) empty.style.display = visible ? 'none' : 'block';
      };

      chips.forEach(chip => chip.addEventListener('click', () => {
        active = chip.dataset.filter || 'all';
        chips.forEach(item => {
          const selected = item === chip;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        apply();
      }));
      search?.addEventListener('input', apply);
      apply();
    });
  }

  function setModalState(modal, open) {
    if (!modal) return;
    modal.classList.toggle('open', open);
    modal.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('modal-open', open);
    if (open) setTimeout(() => $('[data-modal-close], input, button', modal)?.focus(), 40);
  }

  function initModals() {
    $$('[data-modal]').forEach(modal => {
      modal.addEventListener('click', event => {
        if (event.target === modal || event.target.closest('[data-modal-close]')) setModalState(modal, false);
      });
    });
    addEventListener('keydown', event => {
      if (event.key === 'Escape') $$('.modal.open').forEach(modal => setModalState(modal, false));
    });
  }

  window.openProjectModal = (service = '') => {
    const modal = $('#projectModal');
    if (service) {
      const select = $('#projectType', modal || document);
      if (select && [...select.options].some(option => option.value === service || option.text === service)) select.value = service;
    }
    setModalState(modal, true);
  };

  function getProjectMessage() {
    const form = $('#projectForm');
    if (!form || !form.reportValidity()) return null;
    const data = new FormData(form);
    return `Hello Quantum Leap Solution,\n\nI want to start a project.\n\nClient Details:\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\n\nProject Details:\nProject Type: ${data.get('projectType')}\nEstimated Budget: ${data.get('budget') || 'Not mentioned'}\nExpected Timeline: ${data.get('timeline') || 'Not mentioned'}\n\nMessage:\n${data.get('message') || 'No additional message'}\n\nPlease contact me with the next steps.\n\nThank you.`;
  }

  window.sendProjectEmail = () => {
    const message = getProjectMessage();
    if (!message) return;
    location.href = `mailto:${email}?subject=${encodeURIComponent('Project Inquiry from Website')}&body=${encodeURIComponent(message)}`;
  };

  window.sendProjectWhatsApp = () => {
    const message = getProjectMessage();
    if (message) openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  function initServiceActions() {
    $$('[data-service-email]').forEach(button => button.addEventListener('click', () => {
      const title = button.dataset.serviceEmail;
      const description = button.closest('[data-filter-card]')?.querySelector('p')?.textContent.trim() || '';
      const body = `Hello Quantum Leap Solution,\n\nI am interested in your ${title} service.\n\nService Details:\n${description}\n\nPlease share more details, pricing, timeline, and the next steps.\n\nMy Details:\nName:\nPhone:\nBusiness Name:\nProject Requirement:\n\nThank you.`;
      location.href = `mailto:${email}?subject=${encodeURIComponent(`Service Inquiry - ${title}`)}&body=${encodeURIComponent(body)}`;
    }));
    $$('[data-service-whatsapp]').forEach(button => button.addEventListener('click', () => {
      const title = button.dataset.serviceWhatsapp;
      const description = button.closest('[data-filter-card]')?.querySelector('p')?.textContent.trim() || '';
      const body = `Hello Quantum Leap Solution,\n\nI am interested in your ${title} service.\n\nService Details:\n${description}\n\nPlease share more details, pricing, timeline, and the next steps.\n\nMy Details:\nName:\nPhone:\nBusiness Name:\nProject Requirement:`;
      openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(body)}`);
    }));
  }

  function getContactMessage() {
    const form = $('#contactForm');
    if (!form || !form.reportValidity()) return null;
    const data = new FormData(form);
    return `Hello Quantum Leap Solution,\n\nI would like to contact your team.\n\nClient Details:\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\n\nInquiry Details:\nService Interested In: ${data.get('service')}\nEstimated Budget: ${data.get('budget') || 'Not mentioned'}\n\nMessage:\n${data.get('message')}\n\nPlease get back to me with more details.\n\nThank you.`;
  }

  window.sendContactEmail = () => {
    const message = getContactMessage();
    if (message) location.href = `mailto:${email}?subject=${encodeURIComponent('Contact Inquiry from Website')}&body=${encodeURIComponent(message)}`;
  };
  window.sendContactWhatsApp = () => {
    const message = getContactMessage();
    if (message) openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  function initWhatsApp() {
    const panel = $('#whatsappPanel');
    const trigger = $('.whatsapp-trigger');
    const close = $('[data-chat-close]');
    const setOpen = open => {
      panel?.classList.toggle('open', open);
      trigger?.setAttribute('aria-expanded', String(open));
    };
    trigger?.addEventListener('click', () => setOpen(!panel?.classList.contains('open')));
    close?.addEventListener('click', () => setOpen(false));
    $$('[data-chat-message]').forEach(button => button.addEventListener('click', () => {
      openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(button.dataset.chatMessage)}`);
    }));
    $('[data-chat-send]')?.addEventListener('click', () => {
      const text = $('#chatMessage')?.value.trim();
      if (!text) { $('#chatMessage')?.focus(); return; }
      openExternal(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
    });
  }

  function initLightbox() {
    const modal = $('#lightbox');
    const target = $('#lightboxImage');
    $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
      if (target) {
        target.src = button.dataset.lightbox;
        target.alt = button.dataset.alt || 'Image preview';
      }
      setModalState(modal, true);
    }));
  }

  function initImageFallbacks() {
    $$('img').forEach(image => image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      const parent = image.parentElement;
      if (!parent) return;
      image.style.display = 'none';
      parent.classList.add('image-fallback');
      if (!parent.querySelector('.fallback-icon')) {
        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-image fallback-icon';
        icon.setAttribute('aria-hidden', 'true');
        Object.assign(icon.style, { fontSize: '32px', color: '#666', margin: 'auto' });
        parent.appendChild(icon);
      }
    }));
  }

  function initPremiumTilt() {
    if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    $$('[data-tilt]').forEach(element => {
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        element.style.transform = `perspective(1100px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-3px)`;
      });
      element.addEventListener('pointerleave', () => {
        element.style.transform = '';
      });
    });

    const stage = $('[data-quantum-stage]');
    const core = $('.quantum-core', stage || document);
    if (stage && core) {
      stage.addEventListener('pointermove', event => {
        const rect = stage.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        core.style.setProperty('--stage-rx', `${(-8 - y * 20).toFixed(1)}deg`);
        core.style.setProperty('--stage-ry', `${(12 + x * 26).toFixed(1)}deg`);
      });
      stage.addEventListener('pointerleave', () => {
        core.style.setProperty('--stage-rx', '-8deg');
        core.style.setProperty('--stage-ry', '12deg');
      });
    }
  }

  function initReviewCarousel() {
    const carousel = $('[data-review-carousel]');
    if (!carousel) return;
    const track = $('.review-track', carousel);
    const slides = $$('.review-card', carousel);
    const dots = $$('.review-dots span', carousel);
    const previous = $('[data-review-prev]', carousel);
    const next = $('[data-review-next]', carousel);
    if (!track || slides.length < 2) return;
    let index = 0;
    let timer;

    const show = newIndex => {
      index = (newIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === index));
      slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== index)));
    };
    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => show(index + 1), 6500);
    };
    previous?.addEventListener('click', () => { show(index - 1); start(); });
    next?.addEventListener('click', () => { show(index + 1); start(); });
    carousel.addEventListener('pointerenter', stop);
    carousel.addEventListener('pointerleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', start);
    show(0);
    start();
  }

  function initReviewScroller() {
    const slider = $('[data-review-scroller]');
    if (!slider) return;
    const row = $('.reviews-row', slider);
    const previous = $('[data-review-prev]', slider);
    const next = $('[data-review-next]', slider);
    if (!row) return;
    const move = direction => {
      const card = $('.review-tile', row);
      const gap = 18;
      const distance = card ? card.getBoundingClientRect().width + gap : row.clientWidth * .8;
      row.scrollBy({ left: direction * distance, behavior: 'smooth' });
    };
    previous?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
  }

  function initAccordions() {
    $$('.faq-list details').forEach(item => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        $$('.faq-list details', item.closest('.faq-list')).forEach(other => {
          if (other !== item) other.open = false;
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initNavigation();
    initReveal();
    initCards();
    initCounters();
    initFilters();
    initModals();
    initServiceActions();
    initWhatsApp();
    initLightbox();
    initImageFallbacks();
    initPremiumTilt();
    initReviewCarousel();
    initReviewScroller();
    initAccordions();
  });
})();
