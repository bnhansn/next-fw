import React, { useEffect } from 'react'
import { Provider, Connect } from 'redux-zero/react'
import { FWThemeProvider } from 'fwego'
import Helmet from 'react-helmet'
import { store } from '../tvapp/store'
import I18n, { resolveLocale } from '../intl'

function LocaleProvider({ params, children }) {
  const locale = resolveLocale(params.language)

  useEffect(() => {
    I18n.changeLocale(locale)
  }, [locale])

  return (
    <>
      <Helmet
        titleTemplate="%s - Firework"
        defaultTitle="Firework"
        titleAttributes={{ itemprop: 'name', lang: locale }}
        htmlAttributes={{ lang: locale, amp: undefined }}
        meta={[
          { charset: 'utf-8' },
          {
            name: 'google-site-verification',
            content: 'rtd7Z2cQ6sJCz1QFxyag4xUzbxoADTW0qRyjbvOLZRg'
          },
          {
            name: 'google-site-verification',
            content: '_aA9qHWg36ZvS-JlsMng7CcMBPd_PKumTS0UhIawjOs'
          },
          { name: 'description', content: 'A New Way to Watch.' },
          { property: 'al:ios:app_name', content: 'Firework' },
          { property: 'al:ios:app_store_id', content: '1359999964' },
          { property: 'al:android:app_name', content: 'Firework' },
          { property: 'al:android:package', content: 'com.loopnow.kamino' }
        ]}
      />
      {children}
    </>
  )
}

const Noop = (page) => page

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || Noop

  return (
    <>
      <Provider store={store}>
        <FWThemeProvider>
          <Connect mapToProps={(state) => ({ params: state.params })}>
            {(props) => (
              <LocaleProvider {...props}>
                {getLayout(<Component {...props} {...pageProps} />)}
              </LocaleProvider>
            )}
          </Connect>
        </FWThemeProvider>
      </Provider>
      <style jsx global>{`
        html,
        body {
          margin: 0;
          font-family: Avenir Next, Arial, sans-serif;
          background: black;
          color: white;
          font-size: 1rem;
          font-weight: 400;
          line-height: 1.5;
        }

        a {
          color: white;
        }

        a:hover {
          color: white;
          cursor: pointer;
        }
      `}</style>
    </>
  )
}
