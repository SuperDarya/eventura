require('dotenv').config({
  path: '../../../.env'
});
const express = require('express');
const router = express.Router();
const { GigaChat } = require('langchain-gigachat');
const { Agent } = require('node:https');
const { readJSONFile } = require('../data-service');
const { z } = require('zod');
const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { JsonOutputParser } = require('@langchain/core/output_parsers');

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const gigaChat = new GigaChat({
  model: 'GigaChat',
  scope: 'GIGACHAT_API_PERS',
  credentials: process.env.GIGA_AUTH || 'MDE5YTFhYzUtMTdhYy03MGIyLTk1MmQtN2Y5ZGI0YzFjODZhOmZjZTI2NjVlLThmZWUtNDU5Ni04YTVhLTQxOTE0MjE1OGY4OQ==',
  httpsAgent,
});
router.post('/', async (req, res) => {
  try {
    const { eventType, budget, guestsCount, date, city, description, clarificationCount = 0 } = req.body;
    
    const vendors = readJSONFile('users_and_vendors.json').filter(u => u.type === 'vendor' || u.type === 'organizer');
    const services = readJSONFile('services.json');
    const reviews = readJSONFile('reviews.json');
    
    if (clarificationCount >= 2) {
    }
    
    const requestDate = date;
    const vendorData = vendors.slice(0, 50).map(v => {
      const isAvailable = !v.calendar || !v.calendar.includes(requestDate);
      
      return {
        id: v.id,
        name: v.companyName,
        city: v.city,
        rating: v.rating,
        reviewsCount: v.reviewsCount,
        isAvailable: isAvailable,
        calendar: v.calendar || [],
        services: services.filter(s => s.vendorId === v.id).map(s => ({
          name: s.name,
          category: s.category,
          priceMin: s.priceMin,
          priceMax: s.priceMax
        }))
      };
    });
    
    const responseSchema = z.object({
      vendors: z.array(z.object({
        vendorId: z.number().describe('ID подрядчика'),
        relevanceScore: z.number().describe('Релевантность от 0 до 10'),
        reason: z.string().describe('Почему выбран этот подрядчик'),
        estimatedPrice: z.number().optional().describe('Приблизительная стоимость услуг')
      })).describe('Список подобранных подрядчиков (топ 5-10)'),
      eventConcept: z.string().describe('Концепция мероприятия с идеями по оформлению, развлечениям, тематике'),
      estimatedCosts: z.array(z.object({
        category: z.string(),
        estimatedPrice: z.number(),
        notes: z.string().optional()
      })).describe('Приблизительная стоимость по категориям услуг'),
      needsClarification: z.boolean().optional().describe('Нужны ли уточняющие вопросы'),
      clarificationQuestion: z.string().optional().describe('Вопрос для уточнения (если needsClarification = true)')
    });
    
    const parser = StructuredOutputParser.fromZodSchema(responseSchema);
    
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `Ты — помощник по подбору подрядчиков для мероприятий на платформе Eventura.

Анализируй запрос пользователя и данные доступных подрядчиков, затем верни структурированный ответ.

ЗАДАЧА:
1. Подбери топ 5-10 наиболее релевантных подрядчиков (учитывай бюджет, город, тип услуги, рейтинг)
2. КРИТИЧЕСКИ ВАЖНО: Проверь поле isAvailable для каждого подрядчика. Если isAvailable = false, подрядчик ЗАНЯТ в указанную дату и НЕ МОЖЕТ быть выбран
3. Предпочитай подрядчиков с isAvailable = true
4. Если подрядчик занят (isAvailable = false), НЕ включай его в результат или укажи в reason, что он занят
5. Создай концепцию мероприятия с идеями по оформлению, развлечениям, тематике
6. Оцени приблизительную стоимость каждой категории услуг на основе данных подрядчиков
7. Если данных недостаточно для точной оценки, можешь задать один уточняющий вопрос (но не более 2 вопросов на весь запрос)

ВАЖНО:
- Возвращай ТОЛЬКО валидный JSON объект без каких-либо пояснений, схем или markdown блоков
- НЕ возвращай описание схемы JSON Schema
- НЕ используй markdown блоки с обратными кавычками (не используй форматирование кода)
- НЕ добавляй текст до или после JSON
- Просто верни чистый JSON объект, начинающийся с открывающей фигурной скобки и заканчивающийся закрывающей фигурной скобкой
- Если нужно задать уточняющий вопрос, установи needsClarification = true и укажи вопрос
- Оценивай стоимость реалистично на основе данных подрядчиков
- Если данных для оценки недостаточно, укажи это в notes
- ВСЕГДА проверяй доступность подрядчика на указанную дату. Подрядчики с isAvailable = false не должны быть в результатах

Формат ответа (только JSON, без пояснений):
{format_instructions}`],
      ['user', `ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
Тип мероприятия: {eventType}
Бюджет: {budget} ₽
Количество гостей: {guestsCount}
Дата: {date}
Город: {city}
Описание: {description}

ДОСТУПНЫЕ ПОДРЯДЧИКИ:
{vendorData}`]
    ]);
    
    const extractJsonFromResponse = (text) => {
      if (!text) return text;
      
      let cleaned = text.trim();
      
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
      } else if (startIdx !== -1) {
        cleaned = cleaned.substring(startIdx);
      }
      
      cleaned = cleaned.replace(/\}\s*\{/g, '},{');
      cleaned = cleaned.replace(/,\s*,/g, ',');
      cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');
      
      return cleaned.trim();
    };
    
    const chain = RunnableSequence.from([
      prompt,
      gigaChat,
      async (response) => {
        let content = '';
        if (typeof response === 'string') {
          content = response;
        } else if (response.content) {
          content = response.content;
        } else if (response.text) {
          content = response.text;
        } else if (response.messages && response.messages.length > 0) {
          const lastMessage = response.messages[response.messages.length - 1];
          content = lastMessage.content || lastMessage.text || '';
        }
        
        if (!content) {
          throw new Error('Пустой ответ от ИИ');
        }
        
        let jsonContent = extractJsonFromResponse(content);
        
        jsonContent = jsonContent.replace(/\}\s*\{/g, '},{');
        
        while (jsonContent.includes(',,')) {
          jsonContent = jsonContent.replace(/,\s*,/g, ',');
        }
        
        jsonContent = jsonContent.replace(/,\s*(\}|\])/g, '$1');
        
        jsonContent = jsonContent.replace(/\}\s*\]/g, '}]');
        
        try {
          const parsed = JSON.parse(jsonContent);
          return responseSchema.parse(parsed);
        } catch (parseError) {
          try {
            let retryJson = jsonContent.replace(/\}\s*\{/g, '},{');
            retryJson = retryJson.replace(/,\s*(\}|\])/g, '$1');
            
            const parsed = JSON.parse(retryJson);
            return responseSchema.parse(parsed);
          } catch (retryError) {
            try {
              const parsed = await parser.parse(jsonContent);
              return parsed;
            } catch (parserError) {
              throw new Error(`Не удалось распарсить ответ ИИ после всех попыток исправления. Последняя ошибка: ${parserError.message}`);
            }
          }
        }
      }
    ]);
    
    try {
      const result = await chain.invoke({
        eventType,
        budget,
        guestsCount,
        date,
        city,
        description: description || 'Не указано',
        vendorData: JSON.stringify(vendorData, null, 2),
        format_instructions: parser.getFormatInstructions()
      });
      
      res.json(result);
    } catch (chainError) {
      throw chainError;
    }
  } catch (error) {
    let actualError = error;
    if (error.response) {
      actualError = error;
    } else if (error.cause) {
      actualError = error.cause;
    }
    
    let statusCode = 500;
    let errorMessage = 'Ошибка при подборе подрядчиков';
    
    const response = actualError.response || error.response;
    if (response) {
      const status = response.status;
      if (status === 429) {
        statusCode = 429;
        errorMessage = 'Слишком много запросов к GigaChat API. Пожалуйста, подождите немного и попробуйте снова.';
      } else if (status === 401) {
        statusCode = 401;
        errorMessage = 'Ошибка авторизации GigaChat API. Проверьте ключ авторизации.';
      } else if (status === 404) {
        statusCode = 404;
        errorMessage = 'Модель не найдена. Убедитесь, что используется правильная модель для вашего типа доступа.';
      } else if (status === 422) {
        statusCode = 422;
        errorMessage = 'Некорректные параметры запроса к GigaChat API.';
      } else {
        statusCode = status;
        errorMessage = response.data?.message || `Ошибка GigaChat API (${status})`;
      }
    } else if (error.message && error.message.includes('parse')) {
      errorMessage = 'ИИ вернул некорректный ответ. Пожалуйста, попробуйте еще раз.';
    } else if (error.message && error.message.includes('credentials')) {
      errorMessage = 'Ошибка авторизации. Проверьте ключ авторизации GigaChat.';
    } else if (error.message && error.message.includes('429')) {
      statusCode = 429;
      errorMessage = 'Слишком много запросов к GigaChat API. Пожалуйста, подождите немного и попробуйте снова.';
    }
    
    res.status(statusCode).json({ 
      error: errorMessage, 
      details: actualError.message || error.message,
      status: statusCode
    });
  }
});

module.exports = router;

