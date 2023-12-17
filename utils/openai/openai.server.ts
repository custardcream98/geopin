import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const getChatCompletion = async (
  conversations: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
) => {
  const completion = await openai.chat.completions.create({
    messages: conversations,
    model: "gpt-4-1106-preview",
    n: 1,
  });

  const messageText = completion.choices[0].message.content;

  return messageText;
};
