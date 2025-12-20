const pkg = require('./package')
const webpack = require('webpack')
const path = require('path')

module.exports = {
  apiPath: 'stubs/api',
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`
    }
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    'eventura.main': '/eventura',
    'eventura.catalog': '/eventura/catalog',
    'eventura.booking': '/eventura/booking',
    'eventura.chat': '/eventura/chat',
    'eventura.profile': '/eventura/profile',
    'eventura.vendor-profile': '/eventura/vendor-profile',
    'link.eventura.auth': '/auth'
  },
  features: {
    'eventura': {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    'eventura.api': '/api',
    'eventura.ai-api': '/api/eventura/ai-search',
    'eventura.back': 'ms/kfu-2025-b/eventura/'
  }
}
