import { getNavigation, getNavigationValue } from '@brojs/cli'

import pkg from '../../package.json'

const baseUrl = getNavigationValue(`${pkg.name}.main`)
const navs = getNavigation()
const makeUrl = (url) => baseUrl + url

export const URLs = {
  baseUrl,
  chat: {
    url: makeUrl('/chat'),
    isOn: true,
  },
  catalog: {
    url: makeUrl('/catalog'),
    isOn: true,
  },
  booking: {
    url: makeUrl('/booking'),
    isOn: true,
  },
  profile: {
    url: makeUrl('/profile'),
    isOn: true,
  },
  vendorProfile: {
    url: makeUrl('/vendor-profile'),
    isOn: true,
  },
  bookingDetail: {
    url: makeUrl('/booking/:id'),
    makeUrl: (id: number) => makeUrl(`/booking/${id}`),
    isOn: true,
  },
  auth: {
    url: makeUrl(navs[`link.${pkg.name}.auth`]),
    isOn: Boolean(navs[`link.${pkg.name}.auth`])
  },
}
