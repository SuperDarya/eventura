import React from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { AiFillStar } from 'react-icons/ai'
import { FaMapMarkerAlt, FaHeart, FaRegHeart, FaComments } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { URLs } from '../../__data__/urls'

interface VendorCardProps {
  vendor: {
    id: number
    companyName: string
    city?: string
    rating?: number
    reviewsCount?: number
    contactPerson?: string
    isOrganizer?: boolean
  }
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onChatClick?: () => void
  showActions?: boolean
  variant?: 'default' | 'compact'
}

export const VendorCard = ({
  vendor,
  isFavorite = false,
  onToggleFavorite,
  onChatClick,
  showActions = true,
  variant = 'default',
}: VendorCardProps) => {
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.()
  }

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChatClick?.()
  }

  return (
    <Card
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      bg={bg}
      _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg', bg: hoverBg }}
      transition="all 0.3s"
      position="relative"
      h="100%"
    >
      <Box
        as={Link}
        to={`${URLs.vendorProfile.url}?id=${vendor.id}`}
        h={variant === 'compact' ? '150px' : '200px'}
        bg="gray.100"
        position="relative"
        display="block"
        _hover={{ textDecoration: 'none' }}
      >
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={vendor.isOrganizer ? 'purple' : 'blue'}
          borderRadius="full"
          px={2}
          py={1}
        >
          {vendor.isOrganizer ? 'Организатор' : 'Подрядчик'}
        </Badge>
        {showActions && (
          <HStack position="absolute" top={2} left={2} spacing={1} zIndex={1}>
            {onChatClick && (
              <Tooltip label="Написать сообщение">
                <IconButton
                  aria-label="Написать сообщение"
                  icon={<FaComments />}
                  size="sm"
                  bg="white"
                  _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
                  onClick={handleChatClick}
                />
              </Tooltip>
            )}
            {onToggleFavorite && (
              <Tooltip label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}>
                <IconButton
                  aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                  icon={isFavorite ? <FaHeart color="red" /> : <FaRegHeart />}
                  size="sm"
                  bg="white"
                  _hover={{ bg: 'gray.100', transform: 'scale(1.1)' }}
                  onClick={handleFavoriteClick}
                />
              </Tooltip>
            )}
          </HStack>
        )}
      </Box>
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <VStack align="start" spacing={1}>
            <Heading
              size="md"
              as={Link}
              to={`${URLs.vendorProfile.url}?id=${vendor.id}`}
              _hover={{ color: 'brand.400' }}
            >
              {vendor.companyName}
            </Heading>
            {vendor.city && (
              <HStack fontSize="sm" color="gray.600">
                <FaMapMarkerAlt />
                <Text>{vendor.city}</Text>
              </HStack>
            )}
          </VStack>

          <HStack justify="space-between">
            {vendor.rating !== undefined && (
              <HStack>
                <AiFillStar color="#f6ad55" />
                <Text fontWeight="bold">{vendor.rating}</Text>
                {vendor.reviewsCount !== undefined && (
                  <Text fontSize="sm" color="gray.600">
                    ({vendor.reviewsCount})
                  </Text>
                )}
              </HStack>
            )}
            {vendor.contactPerson && (
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {vendor.contactPerson}
              </Text>
            )}
          </HStack>

          <Button
            size="sm"
            colorScheme="brand"
            width="100%"
            as={Link}
            to={`${URLs.vendorProfile.url}?id=${vendor.id}`}
            _hover={{ textDecoration: 'none' }}
          >
            Посмотреть услуги
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}

