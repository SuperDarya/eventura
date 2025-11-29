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

// Инициализация GigaChat
const gigaChat = new GigaChat({
  model: 'GigaChat', // Используем базовую модель GigaChat (Lite) для GIGACHAT_API_PERS
  scope: 'GIGACHAT_API_PERS',
  credentials: process.env.GIGA_AUTH || 'MDE5YTFhYzUtMTdhYy03MGIyLTk1MmQtN2Y5ZGI0YzFjODZhOmZjZTI2NjVlLThmZWUtNDU5Ni04YTVhLTQxOTE0MjE1OGY4OQ==',
  httpsAgent,
});

// POST /api/eventura/ai-search - ИИ-подбор подрядчиков
router.post('/', async (req, res) => {
  try {
    const { eventType, budget, guestsCount, date, city, description, clarificationCount = 0 } = req.body;
    
    // Загружаем данные
    const vendors = readJSONFile('users_and_vendors.json').filter(u => u.type === 'vendor' || u.type === 'organizer');
    const services = readJSONFile('services.json');
    const reviews = readJSONFile('reviews.json');
    
    // Если ИИ задал уточняющий вопрос, отправляем его пользователю
    if (clarificationCount >= 2) {
      // Максимум 2 вопроса, далее работаем с имеющимися данными
    }
    
    // Проверяем доступность подрядчиков на выбранную дату
    const requestDate = date; // Дата в формате YYYY-MM-DD
    
    // Создаем промпт для ИИ
    const vendorData = vendors.slice(0, 50).map(v => {
      const isAvailable = !v.calendar || !v.calendar.includes(requestDate);
      
      return {
        id: v.id,
        name: v.companyName,
        city: v.city,
        rating: v.rating,
        reviewsCount: v.reviewsCount,
        isAvailable: isAvailable, // Доступен ли подрядчик на эту дату
        calendar: v.calendar || [], // Занятые даты
        services: services.filter(s => s.vendorId === v.id).map(s => ({
          name: s.name,
          category: s.category,
          priceMin: s.priceMin,
          priceMax: s.priceMax
        }))
      };
    });
    
    // Схема ответа
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
    
    // Промпт для ИИ
    const prompt = ChatPromptTemplate.fromTemplate(`
Ты — помощник по подбору подрядчиков для мероприятий на платформе Eventura.

Анализируй запрос пользователя и данные доступных подрядчиков, затем верни структурированный ответ.

ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
Тип мероприятия: {eventType}
Бюджет: {budget} ₽
Количество гостей: {guestsCount}
Дата: {date}
Город: {city}
Описание: {description}

ДОСТУПНЫЕ ПОДРЯДЧИКИ:
{vendorData}

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
- ВСЕГДА проверяй доступность подрядчика на дату {date}. Подрядчики с isAvailable = false не должны быть в результатах

Формат ответа (только JSON, без пояснений):
{format_instructions}
    `);
    
    // Функция для очистки JSON от markdown обёрток и извлечения JSON объекта
    const extractJsonFromResponse = (text) => {
      if (!text) return text;
      
      let cleaned = text.trim();
      
      // Сначала ищем markdown блоки с JSON - ИИ часто возвращает схему + пример
      // Ищем последний блок ```json ... ``` (это обычно реальный ответ)
      const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/gi;
      const jsonBlocks = [];
      let match;
      while ((match = jsonBlockRegex.exec(cleaned)) !== null) {
        jsonBlocks.push(match[1]);
      }
      
      // Если нашли markdown блоки, берем последний (это обычно реальный ответ)
      if (jsonBlocks.length > 0) {
        cleaned = jsonBlocks[jsonBlocks.length - 1].trim();
      } else {
        // Если нет markdown блоков, убираем их обертки
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/g, '');
        cleaned = cleaned.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
      }
      
      // Ищем все JSON объекты в тексте и берем последний (самый большой/полный)
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
      
      // Берем последний JSON объект (обычно это реальный ответ, а не схема)
      if (jsonObjects.length > 0) {
        // Выбираем самый большой объект (обычно это ответ, а не схема)
        cleaned = jsonObjects.reduce((a, b) => a.length > b.length ? a : b);
      } else if (startIdx !== -1) {
        // Если не нашли закрывающую скобку, берем от начала до конца
        cleaned = cleaned.substring(startIdx);
      }
      
      // Исправляем частые ошибки в JSON от ИИ
      // ВАЖНО: порядок операций имеет значение!
      
      // 1. Сначала добавляем запятые между объектами в массивах (самая частая ошибка ИИ)
      // Ищем паттерн }{" (объект заканчивается, следующий начинается) и заменяем на },{
      cleaned = cleaned.replace(/\}\s*\{/g, '},{');
      
      // 2. Исправляем двойные запятые, которые могли появиться
      cleaned = cleaned.replace(/,\s*,/g, ',');
      
      // 3. Убираем лишние запятые перед закрывающими скобками (но ТОЛЬКО если это не между объектами)
      cleaned = cleaned.replace(/,\s*(\}|\])/g, '$1');
      
      return cleaned.trim();
    };
    
    const chain = RunnableSequence.from([
      prompt,
      gigaChat,
      async (response) => {
        // Получаем текст ответа из AIMessage
        let content = '';
        if (typeof response === 'string') {
          content = response;
        } else if (response.content) {
          content = response.content;
        } else if (response.text) {
          content = response.text;
        } else if (response.messages && response.messages.length > 0) {
          // Если это ответ с messages массивом
          const lastMessage = response.messages[response.messages.length - 1];
          content = lastMessage.content || lastMessage.text || '';
        }
        
        if (!content) {
          console.error('Empty response from LLM:', JSON.stringify(response, null, 2));
          throw new Error('Пустой ответ от ИИ');
        }
        
        // Извлекаем JSON из ответа
        let jsonContent = extractJsonFromResponse(content);
        
        // Многоуровневое исправление некорректного JSON от ИИ
        // ИИ часто забывает запятые между объектами в массивах
        
        // Шаг 1: Добавляем запятые между объектами в массивах
        // Заменяем }{" на },{ (самая частая ошибка)
        jsonContent = jsonContent.replace(/\}\s*\{/g, '},{');
        
        // Шаг 2: Исправляем двойные запятые
        while (jsonContent.includes(',,')) {
          jsonContent = jsonContent.replace(/,\s*,/g, ',');
        }
        
        // Шаг 3: Убираем запятые перед закрывающими скобками
        jsonContent = jsonContent.replace(/,\s*(\}|\])/g, '$1');
        
        // Шаг 4: Исправляем }] на }] (последний элемент массива)
        jsonContent = jsonContent.replace(/\}\s*\]/g, '}]');
        
        console.log('Extracted and fixed JSON (first 400 chars):', jsonContent.substring(0, 400) + '...');
        
        try {
          // Пробуем распарсить напрямую
          const parsed = JSON.parse(jsonContent);
          // Валидируем через zod схему
          return responseSchema.parse(parsed);
        } catch (parseError) {
          // Если не получилось, пробуем еще раз с дополнительными исправлениями
          try {
            // Дополнительная попытка - заменяем все } { на },{
            let retryJson = jsonContent.replace(/\}\s*\{/g, '},{');
            retryJson = retryJson.replace(/,\s*(\}|\])/g, '$1');
            
            const parsed = JSON.parse(retryJson);
            return responseSchema.parse(parsed);
          } catch (retryError) {
            // Используем StructuredOutputParser как последний fallback
            try {
              const parsed = await parser.parse(jsonContent);
              return parsed;
            } catch (parserError) {
              console.error('Failed to parse JSON after all fixes.');
              console.error('JSON content length:', jsonContent.length);
              console.error('JSON (first 1500 chars):', jsonContent.substring(0, 1500));
              console.error('First parse error:', parseError.message);
              console.error('Retry parse error:', retryError.message);
              console.error('Parser error:', parserError.message);
              
              // Возвращаем более информативную ошибку
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
      // Если ошибка произошла в chain, пробрасываем её дальше для обработки в общем catch
      throw chainError;
    }
  } catch (error) {
    console.error('AI search error:', error);
    console.error('Error stack:', error.stack);
    
    // Извлекаем вложенную ошибку, если она есть (например, из ResponseError)
    let actualError = error;
    if (error.response) {
      actualError = error;
    } else if (error.cause) {
      actualError = error.cause;
    }
    
    console.error('Error details:', {
      message: actualError.message || error.message,
      response: actualError.response?.data || error.response?.data,
      status: actualError.response?.status || error.response?.status,
      statusText: actualError.response?.statusText || error.response?.statusText
    });
    
    // Обработка специфических ошибок
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

