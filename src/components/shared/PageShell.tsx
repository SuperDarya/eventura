import React from 'react'
import { Box, Container, ContainerProps } from '@chakra-ui/react'

interface PageShellProps extends ContainerProps {
  children: React.ReactNode
}

export const PageShell = ({ children, ...props }: PageShellProps) => {
  return (
    <Box pt={{ base: '80px', md: '100px' }} minH="calc(100vh - 80px)">
      <Container maxW="container.xl" py={8} {...props}>
        {children}
      </Container>
    </Box>
  )
}

