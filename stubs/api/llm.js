require('dotenv').config({
  path: '../../.env'
})
const { GigaChat, GigaChatEmbeddings } = require('langchain-gigachat');
const { Agent } = require('node:https');
const { createReactAgent } = require('@langchain/langgraph/prebuilt')
const { HumanMessage } = require('@langchain/core/messages')
const { tool } = require('@langchain/core/tools')
const z = require('zod');


const httpsAgent = new Agent({
    rejectUnauthorized: false,
});

const llm = new GigaChat({
    model: 'GigaChat-2',
    scope: 'GIGACHAT_API_PERS',
    credentials: process.env.GIGA_AUTH,
    httpsAgent,
});

const sum = tool(
  (input) => input.a + input.b,
  {
    name: "sum",
    description: "Складывает 2 числа друг с другом (математическое сложение)",
    schema: z.object({
      a: z.string().describe("Первый параметр сложения"),
      b: z.string().describe("Второй параметр сложения"),
    }),
  }
);

const agent = createReactAgent({ llm, tools: [sum] });

const ask = async (message) => {
  const answer = await agent.invoke({
    messages: [new HumanMessage(message)]
  })
  console.log(answer)
}

ask('Сколько будет 5+1?')
