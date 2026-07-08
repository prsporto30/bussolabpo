/* ============================================================
   Bússola BPO Financeiro — calculadora de precificação (Alpine.js)
   Fórmula: Preço Mínimo = Custo Direto / (1 - (%Impostos + %Despesas + %Margem))
   ============================================================ */
document.addEventListener('alpine:init', function () {

  /* ----------------------------------------------------------
     Calculadora interativa
     ---------------------------------------------------------- */
  Alpine.data('calculatorApp', function () {
    return {
      custoDireto: 6200,
      impostos: 8,
      despesas: 18,
      margem: 15,
      resultado: 0,
      erro: false,
      somaPercentuais: 41,
      resultEl: null,

      init: function () {
        this.resultEl = this.$el.querySelector('#resultadoNumero');
        this.calcular(true);
      },

      format1: function (n) {
        return (Math.round(n * 10) / 10).toString().replace('.', ',');
      },

      calcular: function (isInitial) {
        var custo = Number(this.custoDireto) || 0;
        if (custo < 0) custo = 0;

        var impostos = clampPercent(this.impostos, 0, 20);
        var despesas = clampPercent(this.despesas, 0, 40);
        var margem = clampPercent(this.margem, 0, 40);

        var soma = impostos + despesas + margem;
        this.somaPercentuais = soma;

        if (soma >= 100) {
          this.erro = true;
          this.resultado = 0;
          return;
        }

        this.erro = false;
        var fator = 1 - soma / 100;
        var novoResultado = custo / fator;
        var anterior = this.resultado;
        this.resultado = novoResultado;

        if (this.resultEl && window.BussolaAnim) {
          window.BussolaAnim.animateOdometer(this.resultEl, novoResultado, {
            from: isInitial ? 0 : anterior,
            duration: isInitial ? 1 : 0.5
          });
        } else if (this.resultEl) {
          this.resultEl.textContent = 'R$ ' + novoResultado.toFixed(2).replace('.', ',');
        }
      }
    };
  });

  /* ----------------------------------------------------------
     Formulário de captura (isca — Guia Rápido de Precificação)
     ---------------------------------------------------------- */
  Alpine.data('leadForm', function () {
    return {
      nome: '',
      telefone: '',
      email: '',
      enviado: false,
      touched: { telefone: false, email: false },

      maskPhone: function () {
        var digits = this.telefone.replace(/\D/g, '').slice(0, 11);
        var out = digits;
        if (digits.length > 10) {
          out = digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        } else if (digits.length > 6) {
          out = digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (digits.length > 2) {
          out = digits.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        } else if (digits.length > 0) {
          out = digits.replace(/(\d{0,2})/, '($1');
        }
        this.telefone = out.trim();
      },

      get telefoneValido() {
        var digits = this.telefone.replace(/\D/g, '');
        return digits.length === 10 || digits.length === 11;
      },

      get emailValido() {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
      },

      get formValido() {
        return this.telefoneValido && this.emailValido;
      },

      onSubmit: function (event) {
        this.touched.telefone = true;
        this.touched.email = true;

        if (!this.formValido) {
          event.preventDefault();
          return;
        }

        // Formulário aponta para action="#" (placeholder). Enquanto o endpoint real de
        // captura não estiver definido (Kiwify, e-mail marketing ou webhook próprio),
        // impedimos o envio nativo e apenas simulamos a confirmação na tela.
        // Remover este preventDefault + bloco abaixo assim que o endpoint real for configurado
        // no atributo action do <form id="lead-form"> (ver index.html).
        event.preventDefault();
        this.enviado = true;

        // Ponto de disparo do evento de conversão "Lead" do Meta Pixel / Google Ads
        // (ver comentários de instalação dos pixels em index.html <head>):
        // if (typeof fbq === 'function') fbq('track', 'Lead');
        // if (typeof gtag === 'function') gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXX/XXXXXXXX' });
      }
    };
  });
});

function clampPercent(value, min, max) {
  var n = Number(value);
  if (isNaN(n)) return min;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}
