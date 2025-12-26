import React, { useState, useEffect } from 'react'
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
  SimpleGrid,
  useColorModeValue,
  Avatar,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Alert,
  AlertIcon,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
} from '@chakra-ui/react'
import { AiFillStar, AiOutlineEdit, AiOutlineDelete, AiOutlinePlus } from 'react-icons/ai'
import { FaMapMarkerAlt, FaHeart, FaCalendar } from 'react-icons/fa'
import { 
  useGetEventsQuery, 
  useGetBookingsQuery, 
  useGetFavoritesQuery, 
  useRemoveFavoriteMutation,
  useGetServicesQuery,
  useGetBookingsQuery as useGetVendorBookingsQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
  useUpdateVendorCalendarMutation,
  Service
} from '../../__data__/api'
import { useAppSelector, useAppDispatch } from '../../__data__/store'
import { logout } from '../../__data__/authSlice'
import { Link, useNavigate } from 'react-router-dom'
import { URLs } from '../../__data__/urls'
import { useToast } from '../../hooks/useToast'
import { ServiceCard } from '../../components/ui'

const ProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => state.auth.user)
  const [activeTab, setActiveTab] = useState(0)
  
  const isClient = user?.type === 'client'
  const isVendor = user?.type === 'vendor' || user?.type === 'organizer'
  const currentUserId = user?.id || 0
  
  const { data: events = [] } = useGetEventsQuery({ clientId: currentUserId }, { skip: !isClient || !currentUserId })
  const { data: bookings = [] } = useGetBookingsQuery({ clientId: currentUserId }, { skip: !isClient || !currentUserId })
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId, { skip: !isClient || !currentUserId })
  const { data: services = [] } = useGetServicesQuery({ vendorId: currentUserId }, { skip: !isVendor || !currentUserId })
  const { data: vendorBookings = [] } = useGetVendorBookingsQuery({ vendorId: currentUserId }, { skip: !isVendor || !currentUserId })
  
  const [removeFavorite] = useRemoveFavoriteMutation()
  const [createService] = useCreateServiceMutation()
  const [updateService] = useUpdateServiceMutation()
  const [deleteService] = useDeleteServiceMutation()
  const [updateCalendar] = useUpdateVendorCalendarMutation()
  const { showError, showSuccess } = useToast()
  
  const { isOpen: isServiceModalOpen, onOpen: onServiceModalOpen, onClose: onServiceModalClose } = useDisclosure()
  const { isOpen: isCalendarModalOpen, onOpen: onCalendarModalOpen, onClose: onCalendarModalClose } = useDisclosure()
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure()
  const cancelRef = React.useRef<HTMLButtonElement>(null)
  
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null)
  const [calendarDates, setCalendarDates] = useState<string[]>(user?.calendar || [])
  const [newDate, setNewDate] = useState('')
  
  useEffect(() => {
    if (user?.calendar) {
      setCalendarDates(user.calendar)
    }
  }, [user])
  
  // Если не авторизован, перенаправляем на страницу авторизации
  useEffect(() => {
    if (!user) {
      navigate(URLs.auth.url)
    }
  }, [user, navigate])
  
  if (!user) {
    return null
  }
  
  const handleRemoveFavorite = async (vendorId: number) => {
    try {
      await removeFavorite({ userId: currentUserId, vendorId }).unwrap()
    } catch (error) {
    }
  }
  
  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const serviceData = {
      vendorId: currentUserId,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
      priceMin: parseInt(formData.get('priceMin') as string) || 0,
      priceMax: parseInt(formData.get('priceMax') as string) || 0,
      unit: formData.get('unit') as string || 'шт',
      duration: parseInt(formData.get('duration') as string) || 0
    }
    
    try {
      if (editingService) {
        await updateService({ id: editingService.id, data: serviceData }).unwrap()
      } else {
        await createService(serviceData).unwrap()
      }
      showSuccess(editingService ? 'Услуга обновлена' : 'Услуга создана')
      onServiceModalClose()
      setEditingService(null)
    } catch (error) {
      showError('Ошибка', 'Не удалось сохранить услугу')
    }
  }
  
  const handleDeleteServiceClick = (serviceId: number) => {
    setServiceToDelete(serviceId)
    onDeleteDialogOpen()
  }
  
  const handleDeleteService = async () => {
    if (!serviceToDelete) return
    
    try {
      await deleteService(serviceToDelete).unwrap()
      showSuccess('Услуга удалена')
      setServiceToDelete(null)
      onDeleteDialogClose()
    } catch (error) {
      showError('Ошибка', 'Не удалось удалить услугу')
    }
  }
  
  const handleAddCalendarDate = () => {
    if (newDate && !calendarDates.includes(newDate)) {
      const updated = [...calendarDates, newDate].sort()
      setCalendarDates(updated)
      setNewDate('')
    }
  }
  
  const handleRemoveCalendarDate = (date: string) => {
    const updated = calendarDates.filter(d => d !== date)
    setCalendarDates(updated)
  }
  
  const handleSaveCalendar = async () => {
    try {
      await updateCalendar({ vendorId: currentUserId, calendar: calendarDates }).unwrap()
      showSuccess('Календарь обновлен')
      onCalendarModalClose()
    } catch (error) {
      showError('Ошибка', 'Не удалось сохранить календарь')
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
      <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" mb={8} spacing={4}>
        <Heading size={{ base: 'md', md: 'lg' }}>Личный кабинет</Heading>
        <Button onClick={() => dispatch(logout())} variant="outline" size="sm" width={{ base: '100%', md: 'auto' }}>
          Выйти
        </Button>
      </Stack>
      
      {isClient ? (
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
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" spacing={3}>
                  <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
                    Мои мероприятия ({events.length})
                  </Text>
                  <Button 
                    as={Link} 
                    to={URLs.booking.url}
                    colorScheme="brand"
                    size="sm"
                    width={{ base: '100%', md: 'auto' }}
                  >
                    Создать новое
                  </Button>
                </Stack>
                
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
                      colorScheme="brand"
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
                            <Text fontSize="lg" fontWeight="bold" color="brand.500">
                              {booking.totalPrice.toLocaleString()} ₽
                            </Text>
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
                                colorScheme="brand"
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
                      colorScheme="brand"
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
      ) : isVendor ? (
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Мои объявления</Tab>
            <Tab>Бронирования</Tab>
            <Tab>Календарь</Tab>
            <Tab>Настройки</Tab>
          </TabList>
          
          <TabPanels>
            {/* Мои объявления */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" spacing={3}>
                  <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold">
                    Мои услуги ({services.length})
                  </Text>
                  <Button 
                    onClick={() => {
                      setEditingService(null)
                      onServiceModalOpen()
                    }}
                    colorScheme="brand"
                    size="sm"
                    leftIcon={<AiOutlinePlus />}
                    width={{ base: '100%', md: 'auto' }}
                  >
                    Добавить услугу
                  </Button>
                </Stack>
                
                {services.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {services.map((service: Service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        showActions={true}
                        onEdit={() => {
                          setEditingService(service)
                          onServiceModalOpen()
                        }}
                        onDelete={() => handleDeleteServiceClick(service.id)}
                      />
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500" mb={4}>У вас пока нет услуг</Text>
                    <Button 
                      onClick={() => {
                        setEditingService(null)
                        onServiceModalOpen()
                      }}
                      colorScheme="brand"
                    >
                      Добавить первую услугу
                    </Button>
                  </Box>
                )}
              </VStack>
            </TabPanel>
            
            {/* Бронирования подрядчика */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  Бронирования ({vendorBookings.length})
                </Text>
                
                {vendorBookings.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {vendorBookings.map((booking: any) => (
                      <Card key={booking.id}>
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
                              Клиент: #{booking.clientId}
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="brand.500">
                              {booking.totalPrice.toLocaleString()} ₽
                            </Text>
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
            
            {/* Календарь */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="semibold">
                    Занятые даты ({calendarDates.length})
                  </Text>
                  <Button 
                    onClick={onCalendarModalOpen}
                    colorScheme="brand"
                    size="sm"
                    leftIcon={<FaCalendar />}
                  >
                    Управление календарем
                  </Button>
                </HStack>
                
                {calendarDates.length > 0 ? (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                    {calendarDates.map((date) => (
                      <Badge key={date} colorScheme="red" p={2} textAlign="center">
                        {new Date(date).toLocaleDateString()}
                      </Badge>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text color="gray.500">У вас нет занятых дат</Text>
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
      ) : null}
      
      {/* Модальное окно для услуги */}
      <Modal isOpen={isServiceModalOpen} onClose={onServiceModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleServiceSubmit}>
            <ModalHeader>
              {editingService ? 'Редактировать услугу' : 'Добавить услугу'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Название</FormLabel>
                  <Input name="name" defaultValue={editingService?.name} />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Категория</FormLabel>
                  <Select name="category" defaultValue={editingService?.category}>
                    <option value="Фотограф">Фотограф</option>
                    <option value="Видеограф">Видеограф</option>
                    <option value="Декор">Декор</option>
                    <option value="Кейтеринг">Кейтеринг</option>
                    <option value="Музыка">Музыка</option>
                    <option value="Организатор">Организатор</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Описание</FormLabel>
                  <Textarea name="description" defaultValue={editingService?.description} rows={4} />
                </FormControl>
                
                <HStack spacing={4} width="100%">
                  <FormControl>
                    <FormLabel>Цена от (₽)</FormLabel>
                    <Input name="priceMin" type="number" defaultValue={editingService?.priceMin} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Цена до (₽)</FormLabel>
                    <Input name="priceMax" type="number" defaultValue={editingService?.priceMax} />
                  </FormControl>
                </HStack>
                
                <HStack spacing={4} width="100%">
                  <FormControl>
                    <FormLabel>Единица измерения</FormLabel>
                    <Input name="unit" defaultValue={editingService?.unit || 'шт'} />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Длительность (мин)</FormLabel>
                    <Input name="duration" type="number" defaultValue={editingService?.duration} />
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onServiceModalClose}>
                Отмена
              </Button>
              <Button colorScheme="brand" type="submit">
                {editingService ? 'Сохранить' : 'Создать'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* Модальное окно для календаря */}
      <Modal isOpen={isCalendarModalOpen} onClose={onCalendarModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Управление календарем</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack width="100%">
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <Button onClick={handleAddCalendarDate} colorScheme="brand">
                  Добавить
                </Button>
              </HStack>
              
              <Divider />
              
              <Box width="100%">
                <Text fontWeight="semibold" mb={2}>Занятые даты:</Text>
                {calendarDates.length > 0 ? (
                  <SimpleGrid columns={2} spacing={2}>
                    {calendarDates.map((date) => (
                      <HStack key={date} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                        <Text>{new Date(date).toLocaleDateString()}</Text>
                        <IconButton
                          aria-label="Удалить"
                          icon={<AiOutlineDelete />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleRemoveCalendarDate(date)}
                        />
                      </HStack>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text color="gray.500">Нет занятых дат</Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCalendarModalClose}>
              Отмена
            </Button>
            <Button colorScheme="brand" onClick={handleSaveCalendar}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default ProfilePage

