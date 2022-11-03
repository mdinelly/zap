import { proto, WALegacySocket, WASocket } from "@adiwajshing/baileys";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await ticket.update({ unreadMessages: 0 });

  try {
    if (ticket.channel === "whatsapp") {
      const wbot = await GetTicketWbot(ticket);
      if (wbot.type === "legacy") {
        const chatMessages = await (wbot as WALegacySocket).fetchMessagesFromWA(
          `${ticket.contact.number}@${
            ticket.isGroup ? "g.us" : "s.whatsapp.net"
          }`,
          100
        );
        chatMessages.forEach(async message => {
          await (wbot as WALegacySocket).chatRead(message.key, 1);
        });
      }

      if (wbot.type === "md") {
        const getJsonMessage = await Message.findAll({
          where: {
            ticketId: ticket.id,
            fromMe: false,
            read: false
          },
          order: [["createdAt", "DESC"]],
          attributes: ["dataJson", "remoteJid", "id", "participant"]
        });

        if (getJsonMessage.length > 0) {
          const key: proto.IMessageKey[] = [];

          getJsonMessage.forEach(async message => {
            key.push({
              remoteJid: message.remoteJid,
              id: message.id,
              participant: message.participant
            });
          });

          const lastMsgInChat: proto.IWebMessageInfo = JSON.parse(
            JSON.stringify(getJsonMessage[0].dataJson)
          );

          if (key) {
            await (wbot as WASocket).readMessages(key);
            // await wbot.chatModify(
            //   { markRead: true, lastMessages: [lastMsgInChat] },
            //   lastMsgInChat.key.remoteJid
            // );

            logger.info(`Ticket ${lastMsgInChat.key.id} messages read`);
          }
        }
      }
    }

    await Message.update(
      { read: true },
      {
        where: {
          ticketId: ticket.id,
          read: false
        }
      }
    );
  } catch (err) {
    console.log(err);
    logger.warn(
      `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
    );
  }

  const io = getIO();
  io.to(ticket.status).to("notification").emit("ticket", {
    action: "updateUnread",
    ticketId: ticket.id
  });
};

export default SetTicketMessagesAsRead;
