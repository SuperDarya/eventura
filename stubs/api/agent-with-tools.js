const { GigaChat } = require("langchain-gigachat")
const { Agent } = require('node:https')
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { HumanMessage } = require('@langchain/core/messages')
const { DynamicStructuredTool } = require('@langchain/core/tools')
const { z } = require('zod')
const { v4: uuid  } = require('uuid')
const express = require('express')
const { MemorySaver } = require('@langchain/langgraph')
const { GIGA_AUTH } = require('./config')

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const giga = new GigaChat({
  credentials: GIGA_AUTH,
  model: 'GigaChat-2',
  httpsAgent
})

const checkpointer = new MemorySaver()

const bookingDataSchema = z.object({
  shouldBook: z.boolean().describe('Должно быть true, если пользователь хочет забронировать'),
  eventType: z.string().describe('Тип мероприятия (например, "День рождения", "Свадьба")').optional(),
  date: z.string().describe('Дата мероприятия в формате YYYY-MM-DD').optional(),
  guestsCount: z.string().describe('Количество гостей').optional(),
  budget: z.string().describe('Бюджет мероприятия в рублях').optional(),
  city: z.string().describe('Город проведения мероприятия').optional(),
  description: z.string().describe('Описание мероприятия, тематика').optional(),
  dishes: z.string().describe('Пожелания по еде/блюдам').optional(),
  otherDetails: z.string().describe('Дополнительные детали').optional(),
})

const extractBookingDataTool = new DynamicStructuredTool({
  name: 'extract_booking_data',
  description: `ИСПОЛЬЗУЙ ЭТОТ ИНСТРУМЕНТ когда пользователь просит забронировать или оформить мероприятие.
  
  Когда использовать:
  - Пользователь говорит: "бронируй", "забронируй", "забронировать", "оформить", "просто забронируй", "давай забронируем"
  - Даже если это одно слово "забронируй" - используй инструмент СРАЗУ
  - НЕ спрашивай уточняющие вопросы - используй инструмент с данными из контекста
  - Если какая-то информация отсутствует, передай пустую строку ""
  
  Что делать:
  1. Собери ВСЮ информацию из всего контекста разговора
  2. Извлеки: тип мероприятия, количество гостей, бюджет, город, дату, тематику
  3. Вызови инструмент с собранными данными
  
  НЕ используй для:
  - Вопросов "какие тематики популярны", "придумай активности"
  - Просьб дать совет
  - Обсуждения без запроса на бронирование`,
  schema: bookingDataSchema,
  func: async (input) => {
    return JSON.stringify(input)
  }
})

const agent = createReactAgent({
  llm: giga,
  tools: [extractBookingDataTool],
  prompt: `Ты — ИИ-консультант платформы Eventura, которая помогает организовать мероприятия (свадьбы, дни рождения, корпоративы и т.д.).

Твоя роль:
- Помогать пользователям с организацией мероприятий
- Давать советы по планированию, тематикам, развлечениям, еде
- Подбирать подрядчиков и услуги
- Отвечать на вопросы о платформе Eventura

Будь дружелюбным, профессиональным и полезным.

КРИТИЧЕСКИ ВАЖНО - ПРАВИЛА ИСПОЛЬЗОВАНИЯ ИНСТРУМЕНТОВ:

1. ЗАПОМИНАНИЕ ИНФОРМАЦИИ:
   - ВСЕГДА запоминай информацию о мероприятии из разговора (тип, количество гостей, бюджет, город, дату, тематику)
   - Храни эту информацию в памяти для использования при бронировании

2. ОБЫЧНЫЕ ВОПРОСЫ (БЕЗ ИНСТРУМЕНТОВ):
   - Когда пользователь спрашивает "какие тематики популярны", "придумай активности", "скажи варианты"
   - Отвечай ОБЫЧНЫМ ТЕКСТОМ, НЕ используй инструменты
   - Будь полезным и развернутым

3. ЗАПРОС НА БРОНИРОВАНИЕ (ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ ИНСТРУМЕНТ):
   - Когда пользователь говорит: "бронируй", "забронируй", "забронировать", "оформить", "просто забронируй"
   - НЕМЕДЛЕННО используй инструмент extract_booking_data
   - НЕ спрашивай уточняющие вопросы
   - НЕ говори "уточните детали" или "не могу забронировать"
   - Собери ВСЮ информацию из контекста разговора и передай в инструмент
   - Если информация отсутствует, передай пустую строку "" - это нормально

ПРИМЕРЫ:

Пользователь: "День рождения на 8 человек, бюджет 20 тысяч, тематика Пираты"
Ответ: "Отлично! Для дня рождения на 8 человек в тематике Пираты Карибского моря с бюджетом 20 тысяч рублей вам понадобятся услуги по декору, кейтерингу и развлечениям. В каком городе планируется мероприятие? Есть ли уже дата?" (ОБЫЧНЫЙ ТЕКСТ)

Пользователь: "Какие тематики популярны?"
Ответ: "Вот популярные тематики для дней рождения среди подростков: супергерои, фэнтези, видеоигры, спорт..." (ОБЫЧНЫЙ ТЕКСТ)

Пользователь: "Придумай активности для тематики видеоигры на 8 человек"
Ответ: "Для тематики видеоигры можно организовать следующие активности: квест-комната, турниры по играм, мастер-классы по созданию персонажей..." (ОБЫЧНЫЙ ТЕКСТ)

Пользователь: "забронируй день рождение на 15 человек в Казани завтра в тематике видеоигры"
Ответ: [ИСПОЛЬЗУЙ extract_booking_data с данными: eventType="День рождения", guestsCount="15", city="Казань", date="завтра", description="Видеоигры"]

Пользователь: "забронируй"
Ответ: [ИСПОЛЬЗУЙ extract_booking_data СРАЗУ! Собери всю информацию из предыдущего контекста разговора и передай в инструмент. НЕ спрашивай вопросы!]
  `,
  checkpointer: checkpointer
})

const call = async (message, sessionId) => {
  const response = await agent.invoke({
    messages: [new HumanMessage(message)]
  }, { configurable: { thread_id: sessionId } })

  return response
}

const processDate = (dateStr) => {
  if (!dateStr || dateStr.trim() === '') return '';
  
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateStr;
  }
  
  const lowerDate = dateStr.toLowerCase();
  const today = new Date();
  let targetDate = new Date(today);
  
  if (lowerDate.includes('завтра')) {
    targetDate.setDate(today.getDate() + 1);
  } else if (lowerDate.includes('через два дня') || lowerDate.includes('через 2 дня')) {
    targetDate.setDate(today.getDate() + 2);
  } else if (lowerDate.includes('через неделю') || lowerDate.includes('через 7 дней')) {
    targetDate.setDate(today.getDate() + 7);
  } else {
    targetDate = new Date(dateStr);
  }
  
  if (!isNaN(targetDate.getTime())) {
    return targetDate.toISOString().split('T')[0];
  }
  
  return dateStr;
}

const processBudget = (budgetStr) => {
  if (!budgetStr || budgetStr.trim() === '') return '';
  
  const budgetLower = budgetStr.toString().toLowerCase();
  
  // Обработка "до 10000", "до 10 тысяч" и т.д.
  const upToMatch = budgetLower.match(/до\s*(\d+)/);
  if (upToMatch) {
    let num = parseInt(upToMatch[1]);
    if (budgetLower.includes('тысяч') || budgetLower.includes('тыс') || budgetLower.includes('к')) {
      if (num < 1000) {
        num = num * 1000;
      }
    }
    return num.toString();
  }
  
  // Обработка "10к", "10 к"
  const kMatch = budgetLower.match(/(\d+)\s*к/);
  if (kMatch) {
    return (parseInt(kMatch[1]) * 1000).toString();
  }
  
  // Обработка обычных чисел
  const budgetMatch = budgetLower.match(/\d+/);
  if (budgetMatch) {
    let num = parseInt(budgetMatch[0]);
    if (num < 1000 && (budgetLower.includes('тысяч') || budgetLower.includes('тыс'))) {
      num = num * 1000;
    }
    return num.toString();
  }
  
  return budgetStr;
}

const agentRouter = express.Router()

agentRouter.post('/prompt', async (req, res) => {
  try {
    const { message, sessionId = uuid() } = req.body

    const answer = await call(message, sessionId)
    const messages = answer.messages || []
    const lastMessage = messages[messages.length - 1]
    
    let aiResponse = '';
    let bookingData = null;
    
    if (lastMessage) {
      if (lastMessage.content) {
        aiResponse = typeof lastMessage.content === 'string' 
          ? lastMessage.content 
          : lastMessage.content.toString();
      }
      
      if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
        for (const toolCall of lastMessage.tool_calls) {
          if (toolCall.name === 'extract_booking_data' && toolCall.args) {
            try {
              const parsed = typeof toolCall.args === 'string' 
                ? JSON.parse(toolCall.args) 
                : toolCall.args;
              
              bookingData = {
                shouldBook: parsed.shouldBook === true,
                eventType: parsed.eventType || '',
                date: processDate(parsed.date || ''),
                guestsCount: parsed.guestsCount || '',
                budget: processBudget(parsed.budget || ''),
                city: parsed.city || '',
                description: parsed.description || '',
                dishes: parsed.dishes || '',
                otherDetails: parsed.otherDetails || ''
              };
            } catch (error) {
            }
          }
        }
      }
    }

    if (bookingData && !aiResponse.trim()) {
      aiResponse = 'Хорошо, перехожу к оформлению бронирования.';
    }

    res.send({
      message: aiResponse,
      sessionId: sessionId,
      bookingData: bookingData
    })
  } catch (error) {
    res.status(500).json({
      error: 'Ошибка при обработке запроса',
      message: error.message
    });
  }
})

module.exports = {
  agentRouter
}
