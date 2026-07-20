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
    var card = document.getElementById('heroDashCard');
    if (!numberEl) return;

    // Exemplo por nicho: lê data-custo/data-impostos/data-despesas/data-margem do
    // card do hero, se presentes; senão usa o exemplo padrão (Vértice Serviços).
    var d = card ? card.dataset : {};
    var custo = d.custo != null ? Number(d.custo) : 6200;
    var impostos = (d.impostos != null ? Number(d.impostos) : 8) / 100;
    var despesas = (d.despesas != null ? Number(d.despesas) : 18) / 100;
    var margem = (d.margem != null ? Number(d.margem) : 15) / 100;

    var soma = impostos + despesas + margem;
    var demoResult = custo / (1 - soma);
    var fillPct = Math.round(soma * 100) + '%';

    if (prefersReducedMotion || !hasGsap) {
      numberEl.textContent = formatBRL(demoResult);
      if (fillEl) fillEl.style.width = fillPct;
      return;
    }

    gsap.delayedCall(0.4, function () {
      animateOdometer(numberEl, demoResult, { duration: 1.4 });
      if (fillEl) {
        gsap.to(fillEl, { width: fillPct, duration: 1.4, ease: 'power1.out' });
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
