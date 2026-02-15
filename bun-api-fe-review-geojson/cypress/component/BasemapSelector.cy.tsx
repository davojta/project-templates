import { BasemapSelector } from '../../src/client/src/components/BasemapSelector';

describe('BasemapSelector Component', () => {
  it('should render all basemap options', () => {
    const onBasemapChange = cy.stub().as('onBasemapChange');
    cy.mount(<BasemapSelector currentBasemap="streets-v12" onBasemapChange={onBasemapChange} />);

    cy.contains('Basemap').should('exist');
    cy.contains('Mapbox Streets').should('exist');
    cy.contains('Satellite Streets').should('exist');
    cy.contains('Light').should('exist');
    cy.contains('Dark').should('exist');
  });

  it('should highlight current basemap', () => {
    const onBasemapChange = cy.stub().as('onBasemapChange');
    cy.mount(<BasemapSelector currentBasemap="dark-v11" onBasemapChange={onBasemapChange} />);

    cy.get('input[value="dark-v11"]').should('be.checked');
  });

  it('should call onBasemapChange when selection changes', () => {
    const onBasemapChange = cy.stub().as('onBasemapChange');
    cy.mount(<BasemapSelector currentBasemap="streets-v12" onBasemapChange={onBasemapChange} />);

    cy.contains('Satellite Streets').click();
    cy.get('@onBasemapChange').should('have.been.calledWith', 'mapbox://styles/mapbox/satellite-streets-v12');
  });
});
