import { Vapi } from '@vapi-ai/web';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const Vapi = new Vapi({
      apiKey: process.env.VAPI_API_KEY,
    });

    // Start the call
    const call = await Vapi.call.start({
      assistantId: process.env.VAPI_ASSISTANT_ID,
      phoneNumber: phoneNumber,
      callerId: process.env.VAPI_CALLER_ID,
    });

    res.status(200).json({
      success: true,
      callId: call.id,
      status: call.status,
    });

  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate call'
    });
  }
}