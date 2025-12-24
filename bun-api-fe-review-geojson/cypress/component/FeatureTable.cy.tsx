import { FeatureTable } from '../../src/client/src/components/FeatureTable';
import type { GeoJSONFeature } from '../../src/types/index';

describe('FeatureTable Component', () => {
  const mockFeatures: GeoJSONFeature[] = [
    {
      type: 'Feature',
      id: 'test-1',
      geometry: { type: 'Point', coordinates: [0, 0] },
      properties: { name: 'Test Feature 1', value: 100 },
    },
    {
      type: 'Feature',
      id: 'test-2',
      geometry: { type: 'Point', coordinates: [1, 1] },
      properties: { name: 'Test Feature 2', value: 200 },
    },
  ];

  const mockReviews = new Map([
    ['test-1', 'pending' as const],
    ['test-2', 'flagged' as const],
  ]);

  it('should render table with features', () => {
    cy.mount(<FeatureTable features={mockFeatures} reviews={mockReviews} />);
    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length', 2);
  });

  it('should display feature properties', () => {
    cy.mount(<FeatureTable features={mockFeatures} reviews={mockReviews} />);
    cy.contains('Test Feature 1').should('exist');
    cy.contains('Test Feature 2').should('exist');
  });

  it('should highlight flagged features', () => {
    cy.mount(<FeatureTable features={mockFeatures} reviews={mockReviews} />);
    cy.get('tbody tr').eq(1).should('have.css', 'background-color', 'rgb(255, 236, 236)');
  });
});
