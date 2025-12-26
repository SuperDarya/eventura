import React from 'react'
import { Card, CardBody, VStack, HStack, Heading, Text, Badge, IconButton, Tooltip } from '@chakra-ui/react'
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai'

interface ServiceCardProps {
  service: {
    id: number
    name: string
    category: string
    description?: string
    priceMin: number
    priceMax: number
    unit?: string
    duration?: number
  }
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export const ServiceCard = ({
  service,
  onEdit,
  onDelete,
  showActions = false,
}: ServiceCardProps) => {
  return (
    <Card
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      transition="all 0.2s"
      h="100%"
    >
      <CardBody>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm" flex={1}>
              {service.name}
            </Heading>
            {showActions && (
              <HStack>
                {onEdit && (
                  <Tooltip label="Редактировать">
                    <IconButton
                      aria-label="Редактировать"
                      icon={<AiOutlineEdit />}
                      size="sm"
                      variant="ghost"
                      onClick={onEdit}
                    />
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip label="Удалить">
                    <IconButton
                      aria-label="Удалить"
                      icon={<AiOutlineDelete />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={onDelete}
                    />
                  </Tooltip>
                )}
              </HStack>
            )}
          </HStack>
          <Badge colorScheme="blue" w="fit-content">
            {service.category}
          </Badge>
          {service.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {service.description}
            </Text>
          )}
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color="brand.400">
              {service.priceMin.toLocaleString()} - {service.priceMax.toLocaleString()} ₽
            </Text>
            {(service.unit || service.duration) && (
              <Text fontSize="sm" color="gray.600">
                {service.unit} {service.duration && `• ${service.duration} мин`}
              </Text>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  )
}

