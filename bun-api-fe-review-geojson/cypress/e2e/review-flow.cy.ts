describe('Review Flow E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the map page', () => {
    cy.contains('Map View').should('exist');
    cy.contains('Table View').should('exist');
  });

  it('should navigate to table view', () => {
    cy.contains('Table View').click();
    cy.url().should('include', '/table');
    cy.get('table').should('exist');
  });

  it('should display review controls on map page', () => {
    cy.contains('Back').should('exist');
    cy.contains('Flag').should('exist');
    cy.contains('Forward').should('exist');
  });

  it('should navigate between features', () => {
    cy.contains('Forward').click();
    cy.contains('Feature').should('exist');
  });
});
