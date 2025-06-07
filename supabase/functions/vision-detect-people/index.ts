
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image data provided');
    }

    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!apiKey) {
      throw new Error('Google Vision API key not configured');
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: image
          },
          features: [
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 50
            }
          ]
        }
      ]
    };

    console.log('Sending to Google Vision API for people detection');

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Vision API error:', errorText);
      throw new Error(`Vision API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Vision API response:', result);

    const objects = result.responses[0]?.localizedObjectAnnotations || [];
    
    // Filter for person objects
    const people = objects.filter((obj: any) => 
      obj.name.toLowerCase() === 'person' && obj.score > 0.5
    );

    const boundingBoxes = people.map((person: any) => {
      const vertices = person.boundingPoly.normalizedVertices;
      return {
        x: vertices[0].x,
        y: vertices[0].y,
        width: vertices[2].x - vertices[0].x,
        height: vertices[2].y - vertices[0].y,
        confidence: person.score
      };
    });

    return new Response(JSON.stringify({
      peopleDetected: people.length > 0,
      confidence: people.length > 0 ? Math.max(...people.map((p: any) => p.score)) : 0,
      peopleCount: people.length,
      boundingBoxes: boundingBoxes,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in vision detection function:', error);
    
    return new Response(JSON.stringify({
      peopleDetected: false,
      confidence: 0,
      boundingBoxes: [],
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
