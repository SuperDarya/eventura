import React from 'react'
import { Box, Spinner, VStack, Text } from '@chakra-ui/react'

interface LoaderProps {
  message?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Loader = ({ message, size = 'lg' }: LoaderProps) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="100px"
      py={8}
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="pink.400"
          size={size}
        />
        {message && (
          <Text color="gray.600" fontSize="sm">
            {message}
          </Text>
        )}
      </VStack>
    </Box>
  )
}

export default Loader