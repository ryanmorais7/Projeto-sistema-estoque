describe('Login simples', () => {
  it('faz login e esconde a tela de login', () => {
    cy.visit('http://127.0.0.1:5500/index.html');

    cy.get('#login-username').type('admin');
    cy.get('#login-password').type('1234');

    cy.contains('button', 'Entrar').click();

    // agora vira TESTE de fato:
    cy.get('#login-screen', { timeout: 10000 })
      .should('have.class', 'hidden');
  });
});

