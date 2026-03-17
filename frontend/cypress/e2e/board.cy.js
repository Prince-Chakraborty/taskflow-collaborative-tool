describe('Board', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="email"]').type('Rishi@gmail.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show kanban columns on board page', () => {
    cy.get('.cursor-pointer').first().click();
    cy.get('.cursor-pointer').first().click();
    cy.contains('To Do').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Done').should('be.visible');
  });

  it('should show Add a card button', () => {
    cy.get('.cursor-pointer').first().click();
    cy.get('.cursor-pointer').first().click();
    cy.contains('Add a card').should('be.visible');
  });

  it('should show Activity button', () => {
    cy.get('.cursor-pointer').first().click();
    cy.get('.cursor-pointer').first().click();
    cy.contains('Activity').should('be.visible');
  });
});
