describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
  });

  it('should show login page', () => {
    cy.contains('Welcome back').should('be.visible');
    cy.contains('Sign In').should('be.visible');
  });

  it('should show validation errors for empty form', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
  });

  it('should show error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email').should('be.visible');
  });

  it('should show error for wrong credentials', () => {
    cy.get('input[type="email"]').type('wrong@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.wait(2000);
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should login successfully with correct credentials', () => {
    cy.get('input[type="email"]').type('Rishi@gmail.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });
});
