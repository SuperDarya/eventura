import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  HStack,
  Avatar,
  Text,
  Input,
  Button,
  IconButton,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Heading,
  Badge
} from '@chakra-ui/react'
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa'
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesAsReadMutation,
  useGetUserQuery
} from '../../__data__/api'
import { URLs } from '../../__data__/urls'
import { useAppSelector } from '../../__data__/store'

const ChatPage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const otherUserId = parseInt(userId || '0')
  
  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id || 1

  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const bg = useColorModeValue('white', 'gray.800')
  const messageBg = useColorModeValue('gray.100', 'gray.700')
  const myMessageBg = useColorModeValue('pink.100', 'pink.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const { data: messages = [], isLoading, refetch } = useGetMessagesQuery(
    { userId1: currentUserId, userId2: otherUserId },
    { skip: !otherUserId }
  )
  
  const { data: otherUser } = useGetUserQuery(otherUserId, { skip: !otherUserId })
  const [sendMessage] = useSendMessageMutation()
  const [markAsRead] = useMarkMessagesAsReadMutation()

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (otherUserId && currentUserId) {
      markAsRead({ userId1: currentUserId, userId2: otherUserId })
    }
  }, [otherUserId, currentUserId, markAsRead])

  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000)
    return () => clearInterval(interval)
  }, [refetch])

  const handleSend = async () => {
    if (!messageText.trim() || !otherUserId) return

    try {
      await sendMessage({
        senderId: currentUserId,
        receiverId: otherUserId,
        text: messageText.trim()
      }).unwrap()
      setMessageText('')
      refetch()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!otherUserId) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>Пользователь не найден</Text>
      </Container>
    )
  }

  const otherUserName = otherUser?.companyName || 
    (otherUser?.firstName && otherUser?.lastName 
      ? `${otherUser.firstName} ${otherUser.lastName}`.trim()
      : otherUser?.email || `Пользователь #${otherUserId}`)

  return (
    <Container maxW="container.lg" py={0} h="calc(100vh - 100px)" display="flex" flexDirection="column">
      <Box
        bg={bg}
        borderBottomWidth="1px"
        borderColor={borderColor}
        p={4}
        position="sticky"
        top={0}
        zIndex={1}
      >
        <HStack spacing={4}>
          <IconButton
            aria-label="Назад"
            icon={<FaArrowLeft />}
            onClick={() => navigate(URLs.messenger.url)}
            variant="ghost"
          />
          <Avatar
            name={otherUserName}
            src={otherUser?.avatar}
            size="sm"
          />
          <VStack align="start" spacing={0} flex={1}>
            <Heading size="sm">{otherUserName}</Heading>
            {otherUser && (
              <Text fontSize="xs" color="gray.500">
                {otherUser.city}
              </Text>
            )}
          </VStack>
        </HStack>
      </Box>

      <Box
        flex={1}
        overflowY="auto"
        p={4}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        {isLoading ? (
          <VStack spacing={4} align="stretch">
            <Skeleton height="60px" />
            <Skeleton height="60px" />
            <Skeleton height="60px" />
          </VStack>
        ) : messages.length === 0 ? (
          <VStack spacing={4} py={8}>
            <Text color="gray.500">Начните общение</Text>
          </VStack>
        ) : (
          <VStack spacing={3} align="stretch">
            {messages.map((message) => {
              const isMyMessage = message.senderId === currentUserId
              return (
                <HStack
                  key={message.id}
                  justify={isMyMessage ? 'flex-end' : 'flex-start'}
                  align="flex-end"
                  spacing={2}
                >
                  {!isMyMessage && (
                    <Avatar
                      name={otherUserName}
                      src={otherUser?.avatar}
                      size="xs"
                    />
                  )}
                  <VStack
                    align={isMyMessage ? 'flex-end' : 'flex-start'}
                    spacing={1}
                    maxW="70%"
                  >
                    <Box
                      bg={isMyMessage ? myMessageBg : messageBg}
                      px={4}
                      py={2}
                      borderRadius="lg"
                      borderTopLeftRadius={isMyMessage ? 'lg' : 'sm'}
                      borderTopRightRadius={isMyMessage ? 'sm' : 'lg'}
                    >
                      <Text fontSize="sm">{message.text}</Text>
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </VStack>
                  {isMyMessage && (
                    <Avatar
                      name={currentUser?.firstName || 'Вы'}
                      size="xs"
                    />
                  )}
                </HStack>
              )
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      <Box
        bg={bg}
        borderTopWidth="1px"
        borderColor={borderColor}
        p={4}
        position="sticky"
        bottom={0}
      >
        <HStack spacing={2}>
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            size="md"
          />
          <IconButton
            aria-label="Отправить"
            icon={<FaPaperPlane />}
            colorScheme="pink"
            onClick={handleSend}
            isDisabled={!messageText.trim()}
          />
        </HStack>
      </Box>
    </Container>
  )
}

export default ChatPage

