require('dotenv').config({
  path: '../../.env',
})
const { GigaChat } = require("langchain-gigachat")
const { Agent } = require('node:https')
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { tool } = require('@langchain/core/tools')
const z = require('zod')
const { HumanMessage } = require('@langchain/core/messages')


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
    description: "Get information about current weather",
    schema: z.object({
      city: z.string().describe("City in which we would get weather information"),
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
  prompt: 'Answer on English'
})

const call = async (message) => {
  const response = await agent.invoke({
    messages: [new HumanMessage(message)]
  })

  // console.log(response)
  const res2 = await agent.invoke({
    messages: [...response.messages, new HumanMessage('What about Moscow?')]
  })
  console.log(res2)
}


call('What weather in Innopolis?')

// session-id - for gigachat
// session-id - for working with message history (short-term-memory)