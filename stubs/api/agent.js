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
- Давать советы по планированию
- Отвечать на вопросы о платформе Eventura

Будь дружелюбным, профессиональным и полезным.

КРИТИЧЕСКИ ВАЖНО: 
- ВСЕГДА запоминай и анализируй ВСЮ информацию о мероприятии из контекста разговора
- Когда пользователь говорит "хочу забронировать", "забронируй", "оформить", "перейди к оформлению" или подобное:
  * Собери ВСЮ информацию о мероприятии из контекста разговора
  * Верни ТОЛЬКО JSON объект в следующем формате (без пояснений, без markdown блоков, просто чистый JSON):
    {"shouldBook":true,"eventType":"День рождения","date":"","guestsCount":"8","budget":"50000","city":"Казань","description":"Полицейские с Рублёвки","dishes":"","otherDetails":""}
  * Если информация не обсуждалась, оставь поле пустым строкой ""
  * JSON должен начинаться с { и заканчиваться }
  * НЕ добавляй никакого текста до или после JSON
  * НЕ используй markdown блоки с обратными кавычками

Примеры:
Пользователь: "День рождения на 8 человек, бюджет 20 тысяч, тематика Пираты"
Ответ: "Отлично! Для дня рождения на 8 человек в тематике Пираты Карибского моря с бюджетом 20 тысяч рублей вам понадобятся услуги по декору, кейтерингу и развлечениям. В каком городе планируется мероприятие? Есть ли уже дата?"

Пользователь: "Забронируй день рождение на 8 человек в стиле Полицейских с рублёвки с бюджетом в 100 000 рублей"
Ответ: {"shouldBook":true,"eventType":"День рождения","date":"","guestsCount":"8","budget":"100000","city":"","description":"Полицейские с Рублёвки","dishes":"","otherDetails":""}
  `,
  checkpointer: checkpointer
})

const call = async (message, sessionId) => {
  const response = await agent.invoke({
    messages: [new HumanMessage(message)]
  }, { configurable: { thread_id: sessionId } })

  return response
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

agentRouter.post('/prompt', async (req, res) => {
  try {
    const { message, sessionId = uuid() } = req.body

    const answer = await call(message, sessionId)
    const aiResponse = answer.messages.at(-1).content

    const bookingKeywords = ['забронируй', 'забронировать', 'подбери подрядчиков', 'подобрать подрядчиков', 
                            'найди подрядчиков', 'найти подрядчиков', 'оформить бронирование', 'создать бронирование',
                            'хочу забронировать', 'нужно забронировать', 'можно забронировать', 'переходим к бронированию',
                            'открой форму', 'заполни форму', 'оформить', 'хочу оформить', 'нужно оформить',
                            'перейди к оформлению', 'перейти к оформлению', 'оформи', 'бронируй'];
    const userWantsBooking = bookingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const aiBookingHints = ['перехожу к бронированию', 'открываю форму', 'заполняю форму', 'оформляю бронирование',
                           'переходим к оформлению', 'сейчас открою', 'открою форму', 'перехожу к оформлению'];
    const aiSuggestsBooking = aiBookingHints.some(hint => 
      aiResponse.toLowerCase().includes(hint.toLowerCase())
    );
    
    const wantsBooking = userWantsBooking || aiSuggestsBooking;

    let bookingData = null;
    
    if (wantsBooking) {
      try {
        const jsonContent = extractJsonFromResponse(aiResponse);
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            
            let processedDate = parsed.date || '';
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
              }
            }
            
            let processedBudget = parsed.budget || '';
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
              shouldBook: parsed.shouldBook === true,
              eventType: parsed.eventType || '',
              date: processedDate,
              guestsCount: parsed.guestsCount || '',
              budget: processedBudget,
              city: parsed.city || '',
              description: parsed.description || '',
              dishes: parsed.dishes || '',
              otherDetails: parsed.otherDetails || ''
            };
          } catch (parseError) {
          }
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
    res.status(500).json({
      error: 'Ошибка при обработке запроса',
      message: error.message
    });
  }
})

module.exports = {
  agentRouter
}
