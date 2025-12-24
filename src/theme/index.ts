import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#fce7f3',
      100: '#fbcfe5',
      200: '#f9a8d4',
      300: '#f472b6',
      400: '#ec4899',
      500: '#db2777', // Основной брендовый цвет
      600: '#be185d',
      700: '#9f1239',
      800: '#831843',
      900: '#500724',
    },
    primary: {
      50: '#fce7f3',
      100: '#fbcfe5',
      200: '#f9a8d4',
      300: '#f472b6',
      400: '#ec4899',
      500: '#db2777',
      600: '#be185d',
      700: '#9f1239',
      800: '#831843',
      900: '#500724',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'pink',
      },
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        _focus: {
          boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.3)',
        },
      },
      sizes: {
        lg: {
          fontSize: 'md',
          px: 6,
          py: 4,
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'pink.400',
      },
      baseStyle: {
        field: {
          _focus: {
            boxShadow: '0 0 0 1px var(--chakra-colors-pink-400)',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'pink.400',
      },
      baseStyle: {
        field: {
          _focus: {
            boxShadow: '0 0 0 1px var(--chakra-colors-pink-400)',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'pink.400',
      },
      baseStyle: {
        _focus: {
          boxShadow: '0 0 0 1px var(--chakra-colors-pink-400)',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '700',
        letterSpacing: '-0.01em',
      },
    },
    Link: {
      baseStyle: {
        _hover: {
          textDecoration: 'none',
          color: 'pink.400',
        },
        _focus: {
          boxShadow: '0 0 0 3px rgba(236, 72, 153, 0.3)',
          borderRadius: 'sm',
        },
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        fontFamily: 'body',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        lineHeight: '1.6',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      },
      '*::placeholder': {
        color: props.colorMode === 'dark' ? 'gray.500' : 'gray.400',
      },
      '*, *::before, &::after': {
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      },
    }),
  },
  shadows: {
    soft: '0 2px 20px rgba(0, 0, 0, 0.08)',
    glow: '0 0 20px rgba(236, 72, 153, 0.3)',
  },
})

export default theme

