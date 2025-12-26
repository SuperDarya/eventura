import React from 'react'
import { 
  Box,
  Button,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Stack,
  Icon,
  useColorModeValue,
  Image,
  AspectRatio
} from '@chakra-ui/react'
import { FaUsers, FaSearch, FaShieldAlt, FaHeadset, FaUtensils, FaMusic, FaCamera, FaPalette, FaBuilding, FaCar } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { URLs } from '../../__data__/urls'
import { StatCard } from '../../components/ui'

// Путь к изображению через API
const heroImage = '/api/images/i.webp'

const features = [
  {
    icon: FaUsers,
    title: 'Проверенные подрядчики',
    description: 'Все подрядчики проходят тщательную проверку и имеют положительные отзывы'
  },
  {
    icon: FaSearch,
    title: 'Умный поиск',
    description: 'Найдите подходящих подрядчиков по множеству критериев и параметров'
  },
  {
    icon: FaShieldAlt,
    title: 'Безопасные платежи',
    description: 'Защищенные транзакции и гарантия возврата средств'
  },
  {
    icon: FaHeadset,
    title: 'Поддержка 24/7',
    description: 'Наша команда всегда готова помочь вам с организацией мероприятия'
  }
]

const categories = [
  { icon: FaUtensils, name: 'Кейтеринг', description: 'Рестораны, кафе, частные повара' },
  { icon: FaMusic, name: 'Развлечения', description: 'Музыканты, DJ, ведущие, артисты' },
  { icon: FaCamera, name: 'Фото и видео', description: 'Фотографы, видеографы, операторы' },
  { icon: FaPalette, name: 'Декор', description: 'Флористы, дизайнеры, декораторы' },
  { icon: FaBuilding, name: 'Площадки', description: 'Рестораны, залы, открытые площадки' },
  { icon: FaCar, name: 'Транспорт', description: 'Автобусы, лимузины, такси' }
]

const stats = [
  { number: '500+', label: 'Подрядчиков' },
  { number: '1000+', label: 'Успешных мероприятий' },
  { number: '98%', label: 'Довольных клиентов' },
  { number: '24/7', label: 'Поддержка' }
]

const HomePage = () => {
  const bgGradient = useColorModeValue(
    'linear(to-r, black, gray.800)',
    'linear(to-r, gray.900, black)'
  )
  
  return (
    <Box>
      {/* Hero Section */}
      <Box
        position="relative"
        color="white"
        py={{ base: 20, md: 32 }}
        px={4}
        overflow="hidden"
      >
        {/* Background Image with Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
        >
          <Image
            src={heroImage}
            alt="Элегантный банкетный зал с накрытыми столами, свечами и декором"
            objectFit="cover"
            w="100%"
            h="100%"
            fallback={
              <Box
                bgGradient={bgGradient}
                w="100%"
                h="100%"
              />
            }
          />
          {/* Dark overlay for text readability */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-r, rgba(1, 4, 0, 0.85), rgba(48, 51, 46, 0.75))"
            zIndex={1}
          />
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={2}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="start" spacing={6}>
              <Heading size={{ base: 'xl', md: '2xl' }} lineHeight="1.2">
                Организуйте <Box as="span" color="brand.400">идеальное</Box> мероприятие
              </Heading>
              <Text fontSize={{ base: 'md', md: 'xl' }} color="gray.200">
                Найдите лучших подрядчиков для вашего события среди проверенных профессионалов. 
                От свадеб до корпоративов — мы создаем незабываемые моменты.
              </Text>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <Button 
                  as={Link} 
                  to={URLs.booking.url}
                  colorScheme="brand" 
                  size={{ base: 'md', md: 'lg' }}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                >
                  Начать планирование
                </Button>
                <Button 
                  as={Link} 
                  to={URLs.catalog.url}
                  variant="outline" 
                  colorScheme="whiteAlpha"
                  size={{ base: 'md', md: 'lg' }}
                  borderColor="whiteAlpha.500"
                  _hover={{ bg: 'whiteAlpha.200', borderColor: 'whiteAlpha.700' }}
                >
                  Посмотреть каталог
                </Button>
              </Stack>
            </VStack>
            <Box
              borderRadius="xl"
              overflow="hidden"
              boxShadow="2xl"
              display={{ base: 'none', md: 'block' }}
            >
              <AspectRatio ratio={4 / 3} maxW="100%">
                <Image
                  src={heroImage}
                  alt="Элегантный банкетный зал с накрытыми столами, свечами и декором"
                  objectFit="cover"
                  fallback={
                    <Box bg="dark.500" w="100%" h="100%" />
                  }
                />
              </AspectRatio>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size="xl" textAlign="center">
              Почему выбирают нас
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="100%">
              {features.map((feature, index) => (
                <Box
                  key={index}
                  p={6}
                  bg={useColorModeValue('white', 'gray.800')}
                  borderRadius="lg"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'xl' }}
                  transition="all 0.3s"
                >
                  <VStack align="start" spacing={4}>
                    <Icon as={feature.icon} boxSize={10} color="brand.400" />
                    <Heading size="md">{feature.title}</Heading>
                    <Text color="gray.600">{feature.description}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Categories Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size={{ base: 'lg', md: 'xl' }} textAlign="center">
              Категории услуг
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="100%">
              {categories.map((category, index) => (
                <Box
                  key={index}
                  p={8}
                  borderWidth="1px"
                  borderRadius="lg"
                  _hover={{ borderColor: 'brand.400', transform: 'translateY(-4px)', boxShadow: 'lg' }}
                  transition="all 0.3s"
                  cursor="pointer"
                  as={Link}
                  to={`${URLs.catalog.url}?category=${category.name}`}
                >
                  <VStack spacing={4}>
                    <Icon as={category.icon} boxSize={12} color="brand.400" />
                    <Heading size="md">{category.name}</Heading>
                    <Text color="gray.600" textAlign="center">{category.description}</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
            {stats.map((stat, index) => (
              <StatCard key={index} number={stat.number} label={stat.label} />
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage

