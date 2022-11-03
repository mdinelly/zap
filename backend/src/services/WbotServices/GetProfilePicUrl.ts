import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const GetProfilePicUrl = async (number: string): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();
  const wbot = getWbot(defaultWhatsapp.id);
  let profilePicUrl = `${process.env.FRONTEND_URL}/nopicture.png`;

  try {
    profilePicUrl = await wbot.profilePictureUrl(`${number}@s.whatsapp.net`);
  } catch (err) {
    throw new AppError("ERR_WAPP_GET_PICTURE_CONTACT");
  }

  return profilePicUrl;
};

export default GetProfilePicUrl;
