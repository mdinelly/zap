import { subMinutes } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import ShowTicketService from "./ShowTicketService";
import Whatsapp from "../../models/Whatsapp";
import Message from "../../models/Message";

interface IRequest {
  contact: Contact;
  whatsappId?: number;
  unreadMessages?: number;
  channel?: string;
  groupContact?: Contact;
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  channel,
  groupContact
}: IRequest): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId,
      channel
    }
  });

  const getAllMessageUnread = await Message.findAll({
    where: {
      ticketId: ticket?.id || null,
      read: false
    }
  });

  const unreadMessagesBase =
    getAllMessageUnread.length > 0 ? getAllMessageUnread.length : 0;

  if (ticket) {
    await ticket.update({ unreadMessages: unreadMessagesBase });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        whatsappId,
        channel
      },
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages: unreadMessagesBase,
        channel,
        isBot: true
      });
    }
  }

  if (!ticket && !groupContact) {
    const whatsapp = await Whatsapp.findOne({
      where: { id: whatsappId }
    });

    const timenewticket = whatsapp?.timenewticket;

    if (whatsapp?.reopenLastTicket) {
      ticket = await Ticket.findOne({
        where: {
          contactId: contact.id
        },
        order: [["updatedAt", "DESC"]]
      });
    } else {
      ticket = await Ticket.findOne({
        where: {
          updatedAt: {
            [Op.between]: [
              +subMinutes(new Date(), Number(timenewticket)),
              +new Date()
            ]
          },
          contactId: contact.id,
          whatsappId,
          channel
        },
        order: [["updatedAt", "DESC"]]
      });
    }

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages: unreadMessagesBase,
        channel,
        isBot: true
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      isBot: true,
      unreadMessages: unreadMessagesBase,
      channel,
      whatsappId
    });
  }

  ticket = await ShowTicketService(ticket.id);

  return ticket;
};

export default FindOrCreateTicketService;
