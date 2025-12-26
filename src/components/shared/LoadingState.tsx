import React from 'react'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
}

export const LoadingState = ({
  message = 'Загрузка...',
  size = 'lg',
  fullScreen = false,
}: LoadingStateProps) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : size === 'lg' ? 'lg' : 'xl'

  const content = (
    <VStack spacing={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.400"
        size={spinnerSize}
      />
      {message && (
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      )}
    </VStack>
  )

  if (fullScreen) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="calc(100vh - 200px)"
      >
        {content}
      </Box>
    )
  }

  return (
    <Box py={8} display="flex" alignItems="center" justifyContent="center">
      {content}
    </Box>
  )
}

