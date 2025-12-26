import React from 'react'
import { Box, VStack, Text, Button, Icon, Heading } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface EmptyStateProps {
  icon?: IconType
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  actionLabel,
  onAction,
  size = 'md',
}: EmptyStateProps) => {
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 48 : 64
  const headingSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'

  return (
    <Box textAlign="center" py={size === 'sm' ? 8 : size === 'md' ? 12 : 16}>
      <VStack spacing={4}>
        {IconComponent && (
          <Icon
            as={IconComponent}
            boxSize={iconSize}
            color="gray.400"
            opacity={0.6}
          />
        )}
        <Heading size={headingSize} color="gray.600">
          {title}
        </Heading>
        {description && (
          <Text color="gray.500" maxW="md" mx="auto">
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <Button colorScheme="brand" onClick={onAction} mt={2}>
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  )
}

