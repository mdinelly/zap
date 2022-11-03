import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

import sendFaceMedia from "../services/FacebookServices/sendFacebookMessageMedia";
import sendFaceMessage from "../services/FacebookServices/sendFacebookMessage";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
  number?: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    pageNumber,
    ticketId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService(ticketId);

  SetTicketMessagesAsRead(ticket);

  if (medias) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        if (ticket.channel === "whatsapp") {
          await SendWhatsAppMedia({ media, ticket });
        }

        if (ticket.channel === "facebook" || ticket.channel === "instagram") {
          await sendFaceMedia({ media, ticket });
        }
      })
    );
  } else {
    if (ticket.channel === "whatsapp") {
      await SendWhatsAppMessage({ body, ticket, quotedMsg });
    }

    if (ticket.channel === "facebook" || ticket.channel === "instagram") {
      console.log("facebook");
      await sendFaceMessage({ body, ticket, quotedMsg });
    }
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;

  const message = await DeleteWhatsAppMessage(messageId);

  const io = getIO();
  io.to(message.ticketId.toString()).emit("appMessage", {
    action: "update",
    message
  });

  return res.send();
};

export const send = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params as unknown as { whatsappId: number; };
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  try {
    const whatsapp = await Whatsapp.findByPk(whatsappId);

    if (!whatsapp) {
      throw new Error('Não foi possível realizar a operação');
    }

    if (messageData.number === undefined) {
      throw new Error('O número é obrigatório');
    }

    const number = messageData.number;
    const body = messageData.body;

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          req.app.get('queues')
            .messageQueue.add('SendMessage', {
              whatsappId,
              data: {
                number,
                body: media.originalname,
                mediaPath: media.path
              }
            }, { removeOnComplete: true, attempts: 3 });
        })
      );
    } else {
      req.app.get('queues')
        .messageQueue.add('SendMessage', {
          whatsappId,
          data: {
            number,
            body
          }
        }, { removeOnComplete: true, attempts: 3 });
    }

    return res.send({ mensagem: 'Mensagem enviada' });
  } catch (err: any) {
    if (Object.keys(err).length === 0) {
      throw new AppError('Não foi possível enviar a mensagem, tente novamente em alguns instantes');
    } else {
      throw new AppError(err.message);
    }
  }
};
