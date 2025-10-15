import { sendEmail } from "../email";
import { storeOTP } from "../redis";
import { generateOTP } from "../util/otp";

export const setOTP = async (email: string, user: any) => {
  const requestId = crypto.randomUUID();
  const otp = generateOTP();
  console.log(otp);
  const isOTPStored = await storeOTP(email, otp, user, requestId);
  if (!isOTPStored) {
    return { success: false, requestId };
  }
  await sendEmail(email, "OTP: " + otp);
  return { success: true, requestId };
};
