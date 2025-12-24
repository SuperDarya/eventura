import React from 'react'
import { Alert, AlertIcon, AlertTitle, AlertDescription, Button, VStack } from '@chakra-ui/react'

interface ErrorStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const ErrorState = ({
  title = 'Произошла ошибка',
  description,
  actionLabel,
  onAction,
}: ErrorStateProps) => {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      borderRadius="lg"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        {title}
      </AlertTitle>
      {description && <AlertDescription maxWidth="sm">{description}</AlertDescription>}
      {actionLabel && onAction && (
        <Button colorScheme="red" size="sm" mt={4} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Alert>
  )
}

