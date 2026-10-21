// Credenciais de teste ficam em cypress.env.json (fora do git):
// { "EMAIL": "conta-de-teste@exemplo.com", "SENHA": "..." }
// Use uma conta de teste, nunca a de uma loja real: os testes navegam como ela.

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/index.html');
  });

  it('mostra erro com senha errada e continua na tela de login', () => {
    cy.get('#login-email').type('nao-existe@exemplo.com');
    cy.get('#login-password').type('senha-errada-123');
    cy.get('#login-submit-btn').click();

    cy.contains('.toast', 'E-mail ou senha inválidos', { timeout: 10000 }).should('be.visible');
    cy.get('#login-screen').should('have.class', 'active');
  });

  it('entra com a conta de teste e mostra a saudação da loja', function () {
    if (!Cypress.env('EMAIL') || !Cypress.env('SENHA')) this.skip();

    cy.get('#login-email').type(Cypress.env('EMAIL'));
    cy.get('#login-password').type(Cypress.env('SENHA'), { log: false });
    cy.get('#login-submit-btn').click();

    cy.get('#app-container', { timeout: 15000 }).should('have.class', 'active');
    cy.get('#dashboard-saudacao').invoke('text').should('match', /^Olá, .+!$/);
  });
});

describe('Regras puras do app', () => {
  beforeEach(() => {
    cy.visit('/index.html');
  });

  it('esc() neutraliza HTML vindo do banco', () => {
    cy.window().then((win) => {
      expect(win.esc('<img src=x onerror=alert(1)>')).to.equal('&lt;img src=x onerror=alert(1)&gt;');
      expect(win.esc(`"aspas" & 'apóstrofo'`)).to.equal('&quot;aspas&quot; &amp; &#39;apóstrofo&#39;');
      expect(win.esc(null)).to.equal('');
    });
  });

  it('situacaoEstoque() usa o mínimo do produto ou o padrão de 5', () => {
    cy.window().then((win) => {
      expect(win.situacaoEstoque({ quantity: 0 })).to.equal('zerado');
      expect(win.situacaoEstoque({ quantity: 5 })).to.equal('baixo');
      expect(win.situacaoEstoque({ quantity: 6 })).to.equal('ok');
      expect(win.situacaoEstoque({ quantity: 6, estoque_minimo: 10 })).to.equal('baixo');
      expect(win.situacaoEstoque({ quantity: 1, estoque_minimo: 0 })).to.equal('ok');
      expect(win.situacaoEstoque({ quantity: 3, estoque_minimo: null })).to.equal('baixo');
    });
  });
});
