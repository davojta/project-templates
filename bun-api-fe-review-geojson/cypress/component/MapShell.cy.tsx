import { MapShell } from '../../src/client/src/components/MapShell';

describe('MapShell Component', () => {
  it('should render map container', () => {
    cy.mount(<MapShell />);
    cy.get('div').should('exist');
  });

  it('should have correct dimensions', () => {
    cy.mount(<MapShell />);
    cy.get('div').should('have.css', 'width', '100%');
    cy.get('div').should('have.css', 'height', '600px');
  });
});
