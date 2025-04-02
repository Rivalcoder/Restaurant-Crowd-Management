import dotenv from 'dotenv';

dotenv.config();

const payloadTemplate = {
  assistantId: "a5a1aa18-e53f-4b07-b0fe-1106513a4c3c",
  customer: {},
  name: "Divyaprakash",
  phoneNumber: {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
};

async function makeCall(phoneNumber) {
  const payload = { ...payloadTemplate };
  payload.customer.number = phoneNumber; 

  try {
    const res = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.log(res)
      throw new Error("Error in API response");
    }

    const callData = await res.json();
    return callData;
  } catch (error) {
    console.error(error);
    throw new Error("Error making call: " + error.message);
  }
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { phoneNumber } = req.body; 

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    try {
      const response = await makeCall(phoneNumber);
      return res.status(200).json({ success: true, data: response });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
