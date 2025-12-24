import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Provider as ReduxProvider } from 'react-redux'
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import { Header } from './layout/header'

import { Dashboard } from './dashboard'

import { store } from './__data__/store'
import theme from './theme'
import './styles/global.css'

const App = () => {
  const basename = '/eventura'
  
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BrowserRouter basename={basename}>
        <ChakraProvider theme={theme}>
          <ReduxProvider store={store}>
            <Header />
            <Dashboard />
          </ReduxProvider>
        </ChakraProvider>
      </BrowserRouter>
    </>
  )
}

export default App
