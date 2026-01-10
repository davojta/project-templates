import { MapShell } from '../../src/client/src/components/MapShell';

describe('MapShell Component', () => {
  it('should render map container', () => {
    cy.mount(<MapShell />);
    cy.get('div').should('exist');
  });

  it('should have correct dimensions', () => {
    cy.mount(<MapShell />);
    cy.get('[data-cy-root] > div').first()
      .should('have.attr', 'style')
      .and('include', 'width: 100%')
      .and('include', 'height: 600px');
  });
});
