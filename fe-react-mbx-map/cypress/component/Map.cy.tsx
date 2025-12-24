import Map from '../../src/components/Map'
import '../../src/styles/map.css'

describe('Map Component', () => {
  it('renders map container', () => {
    cy.mount(<Map />)
    cy.get('[data-testid="map-container"]').should('exist')
  })

  it('displays sidebar with coordinates', () => {
    cy.mount(<Map />)
    cy.get('[data-testid="map-sidebar"]').should('exist')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Longitude:')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Latitude:')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Zoom:')
  })

  it('displays reset button', () => {
    cy.mount(<Map />)
    cy.get('[data-testid="reset-button"]').should('exist')
    cy.get('[data-testid="reset-button"]').should('contain', 'Reset')
  })

  it('shows initial coordinates in sidebar', () => {
    cy.mount(<Map />)
    cy.get('[data-testid="map-sidebar"]')
      .should('contain', '-74.0242')
      .should('contain', '40.6941')
      .should('contain', '10.12')
  })

  it('reset button is clickable', () => {
    cy.mount(<Map />)
    cy.get('[data-testid="reset-button"]').click()
  })
})
