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
    url: '/auth',
    login: '/auth/login',
    register: '/auth/register',
    isOn: true
  },
  messenger: {
    url: '/messenger',
    chat: '/messenger/chat/:userId',
    makeChatUrl: (userId: number) => `/messenger/chat/${userId}`,
    isOn: true
  },
}
