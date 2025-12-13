import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react'
import { useLoginMutation, useRegisterMutation } from '../../__data__/api'
import { useAppDispatch } from '../../__data__/store'
import { setUser } from '../../__data__/authSlice'
import { URLs } from '../../__data__/urls'

const AuthPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState(0)
  const [error, setError] = useState<string>('')
  
  const [login, { isLoading: isLoggingIn }] = useLoginMutation()
  const [register, { isLoading: isRegistering }] = useRegisterMutation()

  const bg = useColorModeValue('white', 'gray.800')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await login({ email, password }).unwrap()
      dispatch(setUser(result))
      navigate(URLs.profile.url)
    } catch (err: any) {
      setError(err.data?.error || 'Ошибка входа')
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const type = formData.get('type') as 'client' | 'vendor' | 'organizer'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const city = formData.get('city') as string
    const companyName = formData.get('companyName') as string
    const contactPerson = formData.get('contactPerson') as string

    try {
      const result = await register({
        email,
        password,
        type,
        firstName,
        lastName,
        phone,
        city,
        companyName: type !== 'client' ? companyName : undefined,
        contactPerson: type !== 'client' ? contactPerson : undefined,
      }).unwrap()
      dispatch(setUser(result))
      navigate(URLs.profile.url)
    } catch (err: any) {
      setError(err.data?.error || 'Ошибка регистрации')
    }
  }

  return (
    <Container maxW="md" py={8}>
      <Box bg={bg} p={8} borderRadius="md" boxShadow="md">
        <Heading size="lg" mb={6} textAlign="center">
          Eventura
        </Heading>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Вход</Tab>
            <Tab>Регистрация</Tab>
          </TabList>

          <TabPanels>
            {/* Вход */}
            <TabPanel>
              <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input name="email" type="email" placeholder="your@email.com" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Пароль</FormLabel>
                    <Input name="password" type="password" placeholder="••••••••" />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="pink"
                    width="full"
                    isLoading={isLoggingIn}
                    loadingText="Вход..."
                  >
                    Войти
                  </Button>
                </VStack>
              </form>
            </TabPanel>

            {/* Регистрация */}
            <TabPanel>
              <form onSubmit={handleRegister}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Тип аккаунта</FormLabel>
                    <Select name="type" defaultValue="client">
                      <option value="client">Клиент</option>
                      <option value="vendor">Подрядчик</option>
                      <option value="organizer">Организатор</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input name="email" type="email" placeholder="your@email.com" />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Пароль</FormLabel>
                    <Input name="password" type="password" placeholder="••••••••" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Имя</FormLabel>
                    <Input name="firstName" placeholder="Иван" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Фамилия</FormLabel>
                    <Input name="lastName" placeholder="Иванов" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Телефон</FormLabel>
                    <Input name="phone" placeholder="+7 (999) 123-45-67" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Город</FormLabel>
                    <Input name="city" placeholder="Москва" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Название компании (для подрядчиков)</FormLabel>
                    <Input name="companyName" placeholder="ООО Рога и Копыта" />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Контактное лицо (для подрядчиков)</FormLabel>
                    <Input name="contactPerson" placeholder="Иван Иванов" />
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="pink"
                    width="full"
                    isLoading={isRegistering}
                    loadingText="Регистрация..."
                  >
                    Зарегистрироваться
                  </Button>
                </VStack>
              </form>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default AuthPage

