
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
              type: 'FACE_DETECTION',
              maxResults: 10
            }
          ]
        }
      ]
    };

    console.log('Sending to Google Vision API for face detection');

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
    console.log('Vision API face detection response:', result);

    const faces = result.responses[0]?.faceAnnotations || [];
    
    const boundingBoxes = faces.map((face: any) => {
      const vertices = face.boundingPoly.vertices;
      return {
        x: vertices[0].x || 0,
        y: vertices[0].y || 0,
        width: (vertices[2].x || 0) - (vertices[0].x || 0),
        height: (vertices[2].y || 0) - (vertices[0].y || 0),
        confidence: face.detectionConfidence || 0
      };
    });

    return new Response(JSON.stringify({
      facesDetected: faces.length > 0,
      faceCount: faces.length,
      confidence: faces.length > 0 ? Math.max(...faces.map((f: any) => f.detectionConfidence || 0)) : 0,
      boundingBoxes: boundingBoxes,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in face detection function:', error);
    
    return new Response(JSON.stringify({
      facesDetected: false,
      faceCount: 0,
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
