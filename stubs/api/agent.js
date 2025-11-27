require('dotenv').config({
  path: '../../.env',
})
const { GigaChat } = require("langchain-gigachat")
const { Agent } = require('node:https')
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { tool } = require('@langchain/core/tools')
const z = require('zod')
const { HumanMessage } = require('@langchain/core/messages')
const { v4: uuid  } = require('uuid')
const express = require('express')
const { MemorySaver } = require('@langchain/langgraph')


const weather = tool(
  ({ city, date }) => {
    console.log('Tool weather call', city, date)
    return JSON.stringify({
      city,
      temperatureInCelcius: '+8',
      windSpeedInMeters: '30'
    })
  },
  {
    name: "weather",
    description: "Get information about current weather. Если человек не указал город, то уточни у него",
    schema: z.object({
      city: z.string().describe("Город, в котором нужна погода со слов пользователя. Обязательный параметр"),
      date: z.string().optional().describe("This is optional parameter. If it exists weather information would be by that date. Format: dd.mm.yyyy")
    }),
  }
);

const httpsAgent = new Agent({
  rejectUnauthorized: false,
});

const giga = new GigaChat({
  credentials: process.env.GIGA_AUTH,
  model: 'GigaChat-2',
  httpsAgent
})


const agent = createReactAgent({
  llm: giga,
  tools: [weather],
  prompt: `Ты — ИИ-консультант платформы Eventura, которая помогает организовать мероприятия (свадьбы, дни рождения, корпоративы и т.д.).

Твоя роль:
- Помогать пользователям с организацией мероприятий
- Подбирать подрядчиков и услуги
- Давать советы по планированию
- Отвечать на вопросы о платформе Eventura

Будь дружелюбным, профессиональным и полезным. Если тебе нужна дополнительная информация для более точного ответа, задавай уточняющие вопросы.

Примеры:
Пользователь: "Хочу организовать свадьбу на 100 человек"
Ответ: "Отлично! Для свадьбы на 100 человек вам понадобятся различные услуги. В каком городе планируется мероприятие? Какой у вас бюджет? Есть ли уже дата?"
  `,
  checkpointer: new MemorySaver()
})

const call = async (message, sessionId) => {
  const response = await agent.invoke({
    messages: [new HumanMessage(message)]
  }, { configurable: { thread_id: sessionId } })

  return response
}



// TODO x-session-id - for gigachat

const agentRouter = express.Router()

agentRouter.post('/prompt', async (req, res) => {
  const { message, sessionId = uuid() } = req.body

  const answer = await call(message, sessionId)

  res.send({
    message: answer.messages.at(-1).content,
    sessionId: sessionId
  })
})

module.exports = {
  agentRouter,
  agent
}