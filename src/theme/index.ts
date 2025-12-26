import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#e6f7f8',
      100: '#b3e8eb',
      200: '#80d9de',
      300: '#4dcad1',
      400: '#62BBC1', // Tropical Teal - основной брендовый цвет
      500: '#62BBC1',
      600: '#4e969b',
      700: '#3a7175',
      800: '#264c4f',
      900: '#122729',
    },
    primary: {
      50: '#e6f7f8',
      100: '#b3e8eb',
      200: '#80d9de',
      300: '#4dcad1',
      400: '#62BBC1', // Tropical Teal
      500: '#62BBC1',
      600: '#4e969b',
      700: '#3a7175',
      800: '#264c4f',
      900: '#122729',
    },
    dark: {
      50: '#f5f5f5',
      100: '#e0e0e0',
      200: '#bdbdbd',
      300: '#9e9e9e',
      400: '#757575',
      500: '#30332E', // Charcoal Brown
      600: '#30332E',
      700: '#212421',
      800: '#010400', // Black
      900: '#010400',
    },
    light: {
      50: '#FFFBFC', // Snow
      100: '#FFFBFC',
      200: '#f5f5f5',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  fonts: {
    heading: `'Angst', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    body: `'Angst', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
      baseStyle: {
        fontWeight: '600',
        borderRadius: 'lg',
        _focus: {
          boxShadow: '0 0 0 3px rgba(98, 187, 193, 0.3)',
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
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        field: {
          _focus: {
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        field: {
          _focus: {
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'brand.400',
      },
      baseStyle: {
        _focus: {
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
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
          color: 'brand.400',
        },
        _focus: {
          boxShadow: '0 0 0 3px rgba(98, 187, 193, 0.3)',
          borderRadius: 'sm',
        },
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        fontFamily: 'body',
        color: props.colorMode === 'dark' ? 'light.50' : 'dark.800',
        bg: props.colorMode === 'dark' ? 'dark.800' : 'light.50',
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
    glow: '0 0 20px rgba(98, 187, 193, 0.3)',
  },
})

export default theme

