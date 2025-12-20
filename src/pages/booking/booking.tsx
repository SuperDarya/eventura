import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Divider,
  useColorModeValue,
  Progress,
  Radio,
  RadioGroup,
  Stack
} from '@chakra-ui/react'
import { useAiSearchMutation, useCreateEventMutation, useGetVendorQuery, useCreateBookingMutation, useGetFavoritesQuery, useGetVendorsQuery, useGetServicesQuery, api } from '../../__data__/api'
import { Link, useNavigate } from 'react-router-dom'
import { URLs } from '../../__data__/urls'
import { AiFillStar } from 'react-icons/ai'
import { useAppDispatch, useAppSelector } from '../../__data__/store'
import { updateField, setFormData as setFormDataAction, clearForm } from '../../__data__/bookingFormSlice'

const eventTypes = ['Свадьба', 'День рождения', 'Корпоратив', 'Гендер-пати', 'Выпускной', 'Юбилей', 'Детский праздник']
const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород']

const steps = [
  { title: 'Основная информация' },
  { title: 'Подбор подрядчиков' },
  { title: 'Выбор подрядчиков' },
]

const BookingPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const savedFormData = useAppSelector(state => state.bookingForm)
  
  const [activeStep, setActiveStep] = useState(0)
  const [selectionMode, setSelectionMode] = useState<'ai' | 'manual'>('ai') // 'ai' или 'manual'
  
  // Используем данные из Redux store, но с локальным state для UI
  const [formData, setFormDataLocal] = useState(savedFormData)
  
  // Загружаем данные из store при монтировании и при изменении store
  const [wasEmpty, setWasEmpty] = useState(true)
  
  useEffect(() => {
    // Если в store есть данные, обновляем локальный state
    const hasData = savedFormData.eventType || savedFormData.date || savedFormData.city || savedFormData.budget || savedFormData.guestsCount
    if (hasData) {
      const wasEmptyBefore = wasEmpty && !formData.eventType && !formData.date && !formData.city
      setFormDataLocal(savedFormData)
      
      // Показываем уведомление, если форма была предзаполнена из чата (была пустая, стала заполненной)
      if (wasEmptyBefore && hasData) {
        setShowPrefilledAlert(true)
        setTimeout(() => setShowPrefilledAlert(false), 5000)
      }
      
      if (wasEmpty) {
        setWasEmpty(false)
      }
    }
  }, [savedFormData])
  
  useEffect(() => {
    try {
      localStorage.setItem('bookingForm', JSON.stringify(savedFormData))
    } catch (error) {
    }
  }, [savedFormData])
  
  const [aiResult, setAiResult] = useState<any>(null)
  const [selectedVendors, setSelectedVendors] = useState<number[]>(savedFormData.selectedVendors || [])
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('')
  const [clarificationAnswer, setClarificationAnswer] = useState<string>('')
  const [clarificationCount, setClarificationCount] = useState(0)
  const [showPrefilledAlert, setShowPrefilledAlert] = useState(false)
  
  // Для ручного выбора
  const [showFavorites, setShowFavorites] = useState(false)
  const currentUser = useAppSelector(state => state.auth.user)
  
  const [aiSearch, { isLoading: isSearching }] = useAiSearchMutation()
  const [createEvent] = useCreateEventMutation()
  const [createBooking] = useCreateBookingMutation()
  const { data: favorites = [] } = useGetFavoritesQuery(currentUser?.id || 0, { skip: !showFavorites || !currentUser?.id })
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [paymentData, setPaymentData] = useState<any>(null)
  
  const handleInputChange = (field: string, value: any) => {
    const updatedData = { ...formData, [field]: value }
    setFormDataLocal(updatedData)
    // Сохраняем в Redux store
    dispatch(updateField({ field: field as any, value }))
  }
  
  const handleAISearch = async () => {
    if (!formData.eventType || !formData.date || !formData.guestsCount || !formData.city) {
      alert('Заполните все обязательные поля')
      return
    }
    
    try {
      const result = await aiSearch({
        eventType: formData.eventType,
        budget: formData.budget ? parseInt(formData.budget) : 100000,
        guestsCount: parseInt(formData.guestsCount),
        date: formData.date,
        city: formData.city,
        description: formData.description || '',
        clarificationCount: clarificationCount
      }).unwrap()
      
      if (result.needsClarification && result.clarificationQuestion && clarificationCount < 2) {
        setClarificationQuestion(result.clarificationQuestion)
        setClarificationCount(prev => prev + 1)
        return
      }
      
      setAiResult(result)
      setActiveStep(2)
      setClarificationQuestion('')
      } catch (error) {
        alert('Ошибка при поиске подрядчиков')
    }
  }
  
  const handleAnswerClarification = async () => {
    if (!clarificationAnswer) return
    
    const updatedDescription = formData.description 
      ? `${formData.description}\n\nУточнение: ${clarificationAnswer}`
      : `Уточнение: ${clarificationAnswer}`
    
    setFormDataLocal(prev => ({ ...prev, description: updatedDescription }))
    setClarificationAnswer('')
    setClarificationQuestion('')
    
    // Повторный поиск с уточнением
    await handleAISearch()
  }
  
  const handleSelectVendor = (vendorId: number) => {
    const updated = selectedVendors.includes(vendorId) 
      ? selectedVendors.filter(id => id !== vendorId)
      : [...selectedVendors, vendorId]
    setSelectedVendors(updated)
    dispatch(updateField({ field: 'selectedVendors', value: updated }))
  }
  
  const handleBook = async () => {
    if (selectedVendors.length === 0) {
      alert('Выберите хотя бы одного подрядчика')
      return
    }
    
    if (!currentUser?.id) {
      alert('Необходимо войти в систему для создания бронирования')
      return
    }
    
    try {
      // Создаем мероприятие
      const event = await createEvent({
        type: formData.eventType,
        title: `${formData.eventType} - ${new Date(formData.date).toLocaleDateString()}`,
        budget: formData.budget ? parseInt(formData.budget) : 100000,
        guestsCount: parseInt(formData.guestsCount),
        date: formData.date,
        city: formData.city,
        description: formData.description || aiResult?.eventConcept || '',
        status: 'planning',
        clientId: currentUser.id
      }).unwrap()
      
      // Получаем услуги через API для создания бронирований
      const servicesResult = await dispatch(api.endpoints.getServices.initiate({}))
      const services: any[] = servicesResult.data || []
      
      // Создаем бронирования для каждого выбранного подрядчика
      const createdBookings = []
      let firstBookingId: number | null = null
      
      for (const vendorId of selectedVendors) {
        // Находим первую услугу подрядчика или используем первую доступную
        const vendorService = services.find((s: any) => s.vendorId === vendorId) || services[0] || { id: 1 }
        
        const estimatedPrice = selectionMode === 'ai' 
          ? (aiResult?.vendors?.find((v: any) => v.vendorId === vendorId)?.estimatedPrice || 0)
          : 0 // Для ручного выбора цена будет указана позже
        
        const booking = await createBooking({
          clientId: currentUser.id,
          vendorId,
          serviceId: vendorService.id,
          eventId: event.id,
          status: 'planning',
          totalPrice: estimatedPrice,
          date: formData.date
        }).unwrap()
        
        createdBookings.push(booking)
        if (!firstBookingId) {
          firstBookingId = booking.id
        }
      }
      
      // Очищаем форму
      dispatch(clearForm())
      // Очищаем localStorage
      try {
        localStorage.removeItem('bookingForm')
      } catch (error) {
      }
      
      // Перенаправляем на детальную страницу первого бронирования
      if (firstBookingId) {
        navigate(URLs.bookingDetail.makeUrl(firstBookingId))
      } else {
        alert('Ошибка при создании бронирования')
      }
    } catch (error) {
      alert('Ошибка при создании бронирования')
    }
  }
  
  const handlePayment = () => {
    // TODO: Интеграция с платежной системой
    alert('TODO: Интеграция с платежной системой. Бронирование сохранено!')
    onClose()
    // Перенаправление на страницу профиля или успеха
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={8}>Планирование мероприятия</Heading>
      
      <Box mb={8}>
        <Progress value={(activeStep / (steps.length - 1)) * 100} mb={4} colorScheme="pink" />
        <HStack spacing={4} justify="center">
          {steps.map((step, index) => (
            <VStack key={index} spacing={1}>
              <Box
                w="40px"
                h="40px"
                borderRadius="full"
                bg={index <= activeStep ? 'pink.400' : 'gray.200'}
                color={index <= activeStep ? 'white' : 'gray.600'}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
              >
                {index + 1}
              </Box>
              <Text fontSize="sm" fontWeight={index === activeStep ? 'bold' : 'normal'}>
                {step.title}
              </Text>
            </VStack>
          ))}
        </HStack>
      </Box>
      
      {/* Уведомление о предзаполнении формы */}
      {showPrefilledAlert && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Форма предзаполнена данными из чата</Text>
            <Text fontSize="sm">Проверьте и при необходимости дополните информацию</Text>
          </Box>
        </Alert>
      )}
      
      {/* Step 1: Основная информация */}
      {activeStep === 0 && (
        <Box maxW="800px" mx="auto">
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Тип мероприятия</FormLabel>
              <Select 
                placeholder="Выберите тип"
                value={formData.eventType}
                onChange={(e) => handleInputChange('eventType', e.target.value)}
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl isRequired>
              <FormLabel>Дата мероприятия</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            
            <HStack>
              <FormControl isRequired>
                <FormLabel>Количество гостей</FormLabel>
                <Input
                  type="number"
                  value={formData.guestsCount}
                  onChange={(e) => handleInputChange('guestsCount', e.target.value)}
                  min={1}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Бюджет (₽)</FormLabel>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  min={0}
                />
              </FormControl>
            </HStack>
            
            <FormControl isRequired>
              <FormLabel>Город</FormLabel>
              <Select 
                placeholder="Выберите город"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>Описание и пожелания</FormLabel>
              <Textarea
                placeholder="Расскажите подробнее о вашем мероприятии..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
              />
            </FormControl>
            
            <Box>
              <Text fontWeight="semibold" mb={4}>Как вы хотите выбрать подрядчиков?</Text>
              <RadioGroup value={selectionMode} onChange={(val: 'ai' | 'manual') => setSelectionMode(val)}>
                <Stack direction="column" spacing={3} mb={6}>
                  <Radio value="ai" colorScheme="pink">
                    <VStack align="start" spacing={1} ml={2}>
                      <Text fontWeight="medium">ИИ-подбор</Text>
                      <Text fontSize="sm" color="gray.600">
                        ИИ проанализирует ваши требования и подберет лучших подрядчиков
                      </Text>
                    </VStack>
                  </Radio>
                  <Radio value="manual" colorScheme="pink">
                    <VStack align="start" spacing={1} ml={2}>
                      <Text fontWeight="medium">Выбрать самостоятельно</Text>
                      <Text fontSize="sm" color="gray.600">
                        Выберите подрядчиков из каталога или из избранного
                      </Text>
                    </VStack>
                  </Radio>
                </Stack>
              </RadioGroup>
            </Box>
            
            <Button 
              colorScheme="pink" 
              size="lg"
              onClick={() => {
                dispatch(setFormDataAction(formData))
                setActiveStep(1)
              }}
              isDisabled={!formData.eventType || !formData.date || !formData.guestsCount || !formData.city}
            >
              Далее: {selectionMode === 'ai' ? 'ИИ-подбор' : 'Выбор подрядчиков'}
            </Button>
          </VStack>
        </Box>
      )}
      
      {/* Step 2: Подбор подрядчиков (ИИ или ручной) */}
      {activeStep === 1 && (
        <Box maxW="800px" mx="auto">
          <VStack spacing={6} align="stretch">
            {selectionMode === 'ai' ? (
              /* ИИ-подбор */
              <>
                {clarificationQuestion ? (
                  <>
                    <Alert status="info">
                      <AlertIcon />
                      <Box>
                        <Text fontWeight="bold">Уточняющий вопрос от ИИ:</Text>
                        <Text>{clarificationQuestion}</Text>
                      </Box>
                    </Alert>
                    <Textarea
                      placeholder="Ваш ответ..."
                      value={clarificationAnswer}
                      onChange={(e) => setClarificationAnswer(e.target.value)}
                      rows={3}
                    />
                    <HStack>
                      <Button onClick={handleAnswerClarification} colorScheme="blue">
                        Отправить ответ
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setClarificationQuestion('')
                        handleAISearch()
                      }}>
                        Пропустить
                      </Button>
                    </HStack>
                  </>
                ) : (
                  <>
                    <Text fontSize="lg" fontWeight="semibold">
                      Запуск ИИ-подбора подрядчиков...
                    </Text>
                    <Text color="gray.600">
                      ИИ анализирует ваши требования и подберет лучших подрядчиков, 
                      создаст концепцию мероприятия и оценит стоимость услуг.
                    </Text>
                    <Button 
                      colorScheme="pink" 
                      size="lg"
                      onClick={handleAISearch}
                      isLoading={isSearching}
                      loadingText="Поиск подрядчиков..."
                    >
                      Запустить ИИ-подбор
                    </Button>
                    
                    {aiResult && (
                      <Box mt={4}>
                        <Alert status="success" mb={4}>
                          <AlertIcon />
                          Подбор завершен! Найдено {aiResult.vendors?.length || 0} подрядчиков
                        </Alert>
                        <Button onClick={() => setActiveStep(2)} colorScheme="pink">
                          Просмотреть результаты
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Ручной выбор */
              <>
                <Text fontSize="lg" fontWeight="semibold">
                  Выберите подрядчиков
                </Text>
                
                <HStack spacing={4}>
                  <Button 
                    colorScheme="pink" 
                    variant={showFavorites ? "solid" : "outline"}
                    onClick={() => setShowFavorites(true)}
                  >
                    Выбрать из избранных
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    as={Link}
                    to={URLs.catalog.url}
                    onClick={() => {
                      // Сохраняем текущий прогресс при переходе в каталог
                      dispatch(setFormDataAction({ ...formData, selectedVendors }))
                    }}
                  >
                    Перейти в каталог
                  </Button>
                </HStack>
                
                {showFavorites && (
                  <Box>
                    {favorites.length > 0 ? (
                      <VStack spacing={4} align="stretch">
                        <Text fontWeight="semibold">
                          Избранные подрядчики ({selectedVendors.length} выбрано)
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          {favorites.map((vendor: any) => (
                            <ManualVendorCard
                              key={vendor.id}
                              vendor={vendor}
                              isSelected={selectedVendors.includes(vendor.id)}
                              onSelect={() => {
                                const updated = selectedVendors.includes(vendor.id)
                                  ? selectedVendors.filter(id => id !== vendor.id)
                                  : [...selectedVendors, vendor.id]
                                setSelectedVendors(updated)
                                dispatch(updateField({ field: 'selectedVendors', value: updated }))
                              }}
                            />
                          ))}
                        </SimpleGrid>
                        {selectedVendors.length > 0 && (
                          <Button 
                            colorScheme="pink" 
                            size="lg"
                            onClick={() => setActiveStep(2)}
                          >
                            Продолжить ({selectedVendors.length} выбрано)
                          </Button>
                        )}
                      </VStack>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        <VStack align="start" spacing={2}>
                          <Text>У вас пока нет избранных подрядчиков</Text>
                          <Button 
                            size="sm" 
                            colorScheme="blue"
                            as={Link}
                            to={URLs.catalog.url}
                          >
                            Перейти в каталог, чтобы добавить
                          </Button>
                        </VStack>
                      </Alert>
                    )}
                  </Box>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={() => setActiveStep(0)}>
              Назад
            </Button>
          </VStack>
        </Box>
      )}
      
      {/* Step 3: Выбор подрядчиков */}
      {activeStep === 2 && (aiResult || selectionMode === 'manual') && (
        <Box>
          <VStack spacing={6} align="stretch">
            {/* Концепция мероприятия - только для ИИ */}
            {aiResult && aiResult.eventConcept && (
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Концепция мероприятия</Heading>
                  <Text whiteSpace="pre-wrap">{aiResult?.eventConcept}</Text>
                </CardBody>
              </Card>
            )}
            
            {/* Приблизительная стоимость - только для ИИ */}
            {aiResult && aiResult.estimatedCosts && aiResult.estimatedCosts.length > 0 && (
              <Card>
                <CardBody>
                  <Heading size="md" mb={4}>Приблизительная стоимость</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {aiResult.estimatedCosts.map((cost: any, index: number) => (
                      <Box key={index} p={3} bg="gray.50" borderRadius="md">
                        <Text fontWeight="bold">{cost.category}</Text>
                        <Text fontSize="xl" color="pink.500">
                          {cost.estimatedPrice?.toLocaleString()} ₽
                        </Text>
                        {cost.notes && (
                          <Text fontSize="sm" color="gray.600">{cost.notes}</Text>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}
            
            {/* Выбранные подрядчики */}
            <Box>
              <Heading size="md" mb={4}>
                {selectionMode === 'ai' ? 'Подобранные подрядчики' : 'Выбранные подрядчики'} ({selectedVendors.length} выбрано)
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {selectionMode === 'ai' && aiResult?.vendors?.map((vendor: any, index: number) => (
                  <VendorSelectionCard
                    key={index}
                    vendor={vendor}
                    isSelected={selectedVendors.includes(vendor.vendorId)}
                    onSelect={() => handleSelectVendor(vendor.vendorId)}
                  />
                ))}
                {selectionMode === 'manual' && selectedVendors.length > 0 && selectedVendors.map((vendorId) => {
                  const vendor = favorites.find((v: any) => v.id === vendorId)
                  if (!vendor) return null
                  return (
                    <ManualVendorCard
                      key={vendorId}
                      vendor={vendor}
                      isSelected={true}
                      onSelect={() => {
                        const updated = selectedVendors.filter(id => id !== vendorId)
                        setSelectedVendors(updated)
                        dispatch(updateField({ field: 'selectedVendors', value: updated }))
                      }}
                    />
                  )
                })}
              </SimpleGrid>
              {selectionMode === 'manual' && selectedVendors.length === 0 && (
                <Alert status="info" mt={4}>
                  <AlertIcon />
                  <Text>Выберите подрядчиков на предыдущем шаге или перейдите в каталог</Text>
                </Alert>
              )}
            </Box>
            
            <HStack>
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                Назад
              </Button>
              <Button 
                colorScheme="pink" 
                size="lg"
                onClick={handleBook}
                isDisabled={selectedVendors.length === 0}
              >
                Забронировать ({selectedVendors.length})
              </Button>
            </HStack>
          </VStack>
        </Box>
      )}
      
      {/* Модалка оплаты */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Оплата бронирования</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {paymentData && (
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold">Мероприятие: {paymentData.event.title}</Text>
                <Divider />
                <Text fontWeight="bold">Выбранные подрядчики:</Text>
                {paymentData.vendors.map((vendor: any, index: number) => (
                  <HStack key={index} justify="space-between">
                    <Text>Подрядчик #{vendor.vendorId}</Text>
                    <Text fontWeight="bold">
                      {vendor.estimatedPrice?.toLocaleString()} ₽
                    </Text>
                  </HStack>
                ))}
                <Divider />
                <HStack justify="space-between" fontSize="xl" fontWeight="bold">
                  <Text>Итого:</Text>
                  <Text color="pink.500">
                    {paymentData.totalPrice.toLocaleString()} ₽
                  </Text>
                </HStack>
                <Alert status="warning">
                  <AlertIcon />
                  <Text>TODO: Здесь будет интеграция с платежной системой</Text>
                </Alert>
                <Button colorScheme="pink" onClick={handlePayment} width="100%">
                  Оплатить
                </Button>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}

const VendorSelectionCard = ({ 
  vendor, 
  isSelected, 
  onSelect 
}: { 
  vendor: any
  isSelected: boolean
  onSelect: () => void
}) => {
  const { data: vendorData, isLoading } = useGetVendorQuery(vendor.vendorId, { skip: !vendor.vendorId })
  
  return (
    <Card 
      borderWidth={isSelected ? '2px' : '1px'}
      borderColor={isSelected ? 'pink.400' : 'gray.200'}
      cursor="pointer"
      onClick={onSelect}
      _hover={{ boxShadow: 'lg' }}
    >
      <CardBody>
        {isLoading ? (
          <Spinner />
        ) : (
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Heading size="sm">{vendorData?.companyName || `Подрядчик #${vendor.vendorId}`}</Heading>
              <Badge colorScheme={isSelected ? 'pink' : 'gray'}>
                {isSelected ? 'Выбран' : 'Не выбран'}
              </Badge>
            </HStack>
            {vendorData && (
              <HStack>
                <AiFillStar color="#f6ad55" />
                <Text>{vendorData.rating}</Text>
                <Text fontSize="sm" color="gray.600">
                  ({vendorData.reviewsCount} отзывов)
                </Text>
              </HStack>
            )}
            <Text fontSize="sm" color="gray.600">{vendor.reason}</Text>
            <Text fontWeight="bold" color="pink.500">
              {vendor.estimatedPrice?.toLocaleString()} ₽
            </Text>
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}

const ManualVendorCard = ({ 
  vendor, 
  isSelected, 
  onSelect 
}: { 
  vendor: any
  isSelected: boolean
  onSelect: () => void
}) => {
  return (
    <Card 
      borderWidth={isSelected ? '2px' : '1px'}
      borderColor={isSelected ? 'pink.400' : 'gray.200'}
      cursor="pointer"
      onClick={onSelect}
      _hover={{ boxShadow: 'lg' }}
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm">{vendor.companyName || `Подрядчик #${vendor.id}`}</Heading>
            <Badge colorScheme={isSelected ? 'pink' : 'gray'}>
              {isSelected ? 'Выбран' : 'Не выбран'}
            </Badge>
          </HStack>
          <HStack>
            <AiFillStar color="#f6ad55" />
            <Text>{vendor.rating}</Text>
            <Text fontSize="sm" color="gray.600">
              ({vendor.reviewsCount} отзывов)
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600">{vendor.city}</Text>
          {isSelected && (
            <Button size="sm" colorScheme="red" variant="outline" onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}>
              Убрать
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}

export default BookingPage
