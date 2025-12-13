import React, { useMemo, useState } from 'react'
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  GridItem, 
  Heading, 
  HStack, 
  Input, 
  Select, 
  SimpleGrid, 
  Stack, 
  Tag, 
  Text, 
  VStack, 
  Badge,
  Avatar,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { AiFillStar } from 'react-icons/ai'
import { FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useGetVendorsQuery, useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../__data__/api'
import { URLs } from '../__data__/urls'

const cities = ['Все города', 'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород']
const categories = ['Все категории', 'Кейтеринг', 'Фото и видео', 'Декор', 'Развлечения', 'Площадки', 'Транспорт']

const VendorCard = ({ vendor, isFavorite, onToggleFavorite }: { vendor: any; isFavorite: boolean; onToggleFavorite: () => void }) => {
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const currentUserId = 1 // TODO: получать из авторизации
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite()
  }
  
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg={bg}
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', bg: hoverBg }}
      transition="all 0.3s"
      position="relative"
    >
      <Box
        as={Link}
        to={`${URLs.vendorProfile.url}?id=${vendor.id}`}
        h="200px"
        bg="gray.100"
        position="relative"
        display="block"
      >
        <Badge 
          position="absolute" 
          top={2} 
          right={2} 
          colorScheme={vendor.isOrganizer ? 'purple' : 'blue'}
        >
          {vendor.isOrganizer ? 'Организатор' : 'Подрядчик'}
        </Badge>
        <Tooltip label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}>
          <IconButton
            aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
            position="absolute"
            top={2}
            left={2}
            size="sm"
            bg="white"
            _hover={{ bg: 'gray.100' }}
            onClick={handleFavoriteClick}
            zIndex={1}
          />
        </Tooltip>
      </Box>
      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          <VStack align="start" spacing={1}>
            <Heading size="md" as={Link} to={`${URLs.vendorProfile.url}?id=${vendor.id}`}>
              {vendor.companyName}
            </Heading>
            <HStack fontSize="sm" color="gray.600">
              <FaMapMarkerAlt />
              <Text>{vendor.city}</Text>
            </HStack>
          </VStack>
          
          <HStack justify="space-between">
            <HStack>
              <AiFillStar color="#f6ad55" />
              <Text fontWeight="bold">{vendor.rating}</Text>
              <Text fontSize="sm" color="gray.600">({vendor.reviewsCount})</Text>
            </HStack>
            {vendor.contactPerson && (
              <Text fontSize="sm" color="gray.600">{vendor.contactPerson}</Text>
            )}
          </HStack>
          
          <Button 
            size="sm" 
            colorScheme="pink" 
            width="100%"
            as={Link}
            to={`${URLs.vendorProfile.url}?id=${vendor.id}`}
          >
            Посмотреть услуги
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}

const CatalogPage = () => {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'reviews'>('rating')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  const currentUserId = 1 // TODO: получать из авторизации
  
  const { data: vendors = [], isLoading, error } = useGetVendorsQuery({
    city: city && city !== 'Все города' ? city : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
  })
  
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId)
  const [addFavorite] = useAddFavoriteMutation()
  const [removeFavorite] = useRemoveFavoriteMutation()
  
  const favoriteIds = favorites.map((v: any) => v.id)
  
  const toggleFavorite = async (vendorId: number) => {
    try {
      if (favoriteIds.includes(vendorId)) {
        await removeFavorite({ userId: currentUserId, vendorId }).unwrap()
      } else {
        await addFavorite({ userId: currentUserId, vendorId }).unwrap()
      }
    } catch (error) {
    }
  }

  const filtered = useMemo(() => {
    let filtered = [...vendors]
    
    // Фильтр по избранным
    if (showFavoritesOnly) {
      filtered = filtered.filter(v => favoriteIds.includes(v.id))
    }
    
    if (search) {
      filtered = filtered.filter(v => 
        v.companyName.toLowerCase().includes(search.toLowerCase()) ||
        v.contactPerson?.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'reviews':
          return b.reviewsCount - a.reviewsCount
        case 'name':
          return a.companyName.localeCompare(b.companyName)
        default:
          return 0
      }
    })
    
    return filtered
  }, [vendors, search, sortBy, showFavoritesOnly, favoriteIds])
  
  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text color="red.500">Ошибка загрузки данных</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>Каталог подрядчиков</Heading>
      <Grid templateColumns={{ base: '1fr', md: '280px 1fr' }} gap={6}>
        <GridItem>
          <Stack borderWidth="1px" borderRadius="md" p={4} spacing={4} position="sticky" top="80px">
            <Heading size="sm">Фильтры</Heading>
            <Input 
              placeholder="Поиск..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select 
              placeholder="Город" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
            >
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select 
              placeholder="Категория" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select 
              placeholder="Рейтинг от" 
              value={minRating} 
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="">Любой</option>
              <option value="4.5">4.5+</option>
              <option value="4.0">4.0+</option>
              <option value="3.5">3.5+</option>
            </Select>
            <Select 
              placeholder="Сортировка" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="rating">По рейтингу</option>
              <option value="reviews">По отзывам</option>
              <option value="name">По названию</option>
            </Select>
            <Button 
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              colorScheme={showFavoritesOnly ? 'pink' : 'gray'}
              variant={showFavoritesOnly ? 'solid' : 'outline'}
              size="sm"
              leftIcon={<FaHeart />}
            >
              {showFavoritesOnly ? 'Показать все' : 'Только избранные'}
            </Button>
            <Button 
              onClick={() => {
                setSearch('')
                setCity('')
                setCategory('')
                setMinRating('')
                setSortBy('rating')
                setShowFavoritesOnly(false)
              }}
              variant="outline"
              size="sm"
            >
              Сбросить
            </Button>
          </Stack>
        </GridItem>
        <GridItem>
          {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Box key={i} borderWidth="1px" borderRadius="md" overflow="hidden">
                  <Skeleton height="200px" />
                <Box p={4}>
                    <Skeleton height="20px" mb={2} />
                    <SkeletonText mt={4} noOfLines={2} spacing={2} />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
          ) : (
            <>
              <Text mb={4} color="gray.600">
                Найдено подрядчиков: {filtered.length}
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filtered.map(vendor => (
                  <VendorCard 
                    key={vendor.id} 
                    vendor={vendor}
                    isFavorite={favoriteIds.includes(vendor.id)}
                    onToggleFavorite={() => toggleFavorite(vendor.id)}
                  />
                ))}
              </SimpleGrid>
              {filtered.length === 0 && (
                <Box textAlign="center" py={10}>
                  <Text color="gray.500">Подрядчики не найдены</Text>
                </Box>
              )}
            </>
          )}
        </GridItem>
      </Grid>
    </Container>
  )
}

export default CatalogPage
