describe('Map Application', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('page loads without crashing', () => {
    cy.get('#root').should('exist')
  })

  it('displays either map or error state', () => {
    cy.get('#root').should('not.be.empty')
    cy.get('[data-testid="map-container"], .map-error').should('exist')
  })
})

describe('Map with Token', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays map container when token is valid', () => {
    cy.get('[data-testid="map-container"]').should('exist')
  })

  it('displays sidebar with coordinates', () => {
    cy.get('[data-testid="map-sidebar"]').should('exist')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Longitude:')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Latitude:')
    cy.get('[data-testid="map-sidebar"]').should('contain', 'Zoom:')
  })

  it('displays reset button', () => {
    cy.get('[data-testid="reset-button"]').should('exist')
    cy.get('[data-testid="reset-button"]').should('contain', 'Reset')
  })

  it('reset button is clickable', () => {
    cy.get('[data-testid="reset-button"]').should('not.be.disabled')
    cy.get('[data-testid="reset-button"]').click()
  })

  it('sidebar shows initial coordinates', () => {
    cy.get('[data-testid="map-sidebar"]')
      .should('contain', '-74.0242')
      .should('contain', '40.6941')
      .should('contain', '10.12')
  })
})
