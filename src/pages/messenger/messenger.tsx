import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Avatar,
  Text,
  Badge,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  IconButton,
  Tooltip
} from '@chakra-ui/react'
import { FaPlus, FaComments } from 'react-icons/fa'
import { useGetChatsQuery, useGetFavoritesQuery } from '../../__data__/api'
import { URLs } from '../../__data__/urls'
import { useAppSelector } from '../../__data__/store'

const MessengerPage = () => {
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id

  const { data: chats = [], isLoading: isLoadingChats, refetch } = useGetChatsQuery(currentUserId || 0, { skip: !currentUserId })
  const { data: favorites = [] } = useGetFavoritesQuery(currentUserId || 0, { skip: !currentUserId })

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleAddChat = () => {
    navigate(URLs.catalog.url)
  }

  const handleChatClick = (otherUserId: number) => {
    navigate(URLs.messenger.makeChatUrl(otherUserId))
  }

  if (isLoadingChats) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="60px" />
          <Skeleton height="100px" />
          <Skeleton height="100px" />
        </VStack>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Сообщения</Heading>
        <Tooltip label="Начать новый чат с избранным подрядчиком">
          <Button
            leftIcon={<FaPlus />}
            colorScheme="pink"
            onClick={handleAddChat}
          >
            Новый чат
          </Button>
        </Tooltip>
      </HStack>

      {chats.length === 0 ? (
        <Card bg={bg}>
          <CardBody>
            <VStack spacing={4} py={8}>
              <FaComments size={48} color="gray" />
              <Text color="gray.500" fontSize="lg">
                У вас пока нет сообщений
              </Text>
              <Text color="gray.500" fontSize="sm">
                Начните общение с подрядчиком из каталога
              </Text>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="pink"
                onClick={handleAddChat}
              >
                Перейти в каталог
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={2} align="stretch">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              bg={bg}
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{ bg: hoverBg, cursor: 'pointer' }}
              onClick={() => handleChatClick(chat.otherUser.id)}
            >
              <CardBody>
                <HStack spacing={4}>
                  <Avatar
                    name={chat.otherUser.name}
                    src={chat.otherUser.avatar}
                    size="md"
                  />
                  <VStack align="start" flex={1} spacing={1}>
                    <HStack justify="space-between" w="100%">
                      <Text fontWeight="bold" fontSize="md">
                        {chat.otherUser.name}
                      </Text>
                      {chat.lastMessage && (
                        <Text fontSize="xs" color="gray.500">
                          {new Date(chat.lastMessage.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      )}
                    </HStack>
                    <HStack justify="space-between" w="100%">
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        noOfLines={1}
                        flex={1}
                      >
                        {chat.lastMessage?.text || 'Нет сообщений'}
                      </Text>
                      {chat.unreadCount > 0 && (
                        <Badge colorScheme="pink" borderRadius="full">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Container>
  )
}

export default MessengerPage

