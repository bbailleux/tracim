import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'
import { frTranslation, enTranslation } from 'tracim_frontend_lib'
import en from '../i18next.scanner/en/translation.json'
import fr from '../i18next.scanner/fr/translation.json'

// get translation files of apps
// theses files are generated by build_appname.sh
const htmlDocEnTranslation = require('../dist/app/html-document_en_translation.json') || {}
const htmlDocFrTranslation = require('../dist/app/html-document_fr_translation.json') || {}
const threadEnTranslation = require('../dist/app/thread_en_translation.json') || {}
const threadFrTranslation = require('../dist/app/thread_fr_translation.json') || {}
const fileEnTranslation = require('../dist/app/file_en_translation.json') || {}
const fileFrTranslation = require('../dist/app/file_fr_translation.json') || {}
const adminWsUserEnTranslation = require('../dist/app/admin_workspace_user_en_translation.json') || {}
const adminWsUserFrTranslation = require('../dist/app/admin_workspace_user_fr_translation.json') || {}
const wsAdvancedEnTranslation = require('../dist/app/workspace_advanced_en_translation.json') || {}
const wsAdvancedFrTranslation = require('../dist/app/workspace_advanced_fr_translation.json') || {}
const wsEnTranslation = require('../dist/app/workspace_en_translation.json')
const wsFrTranslation = require('../dist/app/workspace_fr_translation.json')

i18n
  .use(reactI18nextModule)
  .init({
    fallbackLng: 'en',
    // have a common namespace used around the full app
    ns: ['translation'], // namespace
    defaultNS: 'translation',
    debug: true,
    react: {
      wait: true
    },
    resources: {
      en: {
        translation: {
          ...enTranslation, // fronted_lib
          ...en, // frontend
          ...htmlDocEnTranslation, // html-document
          ...threadEnTranslation, // thread
          ...fileEnTranslation, // file
          ...wsAdvancedEnTranslation, // advanced workspace
          ...adminWsUserEnTranslation, // admin workspace user
          ...wsEnTranslation // workspace
        }
      },
      fr: {
        translation: {
          ...frTranslation, // fronted_lib
          ...fr, // frontend
          ...htmlDocFrTranslation, // html-document
          ...threadFrTranslation, // thread
          ...fileFrTranslation, // file
          ...wsAdvancedFrTranslation, // advanced workspace
          ...adminWsUserFrTranslation, // admin workspace user
          ...wsFrTranslation // workspace
        }
      }
    }
  })

i18n.idTracim = 'frontend'

export default i18n
