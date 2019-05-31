const PAGES = {
  CONTENTS: 'contents',
  DASHBOARD: 'dashboard'
}

const URLS = {
  contents: ({workspaceId}) => `/ui/workspaces/${workspaceId}/contents/`,
  dashboard: ({workspaceId}) => `/ui/workspaces/${workspaceId}/dashboard/`
}

/** 
  * Generate a lazy url.
  * @param {string} pageName: key of the url mapped in URLS.
 */
const reverseUrl = (pageName) => {
  if (! (pageName in URLS)) {
    throw `No page found for page name ${pageName}`
  }
  return URLS[pageName]
}

/** 
  * Format a url for a given pageName mapped in URLS and applies getters at the end.
  * @param {string} pageName: key of the url mapped in URLS.
  * @param {Object} param: object containing the key/value to use on the lazy url.
  * @param {Object} getters: object containing the key/value to format the GET paramaters. 
 */
const formatUrl = ({pageName, params = {}, getters = null}) => {
  let url = reverseUrl(pageName)(params)
  if (getters) {
    url += '?'
    Object.entries(getters).forEach(([key, value]) => url += `${key}=${value}`)
  }
  return url
}

Cypress.Commands.add('visitPage', ({pageName, params = {}, getters = null}) => {
  let url = formatUrl({pageName: pageName, params: params, getters: getters})
  return cy.visit(url)
})
export { PAGES, reverseUrl, formatUrl }

/*
EXEMPLE
formatUrl(pageName: PAGES.CONTENTS, getters: {type: 'file'}, param: {workspaceId: 1}})
> '/ui/workspaces/1/contents?type=file'
----

const lazyContentUrl = reverseUrl(PAGES.CONTENTS)
const workspace1 = lazyContentUrl(workspaceId: 1)
const workspace2 = lazyContentUrl(workspaceId: 2)
*/
