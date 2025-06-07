
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppRequest {
  phoneNumber: string;
  message: string;
  tokenNumber: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, tokenNumber }: WhatsAppRequest = await req.json();

    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp API credentials not configured');
    }

    // Clean phone number (remove spaces, hyphens, etc.)
    const cleanPhoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Ensure it starts with country code
    const formattedPhone = cleanPhoneNumber.startsWith('+') ? 
      cleanPhoneNumber.substring(1) : 
      cleanPhoneNumber.startsWith('91') ? cleanPhoneNumber : `91${cleanPhoneNumber}`;

    const messageData = {
      messaging_product: 'whatsapp',
      to: formattedPhone,
      type: 'text',
      text: {
        body: message
      }
    };

    console.log('Sending WhatsApp message to:', formattedPhone);

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('WhatsApp message sent successfully:', result);

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messages?.[0]?.id,
      tokenNumber: tokenNumber,
      phoneNumber: formattedPhone
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in WhatsApp function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
