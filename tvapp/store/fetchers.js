import merge from 'lodash/merge'
import getConfig from 'next/config'
import { stringify } from '../../utils/qs'
import { withSession } from './session'

const { publicRuntimeConfig } = getConfig()

const baseUrl = publicRuntimeConfig.apiHost

const fetchDefaults = {
  cache: 'no-cache',
  credentials: 'include',
  mode: 'cors',
  headers: {
    'Content-Type': 'application/json'
  }
}

const resolveUrl = (url) =>
  url.startsWith('/') && !url.startsWith('//') ? baseUrl + url : url

export const fetcher = withSession(
  async ({ url, query, session: { session }, fetchParams = {} }) => {
    fetchParams = {
      ...fetchDefaults,
      ...fetchParams
    }
    const { token } = session || {}

    if (token) {
      fetchParams = merge(fetchParams, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }

    return fetch(
      resolveUrl(url) + stringify(query, { addQueryPrefix: true }),
      fetchParams
    )
  }
)
