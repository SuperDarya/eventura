import React from 'react'
import { Box, HStack, Link, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { URLs } from '../../__data__/urls'

export const Header = () => {
    const bg = useColorModeValue('white', 'gray.800')
    const borderColor = useColorModeValue('gray.200', 'gray.700')
    
    return (
        <Box
            as="header"
            position="fixed"
            top={0}
            left={0}
            right={0}
            zIndex={1000}
            bg={bg}
            borderBottomWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
        >
            <Box maxW="container.xl" mx="auto" px={4} py={4}>
                <HStack justify="space-between" spacing={8}>
                    <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
                        <Text fontSize="2xl" fontWeight="bold" color="pink.400" cursor="pointer">
                            Eventura
                        </Text>
                    </Link>
                    <HStack spacing={6}>
                        <Link as={RouterLink} to={URLs.catalog.url} fontWeight="medium">
                            Каталог
                        </Link>
                        <Link as={RouterLink} to={URLs.booking.url} fontWeight="medium">
                            Бронирование
                        </Link>
                        <Link as={RouterLink} to={URLs.messenger.url} fontWeight="medium">
                            Сообщения
                        </Link>
                        <Link as={RouterLink} to={URLs.profile.url} fontWeight="medium">
                            Профиль
                        </Link>
                        <Button 
                            as={RouterLink} 
                            to={URLs.chat.url}
                            colorScheme="pink" 
                            size="sm"
                        >
                            Чат с ИИ
                        </Button>
                    </HStack>
                </HStack>
            </Box>
            <Box h="64px" /> {/* Spacer for fixed header */}
        </Box>
    )
}