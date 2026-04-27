const BASE_URL = "https://graph.facebook.com/v19.0";

function toWANumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  return digits.startsWith("91") ? digits : `91${digits}`;
}

async function sendWA(phoneNumberId: string, token: string, payload: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendWhatsAppOTP(mobile: string, otp: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  const templateName = process.env.WHATSAPP_OTP_TEMPLATE ?? "instantloan_otp";

  return sendWA(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: toWANumber(mobile),
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [{
        type: "body",
        parameters: [{ type: "text", text: otp }],
      }],
    },
  });
}

export async function sendWhatsAppMessage(mobile: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return false;

  return sendWA(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to: toWANumber(mobile),
    type: "text",
    text: { body: message },
  });
}
