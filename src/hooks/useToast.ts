import { useToast as useChakraToast } from '@chakra-ui/react'

export const useToast = () => {
  const toast = useChakraToast()

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const showInfo = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    })
  }

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      status: 'warning',
      duration: 4000,
      isClosable: true,
      position: 'top-right',
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    toast,
  }
}

