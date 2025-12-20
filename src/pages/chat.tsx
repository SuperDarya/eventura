import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  HStack, 
  Input, 
  Stack, 
  Text, 
  VStack, 
  Badge,
  Spinner,
  useColorModeValue
} from '@chakra-ui/react'
import { useAppDispatch } from '../__data__/store'
import { setFormData } from '../__data__/bookingFormSlice'
import { URLs } from '../__data__/urls'
import { useAgentPromptMutation, BookingData } from '../__data__/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const ChatPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [agentPrompt, { isLoading: isAgentLoading }] = useAgentPromptMutation()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Здравствуйте! Я ИИ-консультант Eventura. Помогу вам с организацией мероприятия. Чем могу помочь?' }
  ])
  const [text, setText] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const bgUser = useColorModeValue('blue.50', 'blue.900')
  const bgAssistant = useColorModeValue('gray.50', 'gray.800')
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const send = async () => {
    if (!text.trim() || isAgentLoading) return
    
    const userMessage = text.trim()
    setText('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    
    try {
      const data = await agentPrompt({
        message: userMessage,
        sessionId: sessionId || undefined
      }).unwrap()
      
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId)
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message || 'Извините, произошла ошибка' }])
      
      if (data.bookingData && data.bookingData.shouldBook) {
        const bookingData: BookingData = data.bookingData
        
        let description = bookingData.description || ''
        if (bookingData.dishes) {
          description += (description ? '\n\n' : '') + `Пожелания по меню: ${bookingData.dishes}`
        }
        if (bookingData.otherDetails) {
          description += (description ? '\n\n' : '') + `Дополнительные детали: ${bookingData.otherDetails}`
        }
        
        dispatch(setFormData({
          eventType: bookingData.eventType || '',
          date: bookingData.date || '',
          guestsCount: bookingData.guestsCount || '',
          budget: bookingData.budget || '',
          city: bookingData.city || '',
          description: description,
          selectedVendors: []
        }))
        
        setTimeout(() => {
          navigate(URLs.booking.url)
        }, 500)
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Извините, произошла ошибка при обработке запроса. Попробуйте еще раз.' 
      }])
    }
  }
  
  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={6}>ИИ-Консультант Eventura</Heading>
      <VStack align="stretch" spacing={4}>
        <Box 
          borderWidth="1px" 
          borderRadius="md" 
          p={4} 
          minH="500px" 
          maxH="600px"
          overflowY="auto"
          bg={useColorModeValue('white', 'gray.800')}
        >
          <Stack spacing={3}>
            {messages.map((m, i) => (
              <HStack 
                key={i} 
                align="start" 
                justify={m.role === 'user' ? 'flex-end' : 'flex-start'}
                spacing={2}
              >
                {m.role === 'assistant' && (
                  <Badge colorScheme="purple" alignSelf="center">AI</Badge>
                )}
                <Box 
                  bg={m.role === 'user' ? bgUser : bgAssistant} 
                  borderRadius="md" 
                  p={3} 
                  maxW="80%"
                  wordBreak="break-word"
                >
                  <Text whiteSpace="pre-wrap">{m.content}</Text>
                </Box>
                {m.role === 'user' && (
                  <Badge colorScheme="blue" alignSelf="center">Вы</Badge>
                )}
              </HStack>
            ))}
            {isAgentLoading && (
              <HStack align="start" spacing={2}>
                <Badge colorScheme="purple">AI</Badge>
                <Box bg={bgAssistant} borderRadius="md" p={3}>
                  <HStack>
                    <Spinner size="sm" />
                    <Text>Думаю...</Text>
                  </HStack>
                </Box>
              </HStack>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>
        <HStack>
          <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Задайте вопрос о мероприятиях, подрядчиках, услугах..." 
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            isDisabled={isAgentLoading}
          />
          <Button 
            colorScheme="pink" 
            onClick={send}
            isLoading={isAgentLoading}
            loadingText="Отправка..."
          >
            Отправить
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
}

export default ChatPage
