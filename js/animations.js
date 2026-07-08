/* ============================================================
   Bússola BPO Financeiro — animações (GSAP + ScrollTrigger)
   Scroll-reveal das seções, animação "odômetro" dos números
   e barra de CTA fixa (sticky) após o hero.
   ============================================================ */
(function () {
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';

  if (hasGsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ----------------------------------------------------------
     Scroll reveal — todo elemento com [data-reveal]
     ---------------------------------------------------------- */
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !hasGsap) {
      targets.forEach(function (el) {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }

    targets.forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Odômetro — anima um número de "from" até "to", formatado
     como moeda em Real (R$), atualizando o texto a cada frame.
     Usado pela calculadora interativa e pelo mock do hero.
     ---------------------------------------------------------- */
  function formatBRL(value) {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function animateOdometer(el, toValue, opts) {
    if (!el) return;
    opts = opts || {};
    var duration = opts.duration || 0.8;
    var fromValue = opts.from != null ? opts.from : (parseFloat(el.dataset.odoValue) || 0);
    var safeTo = isFinite(toValue) ? toValue : 0;

    if (prefersReducedMotion || !hasGsap) {
      el.textContent = formatBRL(safeTo);
      el.dataset.odoValue = safeTo;
      return;
    }

    var proxy = { value: fromValue };
    gsap.to(proxy, {
      value: safeTo,
      duration: duration,
      ease: 'power1.out',
      onUpdate: function () {
        el.textContent = formatBRL(proxy.value);
      },
      onComplete: function () {
        el.dataset.odoValue = safeTo;
      }
    });
  }

  /* ----------------------------------------------------------
     Demo animado no card do hero — roda uma vez ao carregar,
     ilustrando o resultado do caso Vértice Serviços.
     ---------------------------------------------------------- */
  function initHeroDemo() {
    var numberEl = document.getElementById('heroDemoNumber');
    var fillEl = document.getElementById('heroBarFill');
    if (!numberEl) return;

    // Custo direto R$6.200 / (1 - (0.08 + 0.18 + 0.15)) = R$6.200 / 0.59
    var demoResult = 6200 / (1 - (0.08 + 0.18 + 0.15));

    if (prefersReducedMotion || !hasGsap) {
      numberEl.textContent = formatBRL(demoResult);
      if (fillEl) fillEl.style.width = '41%';
      return;
    }

    gsap.delayedCall(0.4, function () {
      animateOdometer(numberEl, demoResult, { duration: 1.4 });
      if (fillEl) {
        gsap.to(fillEl, { width: '41%', duration: 1.4, ease: 'power1.out' });
      }
    });
  }

  /* ----------------------------------------------------------
     Barra de CTA fixa — some no hero, aparece depois que o
     usuário rola além dele. Funciona em desktop e mobile.
     ---------------------------------------------------------- */
  function initStickyCta() {
    var hero = document.getElementById('topo');
    var sticky = document.getElementById('stickyCta');
    if (!hero || !sticky) return;

    if (!('IntersectionObserver' in window)) {
      sticky.classList.add('is-visible');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          sticky.classList.toggle('is-visible', !entry.isIntersecting);
        });
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    );
    observer.observe(hero);
  }

  /* ----------------------------------------------------------
     Ano corrente no rodapé
     ---------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('anoAtual');
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initHeroDemo();
    initStickyCta();
    initFooterYear();
  });

  window.BussolaAnim = {
    animateOdometer: animateOdometer,
    formatBRL: formatBRL
  };
})();
