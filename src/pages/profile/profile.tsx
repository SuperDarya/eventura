import React, { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Badge,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useColorModeValue,
  Avatar,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { AiFillStar } from 'react-icons/ai'
import { FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa'
import { useGetEventsQuery, useGetBookingsQuery, useGetFavoritesQuery, useRemoveFavoriteMutation } from '../../__data__/api'
import { Link } from 'react-router-dom'
import { URLs } from '../../__data__/urls'

const ProfilePage = () => {
  const [userType] = useState<'client' | 'vendor'>('client') // TODO: получать из авторизации
  const [activeTab, setActiveTab] = useState(0)
  const currentUserId = 1 // TODO: получать из авторизации
  
  const { data: events = [] } = useGetEventsQuery({ clientId: currentUserId }, { skip: userType !== 'client' })
  const { data: bookings = [] } = useGetBookingsQuery({ clientId: currentUserId }, { skip: userType !== 'client' })
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId, { skip: userType !== 'client' })
  const [removeFavorite] = useRemoveFavoriteMutation()
  
  const handleRemoveFavorite = async (vendorId: number) => {
    try {
      await removeFavorite({ userId: currentUserId, vendorId }).unwrap()
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }
  
  const statusColors: Record<string, string> = {
    draft: 'gray',
    planning: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
    pending: 'orange'
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={8}>Личный кабинет</Heading>
      
      {userType === 'client' ? (
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Мои мероприятия</Tab>
            <Tab>Бронирования</Tab>
            <Tab>Избранное</Tab>
            <Tab>Настройки</Tab>
          </TabList>
          
          <TabPanels>
            {/* Мои мероприятия */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Мои мероприятия ({events.length})
                  </Text>
                  <Button 
                    as={Link} 
                    to={URLs.booking.url}
                    colorScheme="pink"
                    size="sm"
                  >
                    Создать новое
                  </Button>
                </HStack>
                
                {events.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {events.map((event: any) => (
                      <Card key={event.id}>
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Heading size="sm">{event.title}</Heading>
                              <Badge colorScheme={statusColors[event.status] || 'gray'}>
                                {event.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              Тип: {event.type}
                            </Text>
                            <Text fontSize="sm">
                              Дата: {new Date(event.date).toLocaleDateString()}
                            </Text>
                            <Text fontSize="sm">
                              Гостей: {event.guestsCount}
                            </Text>
                            <Text fontSize="sm" fontWeight="bold">
                              Бюджет: {event.budget.toLocaleString()} ₽
                            </Text>
                            {event.description && (
                              <Text fontSize="sm" noOfLines={2}>
                                {event.description}
                              </Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500" mb={4}>У вас пока нет мероприятий</Text>
                    <Button 
                      as={Link} 
                      to={URLs.booking.url}
                      colorScheme="pink"
                    >
                      Создать мероприятие
                    </Button>
                  </Box>
                )}
              </VStack>
            </TabPanel>
            
            {/* Бронирования */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Мои бронирования ({bookings.length})
                </Text>
                
                {bookings.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {bookings.map((booking: any) => (
                      <Card 
                        key={booking.id}
                        as={Link}
                        to={URLs.bookingDetail.makeUrl(booking.id)}
                        cursor="pointer"
                        _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                        transition="all 0.2s"
                      >
                        <CardBody>
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Бронирование #{booking.id}</Text>
                              <Badge colorScheme={statusColors[booking.status] || 'gray'}>
                                {booking.status}
                              </Badge>
                            </HStack>
                            <Text fontSize="sm">
                              Дата: {new Date(booking.date).toLocaleDateString()}
                            </Text>
                            <Text fontSize="sm">
                              Подрядчик: #{booking.vendorId}
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="pink.500">
                              {booking.totalPrice.toLocaleString()} ₽
                            </Text>
                            <Button size="sm" colorScheme="pink" variant="outline" onClick={(e) => {
                              e.preventDefault()
                              window.location.href = URLs.bookingDetail.makeUrl(booking.id)
                            }}>
                              Подробнее
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500">У вас пока нет бронирований</Text>
                  </Box>
                )}
              </VStack>
            </TabPanel>
            
            {/* Избранное */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Избранные подрядчики ({favorites.length})
                  </Text>
                  <Button 
                    as={Link} 
                    to={URLs.catalog.url}
                    colorScheme="blue"
                    size="sm"
                  >
                    Добавить
                  </Button>
                </HStack>
                
                {favorites.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {favorites.map((vendor: any) => (
                      <Card key={vendor.id}>
                        <CardBody>
                          <HStack spacing={4} justify="space-between">
                            <HStack spacing={4} flex={1} as={Link} to={`${URLs.vendorProfile.url}?id=${vendor.id}`}>
                              <Avatar name={vendor.companyName} />
                              <VStack align="start" spacing={1}>
                                <Heading size="sm">{vendor.companyName}</Heading>
                                <HStack fontSize="sm" color="gray.600">
                                  <FaMapMarkerAlt />
                                  <Text>{vendor.city}</Text>
                                </HStack>
                                <HStack>
                                  <AiFillStar color="#f6ad55" />
                                  <Text fontWeight="bold">{vendor.rating}</Text>
                                  <Text fontSize="sm" color="gray.600">({vendor.reviewsCount} отзывов)</Text>
                                </HStack>
                              </VStack>
                            </HStack>
                            <Tooltip label="Удалить из избранного">
                              <IconButton
                                aria-label="Удалить из избранного"
                                icon={<FaHeart />}
                                colorScheme="pink"
                                variant="ghost"
                                onClick={() => handleRemoveFavorite(vendor.id)}
                              />
                            </Tooltip>
                          </HStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500" mb={4}>У вас пока нет избранных подрядчиков</Text>
                    <Button 
                      as={Link} 
                      to={URLs.catalog.url}
                      colorScheme="pink"
                    >
                      Перейти в каталог
                    </Button>
                  </Box>
                )}
              </VStack>
            </TabPanel>
            
            {/* Настройки */}
            <TabPanel>
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="md">Настройки профиля</Heading>
                    <Text color="gray.500">Настройки профиля (в разработке)</Text>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : (
        <Text>Профиль подрядчика (в разработке)</Text>
      )}
    </Container>
  )
}

export default ProfilePage
