const DOCUMENT_TITLE = 'A new document'
const DOCUMENT_RAW_CONTENT = 'Content of the document'
const DOCUMENT_HTML_CONTENT = `<p>${DOCUMENT_RAW_CONTENT}</p>`

context('Known users as a workspace-manager', function () {
  beforeEach(function () {
    cy.resetDB()
    cy.setupBaseDB()
    cy.loginAs('administrators')
    cy
      .fixture('baseWorkspace').as('workspace').then(workspace => {
        cy.visit(`/ui/workspaces/${workspace.workspace_id}/contents`)
      })
    cy.log('TODO find better way to deal with tinyMCE than using wait')
  })


  it('Check TinyMCE is active if document is empty when opening', function () {
    cy.get('[data-cy=dropdownCreateBtn]').first().click()
    cy.contains('Write a document').click()
    cy.get('[data-cy=createcontent__form__input]').type(DOCUMENT_TITLE)
    cy.get('[data-cy=popup__createcontent__form__button]').click()
    cy.get('.wsContentGeneric__header__close').click()
    cy.contains(DOCUMENT_TITLE).click()
    cy.get('#mceu_39').trigger('click')
    cy.assertTinyMCEIsActive()
    cy.get('.wsContentGeneric__header__close > .fa').click()
  })

  it.only('Type into tiny mce and save from dashboard', function () {

    cy.visit(`/ui/workspaces/${this.workspace.workspace_id}/dashboard`)
    cy.contains('Shared space manager')
    cy.get('[data-cy="contentTypeBtn_contents/html-document"]').click()
    cy.get('[data-cy=createcontent__form__input]').type(DOCUMENT_TITLE)
    cy.get('[data-cy=popup__createcontent__form__button]').click()

    cy.get('#mceu_39').trigger('click')
    cy.typeInTinyMCE(DOCUMENT_HTML_CONTENT).then(content => {
        cy.get('#mceu_39').trigger('click')
        cy.get('[data-cy=editionmode__button__submit]').should('not.be.disabled').click()
        cy.contains(DOCUMENT_RAW_CONTENT).should('exist')
        cy.get('.wsContentGeneric__header__close > .fa').click()
    })
  })

  it('Type into tiny mce and save', function () {
    cy.get('[data-cy=dropdownCreateBtn]').first().click()
    cy.contains('Write a document').click()
    cy.get('[data-cy=createcontent__form__input]').type(DOCUMENT_TITLE)
    cy.get('[data-cy=popup__createcontent__form__button]').click()
    cy.get('#mceu_39').trigger('click')
    cy.typeInTinyMCE(DOCUMENT_HTML_CONTENT)
    cy.get('#mceu_39').trigger('click')
    cy.get('[data-cy=editionmode__button__submit]').should('not.be.disabled').click()
    cy.contains(DOCUMENT_RAW_CONTENT).should('exist')
    cy.get('.wsContentGeneric__header__close > .fa').click()
  })

  it('Check if TinyMCE open content of the document', function () {
    cy.get('[data-cy=dropdownCreateBtn]').first().click()
    cy.contains('Write a document').click()
    cy.get('[data-cy=createcontent__form__input]').type(DOCUMENT_TITLE)
    cy.get('[data-cy=popup__createcontent__form__button]').click()
    cy.get('#mceu_39').trigger('click')
    cy.typeInTinyMCE(DOCUMENT_HTML_CONTENT)
    cy.get('#mceu_39').trigger('click')
    cy.get('[data-cy=editionmode__button__submit]').should('not.be.disabled').click()
    cy.get('[data-cy=wsContentGeneric__option__menu__addversion]').should('not.be.disabled').click()
    cy.assertTinyMCEContent(DOCUMENT_HTML_CONTENT)
    cy.get('.wsContentGeneric__header__close > .fa').click()
  })


  it('Check TinyMCE is not active when opening if document has been modified', function () {
    cy.get('[data-cy=dropdownCreateBtn]').first().click()
    cy.contains('Write a document').click()
    cy.get('[data-cy=createcontent__form__input]').type(DOCUMENT_TITLE)
    cy.get('[data-cy=popup__createcontent__form__button]').click()
    cy.get('#mceu_39').trigger('click')
    cy.typeInTinyMCE(DOCUMENT_HTML_CONTENT)
    cy.get('#mceu_39').trigger('click')
    cy.get('[data-cy=editionmode__button__submit]').should('not.be.disabled').click()
    cy.get('.wsContentGeneric__header__close').click()
    cy.contains(DOCUMENT_TITLE).click()
    cy.assertTinyMCEIsActive(false)
  })
})
