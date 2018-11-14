import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { store } from './store.js'
import Tracim from './container/Tracim.jsx'
import { Router } from 'react-router'
import createBrowserHistory from 'history/createBrowserHistory'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n.js'

require('./css/index.styl')

export const history = createBrowserHistory()

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <I18nextProvider i18n={i18n}>
        <Tracim />
      </I18nextProvider>
    </Router>
  </Provider>
  , document.getElementById('content')
)
