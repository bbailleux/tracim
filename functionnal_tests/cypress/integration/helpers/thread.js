import { assertPopupCreateContent } from './index.js'

// INFO - CH - 2019-05-15 - The function bellow assumes you already is on a workspace's content list page
export const create_thread = (cy, threadTitle = 'Thread 1') => {
  cy.get('[data-cy=dropdownCreateBtn]').should('be.visible').click()
  cy.get('.show .subdropdown__link__thread__icon').should('be.visible').click()

  assertPopupCreateContent(cy)

  cy.get('.cardPopup__container .createcontent .createcontent__form__input')
    .type(threadTitle)

  cy.get('.cardPopup__container .createcontent .createcontent__form__input')
    .should('have.attr', 'value', threadTitle)
    .should('have.attr', 'placeholder')

  cy.get('[data-cy=popup__createcontent__form__button]')
    .click()

  cy.get(`.workspace__content__fileandfolder > .content[title="${threadTitle}"]`)
    .should('be.visible')
}
