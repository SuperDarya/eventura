require('dotenv').config({
  path: '../../.env',
})
const { GigaChat } = require("langchain-gigachat")
const { Agent } = require('node:https')
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { HumanMessage } = require('@langchain/core/messages')
const { v4: uuid  } = require('uuid')
const express = require('express')
const { MemorySaver } = require('@langchain/langgraph')

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const giga = new GigaChat({
  credentials: process.env.GIGA_AUTH,
  model: 'GigaChat-2',
  httpsAgent
})

const checkpointer = new MemorySaver()

const agent = createReactAgent({
  llm: giga,
  tools: [],
  prompt: `Ты — ИИ-консультант платформы Eventura, которая помогает организовать мероприятия (свадьбы, дни рождения, корпоративы и т.д.).

Твоя роль:
- Помогать пользователям с организацией мероприятий
- Подбирать подрядчиков и услуги
- Давать советы по планированию, тематикам, развлечениям, еде
- Отвечать на вопросы о платформе Eventura

Будь дружелюбным, профессиональным и полезным.

КРИТИЧЕСКИ ВАЖНО: 
- ВСЕГДА запоминай ВСЮ информацию о мероприятии из ВСЕГО контекста разговора (тип, количество гостей, бюджет, город, дату, тематику, описание)
- Отвечай на вопросы пользователя развернуто и полезно (например: "какие тематики популярны", "придумай активности")
- Когда пользователь ЯВНО хочет забронировать (фразы: "забронируй", "забронировать", "оформить", "хочу забронировать", "бронируй", "перейди к оформлению", "оформи", "указал", "указал всё"):
  * Проанализируй ВСЮ историю разговора и собери ВСЮ информацию о мероприятии
  * Верни ТОЛЬКО JSON объект (без текста до или после, без markdown, без объяснений):
    {"shouldBook":true,"eventType":"День рождения","date":"","guestsCount":"8","budget":"50000","city":"Казань","description":"Полицейские с Рублёвки","dishes":"","otherDetails":""}
  * Если информация не обсуждалась, оставь поле пустым строкой ""
  * JSON должен начинаться с { и заканчиваться }
  * НЕ добавляй текст до или после JSON
  * НЕ используй markdown блоки

Примеры:
Пользователь: "День рождения на 8 человек, бюджет 20 тысяч, тематика Пираты"
Ответ: "Отлично! Для дня рождения на 8 человек в тематике Пираты Карибского моря с бюджетом 20 тысяч рублей вам понадобятся услуги по декору, кейтерингу и развлечениям. В каком городе планируется мероприятие? Есть ли уже дата?"

Пользователь: "Какие тематики популярны?"
Ответ: "Вот популярные тематики для дней рождения..." (НОРМАЛЬНЫЙ ОТВЕТ БЕЗ JSON)

Пользователь: "Придумай активности для тематики супергерои"
Ответ: "Для тематики супергерои можно организовать..." (НОРМАЛЬНЫЙ ОТВЕТ БЕЗ JSON)

Пользователь: "Забронируй день рождение на 8 человек"
Ответ: {"shouldBook":true,"eventType":"День рождения","date":"","guestsCount":"8","budget":"","city":"","description":"","dishes":"","otherDetails":""}

Пользователь (после обсуждения деталей): "Забронируй" или "Оформи" или "Указал"
Ответ: {"shouldBook":true,"eventType":"...","date":"...","guestsCount":"...","budget":"...","city":"...","description":"...","dishes":"...","otherDetails":"..."} (все данные из контекста)
  `,
  checkpointer: checkpointer
})

const call = async (message, sessionId) => {
  const config = { configurable: { thread_id: sessionId } }
  const response = await agent.invoke({
    messages: [new HumanMessage(message)]
  }, config)

  return response
}

const getConversationHistory = async (sessionId) => {
  try {
    const state = await checkpointer.get({ configurable: { thread_id: sessionId } })
    if (state && state.values && state.values.messages) {
      return state.values.messages
    }
    return []
  } catch (error) {
    return []
  }
}

const formatMessageHistory = (messages) => {
  if (!messages || !Array.isArray(messages)) {
    return ''
  }
  
  return messages
    .filter(msg => {
      if (!msg || !msg.content) return false
      if (typeof msg.content === 'string' && msg.content.trim()) return true
      return false
    })
    .map(msg => {
      const msgType = msg.constructor?.name || msg._getType?.() || ''
      let role = 'Система'
      
      if (msgType.includes('Human') || msgType === 'HumanMessage') {
        role = 'Пользователь'
      } else if (msgType.includes('AI') || msgType === 'AIMessage' || msgType === 'AssistantMessage') {
        role = 'Консультант'
      } else if (msgType.includes('System') || msgType === 'SystemMessage') {
        role = 'Система'
      }
      
      return `${role}: ${msg.content}`
    })
    .join('\n\n')
}

const extractJsonFromResponse = (text) => {
  if (!text) return text;
  
  let cleaned = text.trim();
  
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/###\s+/g, '');
  cleaned = cleaned.replace(/##\s+/g, '');
  cleaned = cleaned.replace(/#\s+/g, '');
  cleaned = cleaned.replace(/-\s+/g, '');
  
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/gi;
  const jsonBlocks = [];
  let match;
  while ((match = jsonBlockRegex.exec(cleaned)) !== null) {
    jsonBlocks.push(match[1]);
  }
  
  if (jsonBlocks.length > 0) {
    cleaned = jsonBlocks[jsonBlocks.length - 1].trim();
  } else {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
  }
  
  const jsonObjects = [];
  let startIdx = -1;
  let braceCount = 0;
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (braceCount === 0) {
        startIdx = i;
      }
      braceCount++;
    } else if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIdx !== -1) {
        jsonObjects.push(cleaned.substring(startIdx, i + 1));
        startIdx = -1;
      }
    }
  }
  
  if (jsonObjects.length > 0) {
    cleaned = jsonObjects.reduce((a, b) => a.length > b.length ? a : b);
  }
  
  cleaned = cleaned.replace(/\}\s*\{/g, '},{');
  cleaned = cleaned.replace(/,\s*,/g, ',');
  cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');
  
  return cleaned.trim();
}

const agentRouter = express.Router()

const extractEventInfoFromHistory = (messages) => {
  const eventInfo = {
    eventType: '',
    guestsCount: '',
    budget: '',
    city: '',
    date: '',
    description: '',
    dishes: '',
    otherDetails: ''
  }
  
  if (!messages || !Array.isArray(messages)) return eventInfo
  
  const allText = messages
    .filter(msg => msg && msg.content && typeof msg.content === 'string')
    .map(msg => msg.content)
    .join(' ')
    .toLowerCase()
  
  const eventTypes = ['свадьба', 'день рождения', 'корпоратив', 'гендер-пати', 'выпускной', 'юбилей', 'детский праздник', 'интерактивный квест', 'квест']
  for (const type of eventTypes) {
    if (allText.includes(type)) {
      eventInfo.eventType = type === 'интерактивный квест' || type === 'квест' ? 'День рождения' : 
                           type === 'детский праздник' ? 'День рождения' :
                           type.charAt(0).toUpperCase() + type.slice(1)
      if (type === 'интерактивный квест' || type === 'квест') {
        eventInfo.description = allText.includes('квест по городу') ? 'Интерактивный квест по городу' :
                               allText.includes('город') ? 'Интерактивный квест по городу' : 'Интерактивный квест'
      }
      break
    }
  }
  
  const guestsMatch = allText.match(/(\d+)\s*(человек|гост|участник|чел)/i)
  if (guestsMatch) {
    eventInfo.guestsCount = guestsMatch[1]
  }
  
  const budgetMatches = [
    allText.match(/(\d+)\s*(тысяч|тыс|к)\s*рубл/i),
    allText.match(/бюджет[ае]?\s*(?:до\s*)?(\d+)/i),
    allText.match(/(\d+)\s*000/i)
  ]
  for (const match of budgetMatches) {
    if (match) {
      let num = parseInt(match[1])
      if (match[0].includes('тысяч') || match[0].includes('тыс') || match[0].includes('к') || num < 100) {
        num = num * 1000
      }
      eventInfo.budget = num.toString()
      break
    }
  }
  
  const cities = ['москва', 'санкт-петербург', 'екатеринбург', 'новосибирск', 'казань', 'нижний новгород']
  for (const city of cities) {
    if (allText.includes(city)) {
      eventInfo.city = city === 'санкт-петербург' ? 'Санкт-Петербург' :
                      city === 'нижний новгород' ? 'Нижний Новгород' :
                      city.charAt(0).toUpperCase() + city.slice(1)
      break
    }
  }
  
  const datePatterns = [
    { pattern: /завтра/i, value: 'завтра' },
    { pattern: /через\s*(?:два|2)\s*дня/i, value: 'через два дня' },
    { pattern: /через\s*неделю/i, value: 'через неделю' },
    { pattern: /(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/, value: (match) => {
      const day = match[1].padStart(2, '0')
      const month = match[2].padStart(2, '0')
      const year = match[3]
      return `${year}-${month}-${day}`
    }}
  ]
  
  for (const datePattern of datePatterns) {
    const match = allText.match(datePattern.pattern)
    if (match) {
      eventInfo.date = typeof datePattern.value === 'function' ? datePattern.value(match) : datePattern.value
      break
    }
  }
  
  return eventInfo
}

agentRouter.post('/prompt', async (req, res) => {
  try {
    const { message, sessionId = uuid() } = req.body

    const answer = await call(message, sessionId)
    const aiResponse = answer.messages.at(-1).content
    const history = answer.messages || []

    const bookingKeywords = ['забронируй', 'забронировать', 'оформить', 'оформи', 'бронируй',
                            'хочу забронировать', 'нужно забронировать', 'можно забронировать',
                            'перейди к оформлению', 'перейти к оформлению',
                            'открой форму', 'заполни форму',
                            'указал', 'указал всё', 'указал все',
                            'подбери подрядчиков', 'подобрать подрядчиков'];
    
    const messageLower = message.toLowerCase()
    const userWantsBooking = bookingKeywords.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    const aiBookingHints = ['перехожу к бронированию', 'открываю форму', 'заполняю форму', 'оформляю бронирование',
                           'переходим к оформлению', 'сейчас открою', 'открою форму', 'перехожу к оформлению'];
    const aiSuggestsBooking = aiResponse.toLowerCase().includes('json') || 
                              aiBookingHints.some(hint => 
                                aiResponse.toLowerCase().includes(hint.toLowerCase())
                              );
    
    const wantsBooking = userWantsBooking || aiSuggestsBooking;
    
    const contextInfo = extractEventInfoFromHistory(history)

    let bookingData = null;
    
    if (wantsBooking) {
      try {
        let parsed = null;
        const jsonContent = extractJsonFromResponse(aiResponse);
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (parseError) {
          }
        }
        
        if (parsed && parsed.shouldBook === true) {
          let processedDate = parsed.date || contextInfo.date || '';
          if (processedDate && !processedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const lowerDate = processedDate.toLowerCase();
            const today = new Date();
            let targetDate = new Date(today);
            
            if (lowerDate.includes('завтра')) {
              targetDate.setDate(today.getDate() + 1);
            } else if (lowerDate.includes('через два дня') || lowerDate.includes('через 2 дня')) {
              targetDate.setDate(today.getDate() + 2);
            } else if (lowerDate.includes('через неделю') || lowerDate.includes('через 7 дней')) {
              targetDate.setDate(today.getDate() + 7);
            } else {
              targetDate = new Date(processedDate);
            }
            
            if (!isNaN(targetDate.getTime())) {
              processedDate = targetDate.toISOString().split('T')[0];
            } else {
              processedDate = ''
            }
          }
          
          let processedBudget = parsed.budget || contextInfo.budget || '';
          if (processedBudget) {
            const budgetStr = processedBudget.toString().toLowerCase();
            const kMatch = budgetStr.match(/(\d+)\s*к/);
            if (kMatch) {
              processedBudget = (parseInt(kMatch[1]) * 1000).toString();
            } else {
              const budgetMatch = budgetStr.match(/\d+/);
              if (budgetMatch) {
                let num = parseInt(budgetMatch[0]);
                if (num < 1000 && (budgetStr.includes('тысяч') || budgetStr.includes('тыс'))) {
                  num = num * 1000;
                }
                processedBudget = num.toString();
              }
            }
          }
          
          bookingData = {
            shouldBook: true,
            eventType: parsed.eventType || contextInfo.eventType || '',
            date: processedDate,
            guestsCount: parsed.guestsCount || contextInfo.guestsCount || '',
            budget: processedBudget,
            city: parsed.city || contextInfo.city || '',
            description: parsed.description || contextInfo.description || '',
            dishes: parsed.dishes || contextInfo.dishes || '',
            otherDetails: parsed.otherDetails || contextInfo.otherDetails || ''
          };
        } else if (userWantsBooking) {
          let processedDate = contextInfo.date || '';
          if (processedDate && !processedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const lowerDate = processedDate.toLowerCase();
            const today = new Date();
            let targetDate = new Date(today);
            
            if (lowerDate.includes('завтра')) {
              targetDate.setDate(today.getDate() + 1);
            } else if (lowerDate.includes('через два дня') || lowerDate.includes('через 2 дня')) {
              targetDate.setDate(today.getDate() + 2);
            } else if (lowerDate.includes('через неделю') || lowerDate.includes('через 7 дней')) {
              targetDate.setDate(today.getDate() + 7);
            } else {
              targetDate = new Date(processedDate);
            }
            
            if (!isNaN(targetDate.getTime())) {
              processedDate = targetDate.toISOString().split('T')[0];
            } else {
              processedDate = ''
            }
          }
          
          bookingData = {
            shouldBook: true,
            eventType: contextInfo.eventType || '',
            date: processedDate,
            guestsCount: contextInfo.guestsCount || '',
            budget: contextInfo.budget || '',
            city: contextInfo.city || '',
            description: contextInfo.description || '',
            dishes: contextInfo.dishes || '',
            otherDetails: contextInfo.otherDetails || ''
          };
        }
      } catch (error) {
      }
    }

    let cleanMessage = aiResponse;
    if (wantsBooking && bookingData) {
      cleanMessage = aiResponse.replace(/\{[\s\S]*"shouldBook"[\s\S]*?\}/g, '').trim();
      if (!cleanMessage || cleanMessage.length === 0) {
        cleanMessage = 'Хорошо, перехожу к оформлению бронирования.';
      }
    }

    res.send({
      message: cleanMessage,
      sessionId: sessionId,
      bookingData: bookingData
    })
  } catch (error) {
    const errorMessage = error?.message || 'Неизвестная ошибка'
    res.status(500).json({
      error: 'Ошибка при обработке запроса',
      message: errorMessage
    });
  }
})

module.exports = {
  agentRouter
}
