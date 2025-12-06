import { getNavigation, getNavigationValue } from '@brojs/cli'

import pkg from '../../package.json'

const baseUrl = getNavigationValue(`${pkg.name}.main`) || ''
const navs = getNavigation()
const makeUrl = (url) => url.startsWith('/') ? url : `/${url}`

export const URLs = {
  baseUrl: baseUrl || '/',
  chat: {
    url: '/chat',
    isOn: true,
  },
  catalog: {
    url: '/catalog',
    isOn: true,
  },
  booking: {
    url: '/booking',
    isOn: true,
  },
  profile: {
    url: '/profile',
    isOn: true,
  },
  vendorProfile: {
    url: '/vendor-profile',
    isOn: true,
  },
  bookingDetail: {
    url: '/booking/:id',
    makeUrl: (id: number) => `/booking/${id}`,
    isOn: true,
  },
  auth: {
    url: navs[`link.${pkg.name}.auth`] || '/auth',
    isOn: Boolean(navs[`link.${pkg.name}.auth`])
  },
}
