import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react'
import { AiFillStar } from 'react-icons/ai'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaTrash, FaPlus } from 'react-icons/fa'
import { useGetBookingQuery, useGetBookingsQuery, useUpdateBookingMutation, useCreateBookingMutation, useGetFavoritesQuery, useGetVendorQuery, useGetServicesQuery } from '../../__data__/api'
import { Link } from 'react-router-dom'
import { URLs } from '../../__data__/urls'
import { useAppSelector } from '../../__data__/store'

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bookingId = parseInt(id || '0')
  const currentUser = useAppSelector(state => state.auth.user)
  
  const { data: booking, isLoading, error } = useGetBookingQuery(bookingId, {
    skip: !bookingId
  })
  
  // Получаем все бронирования для этого мероприятия через API
  const { data: eventBookingsData = [], refetch: refetchBookings } = useGetBookingsQuery(
    { eventId: booking?.eventId },
    { skip: !booking?.eventId }
  )
  
  const { data: favorites = [] } = useGetFavoritesQuery(currentUser?.id || 0, { skip: !currentUser?.id })
  const [updateBooking] = useUpdateBookingMutation()
  
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()
  const [vendorToDelete, setVendorToDelete] = useState<number | null>(null)
  
  // Используем данные бронирований напрямую
  const eventBookings = eventBookingsData || []
  
  const statusColors: Record<string, string> = {
    planning: 'yellow',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
    pending: 'orange'
  }
  
  const handleDeleteVendor = async () => {
    if (!vendorToDelete || !booking) return
    
    try {
      // Находим бронирование для этого подрядчика
      const vendorBooking = eventBookings.find((b: any) => b.vendorId === vendorToDelete)
      if (vendorBooking) {
        // Обновляем статус на cancelled
        await updateBooking({
          id: vendorBooking.id,
          data: { status: 'cancelled' }
        }).unwrap()
        // Обновляем список бронирований
        refetchBookings()
      }
      setVendorToDelete(null)
      onDeleteModalClose()
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Ошибка при удалении подрядчика')
    }
  }
  
  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Загрузка...</Text>
      </Container>
    )
  }
  
  if (error || !booking) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Бронирование не найдено
        </Alert>
        <Button mt={4} onClick={() => navigate(URLs.profile.url)}>
          Вернуться в профиль
        </Button>
      </Container>
    )
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={8}>
        <Heading size="lg">Детали бронирования #{booking.id}</Heading>
        <Button onClick={() => navigate(URLs.profile.url)} variant="outline">
          Назад к профилю
        </Button>
      </HStack>
      
      <VStack spacing={6} align="stretch">
        {/* Информация о мероприятии */}
        {booking.event && (
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">{booking.event.title}</Heading>
                  <Badge colorScheme={statusColors[booking.status] || 'gray'}>
                    {booking.status}
                  </Badge>
                </HStack>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Тип мероприятия</Text>
                    <Text fontWeight="bold">{booking.event.type}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Дата</Text>
                    <Text fontWeight="bold">
                      {new Date(booking.event.date).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Количество гостей</Text>
                    <Text fontWeight="bold">{booking.event.guestsCount}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Город</Text>
                    <Text fontWeight="bold">{booking.event.city}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Бюджет</Text>
                    <Text fontWeight="bold">{booking.event.budget.toLocaleString()} ₽</Text>
                  </Box>
                </SimpleGrid>
                {booking.event.description && (
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={2}>Описание</Text>
                    <Text whiteSpace="pre-wrap">{booking.event.description}</Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}
        
        {/* Подрядчики */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Heading size="md">Подрядчики ({eventBookings.length})</Heading>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="pink"
                size="sm"
                onClick={onAddModalOpen}
              >
                Добавить подрядчика
              </Button>
            </HStack>
            
            {eventBookings.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {eventBookings
                  .filter((b: any) => b.status !== 'cancelled')
                  .map((b: any) => (
                    <VendorInfoCard
                      key={b.id}
                      booking={b}
                      onDelete={() => {
                        setVendorToDelete(b.vendorId)
                        onDeleteModalOpen()
                      }}
                    />
                  ))}
              </SimpleGrid>
            ) : (
              <Alert status="info">
                <AlertIcon />
                Подрядчики не добавлены
              </Alert>
            )}
          </CardBody>
        </Card>
        
        {/* Контактная информация */}
        {eventBookings.filter((b: any) => b.status !== 'cancelled').length > 0 && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>Контактная информация подрядчиков</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {eventBookings
                  .filter((b: any) => b.status !== 'cancelled')
                  .map((b: any) => b.vendor && (
                    <ContactCard key={b.id} vendor={b.vendor} />
                  ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}
      </VStack>
      
      {/* Модалка добавления подрядчика */}
      <AddVendorModal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        favorites={favorites}
        eventId={booking?.eventId || booking?.event?.id}
        existingVendorIds={eventBookings.map((b: any) => b.vendorId)}
        bookingDate={booking?.event?.date || booking?.date}
        onVendorAdded={refetchBookings}
      />
      
      {/* Модалка удаления подрядчика */}
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить подрядчика</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Вы уверены, что хотите удалить этого подрядчика из бронирования?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onDeleteModalClose}>
              Отмена
            </Button>
            <Button colorScheme="red" onClick={handleDeleteVendor}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

const VendorInfoCard = ({ booking, onDelete }: { booking: any; onDelete: () => void }) => {
  const { data: vendor } = useGetVendorQuery(booking.vendorId, { skip: !booking.vendorId })
  const { data: services = [] } = useGetServicesQuery({ vendorId: booking.vendorId })
  
  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm">{vendor?.companyName || `Подрядчик #${booking.vendorId}`}</Heading>
            <IconButton
              aria-label="Удалить"
              icon={<FaTrash />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={onDelete}
            />
          </HStack>
          {vendor && (
            <>
              <HStack>
                <AiFillStar color="#f6ad55" />
                <Text fontWeight="bold">{vendor.rating}</Text>
                <Text fontSize="sm" color="gray.600">({vendor.reviewsCount} отзывов)</Text>
              </HStack>
              <HStack fontSize="sm" color="gray.600">
                <FaMapMarkerAlt />
                <Text>{vendor.city}</Text>
              </HStack>
            </>
          )}
          {booking.service && (
            <Box>
              <Text fontSize="sm" color="gray.600">Услуга</Text>
              <Text fontWeight="bold">{booking.service.name}</Text>
            </Box>
          )}
          <Box>
            <Text fontSize="sm" color="gray.600">Стоимость</Text>
            <Text fontSize="xl" fontWeight="bold" color="pink.500">
              {booking.totalPrice.toLocaleString()} ₽
            </Text>
          </Box>
          <Button
            as={Link}
            to={`${URLs.vendorProfile.url}?id=${booking.vendorId}`}
            size="sm"
            variant="outline"
          >
            Посмотреть профиль
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

const ContactCard = ({ vendor }: { vendor: any }) => {
  return (
    <Card>
      <CardBody>
        <VStack align="start" spacing={3}>
          <Heading size="sm">{vendor.companyName}</Heading>
          <HStack>
            <FaPhone />
            <Text>{vendor.phone}</Text>
          </HStack>
          <HStack>
            <FaEnvelope />
            <Text fontSize="sm">{vendor.email}</Text>
          </HStack>
          {vendor.contactPerson && (
            <Text fontSize="sm" color="gray.600">
              Контактное лицо: {vendor.contactPerson}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

const AddVendorModal = ({ 
  isOpen, 
  onClose, 
  favorites,
  eventId,
  existingVendorIds,
  bookingDate,
  onVendorAdded
}: { 
  isOpen: boolean
  onClose: () => void
  favorites: any[]
  eventId?: number
  existingVendorIds: number[]
  bookingDate?: string
  onVendorAdded?: () => void
}) => {
  const [createBooking] = useCreateBookingMutation()
  const navigate = useNavigate()
  const currentUser = useAppSelector(state => state.auth.user)
  
  // Фильтруем подрядчиков, которые уже добавлены
  const availableFavorites = favorites.filter((v: any) => !existingVendorIds.includes(v.id))
  
  const handleAddVendor = async (vendorId: number) => {
    if (!eventId || !bookingDate) {
      alert('Ошибка: отсутствует информация о мероприятии')
      return
    }
    
    if (!currentUser?.id) {
      alert('Необходимо войти в систему для добавления подрядчика')
      return
    }
    
    try {
      // Получаем первую услугу подрядчика
      const servicesResponse = await fetch(`/api/eventura/services?vendorId=${vendorId}`)
      const services: any[] = servicesResponse.ok ? await servicesResponse.json() : []
      const service = services[0] || { id: 1 }
      
      await createBooking({
        clientId: currentUser.id,
        vendorId,
        serviceId: service.id,
        eventId,
        status: 'planning',
        totalPrice: 0,
        date: bookingDate
      }).unwrap()
      
      onVendorAdded?.()
      onClose()
    } catch (error) {
      console.error('Error adding vendor:', error)
      alert('Ошибка при добавлении подрядчика')
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Добавить подрядчика из избранного</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {availableFavorites.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {availableFavorites.map((vendor: any) => (
                <Card key={vendor.id} cursor="pointer" _hover={{ boxShadow: 'lg' }}>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Heading size="sm">{vendor.companyName}</Heading>
                      <HStack>
                        <AiFillStar color="#f6ad55" />
                        <Text>{vendor.rating}</Text>
                        <Text fontSize="sm" color="gray.600">({vendor.reviewsCount} отзывов)</Text>
                      </HStack>
                      <HStack fontSize="sm" color="gray.600">
                        <FaMapMarkerAlt />
                        <Text>{vendor.city}</Text>
                      </HStack>
                      <Button
                        size="sm"
                        colorScheme="pink"
                        onClick={() => handleAddVendor(vendor.id)}
                      >
                        Добавить
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Text>Все подрядчики из избранного уже добавлены, или избранное пусто</Text>
              </Alert>
              <Button as={Link} to={URLs.catalog.url} colorScheme="blue">
                Перейти в каталог
              </Button>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Закрыть
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default BookingDetailPage

