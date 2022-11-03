import {
  AnyWASocket,
  BinaryNode,
  Contact as BContact,
  jidNormalizedUser,
  MessageUpsertType,
  proto,
  WAMessage,
  WAMessageStubType
} from "@adiwajshing/baileys";
import * as Sentry from "@sentry/node";

import { Op } from "sequelize";
// import { getIO } from "../../libs/socket";
import { Store } from "../../libs/store";
import Contact from "../../models/Contact";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import createOrUpdateBaileysService from "../BaileysServices/CreateOrUpdateBaileysService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { handleMessage } from "./wbotMessageListener";

type Session = AnyWASocket & {
  id?: number;
  store?: Store;
};
interface IContact {
  contacts: BContact[];
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  try {
    wbot.ws.on("CB:call", async (node: BinaryNode) => {
      const content = node.content[0] as any;

      if (content.tag === "offer") {
        const { from, id } = node.attrs;
        console.log(`${from} is calling you with id ${id}`);
      }

      if (content.tag === "terminate") {
        const sendMsgCall = await Setting.findOne({
          where: { key: "call" }
        });

        if (sendMsgCall.value === "disabled") {
          await wbot.sendMessage(node.attrs.from, {
            text: "*Mensagem Automática:*\nAs chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto. Obrigado"
          });

          const number = jidNormalizedUser(node.attrs.from).replace(/\D/g, "");

          const contact = await Contact.findOne({
            where: { number }
          });

          if (contact) {

            const ticket = await FindOrCreateTicketService(
              {
                contact,
                whatsappId: wbot.id!,
              }
            );

            const date = new Date();
            const hours = date.getHours();
            const minutes = date.getMinutes();

            const body = `Chamada de voz/vídeo perdida às ${hours}:${minutes}`;

            const messageData = {
              id: content.attrs["call-id"],
              ticketId: ticket.id,
              contactId: contact.id,
              body,
              mediaType: "call_log"
            };

            await ticket.update({
              lastMessage: body
            });

            return CreateMessageService({ messageData });
          }
        }
      }
    });

    wbot.ev.on("contacts.upsert", async (contacts: BContact[]) => {
      console.log("upsert", contacts);
      await createOrUpdateBaileysService({
        whatsappId: whatsapp.id,
        contacts
      });
    });

    wbot.ev.on("contacts.set", async (contacts: IContact) => {
      console.log("set", contacts);
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default wbotMonitor;
