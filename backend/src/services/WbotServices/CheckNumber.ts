import { WASocket } from "@adiwajshing/baileys";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CheckContactNumber = async (number: string): Promise<any> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  const [result] = await (wbot as WASocket).onWhatsApp(
    `${number}@s.whatsapp.net`
  );

  return result;
};

export default CheckContactNumber;
