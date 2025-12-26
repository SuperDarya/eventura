import React from 'react'
import {
  Box,
  HStack,
  Link,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  Divider,
} from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FaMoon, FaSun, FaBars, FaTimes } from 'react-icons/fa'
import { URLs } from '../../__data__/urls'

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation()
  const isActive = location.pathname === to
  const activeColor = useColorModeValue('brand.500', 'brand.300')

  return (
    <Link
      as={RouterLink}
      to={to}
      fontWeight={isActive ? 'bold' : 'medium'}
      color={isActive ? activeColor : undefined}
      position="relative"
      _hover={{ textDecoration: 'none', color: 'brand.400' }}
      _focus={{ boxShadow: 'none' }}
    >
      {children}
      {isActive && (
        <Box
          position="absolute"
          bottom="-8px"
          left="0"
          right="0"
          height="2px"
          bg="brand.400"
          borderRadius="full"
        />
      )}
    </Link>
  )
}

export const Header = () => {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      borderBottomWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      backdropFilter="blur(10px)"
      bgGradient={useColorModeValue(
        'linear(to-b, white, white)',
        'linear(to-b, gray.800, gray.800)'
      )}
    >
      <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 6 }} py={4}>
        <HStack justify="space-between" spacing={4}>
          <Link
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Text
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
              cursor="pointer"
            >
              Eventura
            </Text>
          </Link>

          {/* Desktop Navigation */}
          <HStack spacing={6} display={{ base: 'none', md: 'flex' }}>
            <NavLink to={URLs.catalog.url}>Каталог</NavLink>
            <NavLink to={URLs.booking.url}>Бронирование</NavLink>
            <NavLink to={URLs.messenger.url}>Сообщения</NavLink>
            <NavLink to={URLs.profile.url}>Профиль</NavLink>
            <Button
              as={RouterLink}
              to={URLs.chat.url}
              colorScheme="brand"
              size="sm"
              _hover={{ textDecoration: 'none' }}
            >
              Чат с ИИ
            </Button>
            <IconButton
              aria-label="Переключить тему"
              icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              variant="ghost"
              onClick={toggleColorMode}
            />
          </HStack>

          {/* Mobile Menu Button */}
          <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
            <IconButton
              aria-label="Переключить тему"
              icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
              variant="ghost"
              size="sm"
              onClick={toggleColorMode}
            />
            <IconButton
              aria-label="Открыть меню"
              icon={isOpen ? <FaTimes /> : <FaBars />}
              variant="ghost"
              onClick={onOpen}
            />
          </HStack>
        </HStack>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Меню</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4}>
              <NavLink to={URLs.catalog.url} onClick={onClose}>
                Каталог
              </NavLink>
              <Divider />
              <NavLink to={URLs.booking.url} onClick={onClose}>
                Бронирование
              </NavLink>
              <Divider />
              <NavLink to={URLs.messenger.url} onClick={onClose}>
                Сообщения
              </NavLink>
              <Divider />
              <NavLink to={URLs.profile.url} onClick={onClose}>
                Профиль
              </NavLink>
              <Divider />
              <Button
                as={RouterLink}
                to={URLs.chat.url}
                colorScheme="brand"
                width="100%"
                onClick={onClose}
                _hover={{ textDecoration: 'none' }}
              >
                Чат с ИИ
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}