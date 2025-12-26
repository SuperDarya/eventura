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
import { useNavigate } from 'react-router-dom'
import { FaHeart } from 'react-icons/fa'
import { useGetVendorsQuery, useGetFavoritesQuery, useAddFavoriteMutation, useRemoveFavoriteMutation } from '../__data__/api'
import { URLs } from '../__data__/urls'
import { useAppSelector } from '../__data__/store'
import { useToast } from '../hooks/useToast'
import { VendorCard } from '../components/ui'

const cities = ['Все города', 'Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород']
const categories = ['Все категории', 'Кейтеринг', 'Фото и видео', 'Декор', 'Развлечения', 'Площадки', 'Транспорт']

const CatalogVendorCard = ({ vendor, isFavorite, onToggleFavorite }: { vendor: any; isFavorite: boolean; onToggleFavorite: () => void }) => {
  const navigate = useNavigate()
  
  const handleChatClick = () => {
    navigate(URLs.messenger.makeChatUrl(vendor.id))
  }
  
  return (
    <VendorCard
      vendor={vendor}
      isFavorite={isFavorite}
      onToggleFavorite={onToggleFavorite}
      onChatClick={handleChatClick}
    />
  )
}

const CatalogPage = () => {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'reviews'>('rating')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  
  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id
  
  const { data: vendors = [], isLoading, error } = useGetVendorsQuery({
    city: city && city !== 'Все города' ? city : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
  })
  
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId || 0, { skip: !currentUserId })
  const [addFavorite] = useAddFavoriteMutation()
  const [removeFavorite] = useRemoveFavoriteMutation()
  const { showError, showSuccess } = useToast()
  
  const favoriteIds = favorites.map((v: any) => v.id)
  
  const toggleFavorite = async (vendorId: number) => {
    if (!currentUserId) {
      showError('Требуется авторизация', 'Необходимо войти в систему для добавления в избранное')
      return
    }
    
    try {
      if (favoriteIds.includes(vendorId)) {
        await removeFavorite({ userId: currentUserId, vendorId }).unwrap()
        showSuccess('Удалено из избранного')
      } else {
        await addFavorite({ userId: currentUserId, vendorId }).unwrap()
        showSuccess('Добавлено в избранное')
      }
    } catch (error) {
      showError('Ошибка', 'Не удалось обновить избранное')
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
              colorScheme={showFavoritesOnly ? 'brand' : 'gray'}
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
                  <CatalogVendorCard 
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
