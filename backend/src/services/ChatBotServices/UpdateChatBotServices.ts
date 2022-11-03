import AppError from "../../errors/AppError";
import Chatbot from "../../models/Chatbot";

interface ChatbotData {
  id?: number;
  name?: string;
  greetingMessage?: string;
  options: Chatbot[];
}

const UpdateChatBotServices = async (
  chatBotId: number | string,
  chatbotData: ChatbotData,
): Promise<Chatbot> => {
  const { options } = chatbotData;

  const chatbot = await Chatbot.findOne({
    where: { id: chatBotId },
    include: ["options"],
    order: [["id", "asc"]]
  });

  if (!chatbot) {
    throw new AppError("ERR_NO_CHATBOT_FOUND", 404);
  }

  if (options) {
    await Promise.all(
      options.map(async bot => {
        await Chatbot.upsert({ ...bot, chatbotId: chatbot.id });
      })
    );

    await Promise.all(
      chatbot.options.map(async oldBot => {
        const stillExists = options.findIndex(bot => bot.id === oldBot.id);

        if (stillExists === -1) {
          await Chatbot.destroy({ where: { id: oldBot.id } });
        }
      })
    );
  }

  await chatbot.update(chatbotData);

  return chatbot;
};

export default UpdateChatBotServices;
