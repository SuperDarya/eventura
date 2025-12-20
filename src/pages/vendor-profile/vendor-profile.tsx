import React from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Avatar,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Tag,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Button,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { AiFillStar } from 'react-icons/ai'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaRegHeart, FaComments } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useGetVendorQuery, useGetServicesQuery, useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../../__data__/api'
import { URLs } from '../../__data__/urls'
import { useAppSelector } from '../../__data__/store'

const VendorProfilePage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const vendorId = parseInt(searchParams.get('id') || '0')
  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id
  
  const { data: vendor, isLoading: isLoadingVendor } = useGetVendorQuery(vendorId, {
    skip: !vendorId
  })
  
  const { data: services = [], isLoading: isLoadingServices } = useGetServicesQuery(
    { vendorId },
    { skip: !vendorId }
  )
  
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId || 0, { skip: !currentUserId })
  const [addFavorite] = useAddFavoriteMutation()
  const [removeFavorite] = useRemoveFavoriteMutation()
  
  const favoriteIds = favorites.map((v: any) => v.id)
  const isFavorite = favoriteIds.includes(vendorId)
  
  const toggleFavorite = async () => {
    if (!currentUserId) {
      alert('Необходимо войти в систему для добавления в избранное')
      return
    }
    
    try {
      if (isFavorite) {
        await removeFavorite({ userId: currentUserId, vendorId }).unwrap()
      } else {
        await addFavorite({ userId: currentUserId, vendorId }).unwrap()
      }
    } catch (error) {
    }
  }

  const handleChatClick = () => {
    navigate(URLs.messenger.makeChatUrl(vendorId))
  }
  
  if (isLoadingVendor) {
    return (
      <Container maxW="container.xl" py={8}>
        <Skeleton height="200px" mb={4} />
        <SkeletonText mt={4} noOfLines={5} spacing={4} />
      </Container>
    )
  }
  
  if (!vendor) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Подрядчик не найден</Text>
      </Container>
    )
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* Header */}
      <Box mb={8}>
        <HStack spacing={6} mb={4} justify="space-between">
          <HStack spacing={6}>
            <Avatar size="xl" name={vendor.companyName} />
            <VStack align="start" spacing={2}>
              <Heading size="lg">{vendor.companyName}</Heading>
              <HStack>
                <Badge colorScheme={vendor.isOrganizer ? 'purple' : 'blue'}>
                  {vendor.isOrganizer ? 'Организатор' : 'Подрядчик'}
                </Badge>
                <HStack>
                  <AiFillStar color="#f6ad55" />
                  <Text fontWeight="bold">{vendor.rating}</Text>
                  <Text fontSize="sm" color="gray.600">({vendor.reviewsCount} отзывов)</Text>
                </HStack>
              </HStack>
            </VStack>
          </HStack>
          <HStack spacing={2}>
            <Tooltip label="Написать сообщение">
              <IconButton
                aria-label="Написать сообщение"
                icon={<FaComments />}
                colorScheme="pink"
                onClick={handleChatClick}
              />
            </Tooltip>
            <Tooltip label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}>
              <Button
                leftIcon={isFavorite ? <FaHeart /> : <FaRegHeart />}
                colorScheme={isFavorite ? 'pink' : 'gray'}
                variant={isFavorite ? 'solid' : 'outline'}
                onClick={toggleFavorite}
              >
                {isFavorite ? 'В избранном' : 'В избранное'}
              </Button>
            </Tooltip>
          </HStack>
        </HStack>
        
        <HStack spacing={4} flexWrap="wrap">
          <HStack>
            <FaMapMarkerAlt />
            <Text>{vendor.city}</Text>
          </HStack>
          <HStack>
            <FaPhone />
            <Text>{vendor.phone}</Text>
          </HStack>
          <HStack>
            <FaEnvelope />
            <Text fontSize="sm">{vendor.email}</Text>
          </HStack>
        </HStack>
      </Box>
      
      <Tabs>
        <TabList>
          <Tab>Услуги</Tab>
          <Tab>О компании</Tab>
          <Tab>Отзывы</Tab>
          <Tab>Портфолио</Tab>
          <Tab>Календарь</Tab>
        </TabList>
        
        <TabPanels>
          {/* Услуги */}
          <TabPanel>
            {isLoadingServices ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} height="150px" />
                ))}
              </SimpleGrid>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {services.map((service: any) => (
                  <Card key={service.id}>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Heading size="sm">{service.name}</Heading>
                          <Tag>{service.category}</Tag>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">{service.description}</Text>
                        <HStack justify="space-between">
                          <Text fontSize="sm">
                            {service.priceMin.toLocaleString()} - {service.priceMax.toLocaleString()} ₽
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {service.unit}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                {services.length === 0 && (
                  <Text color="gray.500">Услуги не указаны</Text>
                )}
              </SimpleGrid>
            )}
          </TabPanel>
          
          {/* О компании */}
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={2}>Контакты</Heading>
                <Text>Контактное лицо: {vendor.contactPerson}</Text>
                <Text>Телефон: {vendor.phone}</Text>
                <Text>Email: {vendor.email}</Text>
              </Box>
              {vendor.profile && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="md" mb={2}>О компании</Heading>
                    <Text>{vendor.profile.bio}</Text>
                  </Box>
                  {vendor.profile.yearsExperience && (
                    <Box>
                      <Text fontWeight="bold">Опыт работы: {vendor.profile.yearsExperience} лет</Text>
                    </Box>
                  )}
                  {vendor.profile.specialties && vendor.profile.specialties.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" mb={2}>Специализация:</Text>
                      <HStack spacing={2} flexWrap="wrap">
                        {vendor.profile.specialties.map((spec: string, i: number) => (
                          <Tag key={i}>{spec}</Tag>
                        ))}
                      </HStack>
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </TabPanel>
          
          {/* Отзывы */}
          <TabPanel>
            {vendor.reviews && vendor.reviews.length > 0 ? (
              <VStack align="stretch" spacing={4}>
                {vendor.reviews.map((review: any, index: number) => (
                  <Card key={index}>
                    <CardBody>
                      <VStack align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="bold">Клиент #{review.clientId}</Text>
                          <HStack>
                            <AiFillStar color="#f6ad55" />
                            <Text>{review.rating}</Text>
                          </HStack>
                        </HStack>
                        <Text>{review.comment}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            ) : (
              <Text color="gray.500">Отзывов пока нет</Text>
            )}
          </TabPanel>
          
          {/* Портфолио */}
          <TabPanel>
            {vendor.profile?.portfolio && vendor.profile.portfolio.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {vendor.profile.portfolio.map((image: string, index: number) => (
                  <Box key={index} h="200px" bg="gray.100" borderRadius="md">
                    {/* Placeholder for images */}
                    <Box 
                      h="100%" 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                      bg="gray.200"
                      borderRadius="md"
                    >
                      <Text color="gray.500">Изображение {index + 1}</Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            ) : (
              <Text color="gray.500">Портфолио пока нет</Text>
            )}
          </TabPanel>
          
          {/* Календарь */}
          <TabPanel>
            <VendorCalendar vendor={vendor} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

const VendorCalendar = ({ vendor }: { vendor: any }) => {
  const calendar = vendor.calendar || []
  
  // Группируем даты по месяцам для удобного отображения
  const groupedByMonth = calendar.reduce((acc: any, dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const monthKey = date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(dateStr)
    return acc
  }, {})
  
  return (
    <VStack align="stretch" spacing={6}>
      <Box>
        <Heading size="md" mb={4}>Календарь занятых дней</Heading>
        <Text color="gray.600" mb={4}>
          Ниже отображены даты, когда подрядчик занят и не может принять новые заказы.
        </Text>
      </Box>
      
      {calendar.length > 0 ? (
        Object.entries(groupedByMonth).map(([month, dates]: [string, any]) => (
          <Card key={month}>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Heading size="sm">{month}</Heading>
                <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={2}>
                  {dates.map((dateStr: string) => {
                    const date = new Date(dateStr + 'T00:00:00')
                    const day = date.getDate()
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const dateObj = new Date(dateStr + 'T00:00:00')
                    const isPast = dateObj < today
                    
                    return (
                      <Box
                        key={dateStr}
                        p={3}
                        bg={isPast ? 'gray.200' : 'red.100'}
                        borderWidth="1px"
                        borderColor={isPast ? 'gray.300' : 'red.300'}
                        borderRadius="md"
                        textAlign="center"
                      >
                        <Text fontWeight="bold" fontSize="sm">
                          {day}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                        </Text>
                      </Box>
                    )
                  })}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>
        ))
      ) : (
        <Alert status="info">
          <AlertIcon />
          <Text>Подрядчик свободен во все дни</Text>
        </Alert>
      )}
    </VStack>
  )
}

export default VendorProfilePage
