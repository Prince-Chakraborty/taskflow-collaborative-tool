describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="email"]').type('Rishi@gmail.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should show dashboard with stats', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Workspaces').should('be.visible');
    cy.contains('Total Boards').should('be.visible');
    cy.contains('Total Members').should('be.visible');
  });

  it('should show workspaces list', () => {
    cy.contains('Your Workspaces').should('be.visible');
  });

  it('should open create workspace modal', () => {
    cy.contains('New Workspace').click();
    cy.contains('Create Workspace').should('be.visible');
  });

  it('should navigate to workspace on click', () => {
    cy.get('.cursor-pointer').first().click();
    cy.url().should('include', '/workspace/');
  });
});
