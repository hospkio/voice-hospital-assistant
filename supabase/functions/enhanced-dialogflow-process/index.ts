
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DialogflowRequest {
  query: string;
  sessionId: string;
  languageCode: string;
}

interface Department {
  id: string;
  name: string;
  floor: number;
  room_number: string;
  description: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department_id: string;
  consultation_fee: number;
  experience_years: number;
  available_days: string[];
  available_times: string[];
}

interface HospitalInfo {
  id: string;
  category: string;
  question: string;
  answer_english: string;
  answer_tamil: string;
  answer_malayalam: string;
  keywords: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, sessionId, languageCode = 'en-US' }: DialogflowRequest = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Processing query:', query, 'Language:', languageCode)

    // Enhanced NLP processing with real database data
    const result = await processWithEnhancedNLP(query, languageCode, supabase)

    // Log interaction to database
    await logInteraction(supabase, {
      sessionId,
      userQuery: query,
      languageDetected: languageCode,
      intentRecognized: result.intent,
      entities: result.entities,
      systemResponse: result.responseText,
      confidenceScore: result.confidence,
      responseTimeMs: result.responseTime
    })

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing Dialogflow request:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      responseText: "I'm sorry, I'm having trouble processing your request right now. Please try again.",
      intent: 'error',
      confidence: 0,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function processWithEnhancedNLP(query: string, languageCode: string, supabase: any) {
  const startTime = Date.now()
  const normalizedQuery = query.toLowerCase().trim()

  // Intent classification with database lookup
  const intent = classifyIntent(normalizedQuery)
  const entities = extractEntities(normalizedQuery)

  let responseText = "I'm sorry, I didn't understand your request. Could you please rephrase?"
  let responseData = {}
  let confidence = 0.3

  console.log('Classified intent:', intent, 'Entities:', entities)

  try {
    switch (intent) {
      case 'navigation.department':
        const navResult = await handleDepartmentNavigation(normalizedQuery, entities, supabase, languageCode)
        responseText = navResult.responseText
        responseData = navResult.responseData
        confidence = navResult.confidence
        break

      case 'appointment.book':
      case 'appointment.check':
        const appointmentResult = await handleAppointmentQuery(normalizedQuery, entities, supabase, languageCode)
        responseText = appointmentResult.responseText
        responseData = appointmentResult.responseData
        confidence = appointmentResult.confidence
        break

      case 'hospital.info':
        const infoResult = await handleHospitalInfo(normalizedQuery, supabase, languageCode)
        responseText = infoResult.responseText
        responseData = infoResult.responseData
        confidence = infoResult.confidence
        break

      case 'emergency':
        responseText = getEmergencyResponse(languageCode)
        responseData = { type: 'emergency', urgent: true }
        confidence = 0.95
        break

      case 'greeting':
        responseText = getGreetingResponse(languageCode)
        responseData = { type: 'greeting' }
        confidence = 0.9
        break

      default:
        // Try keyword matching as fallback
        const fallbackResult = await handleFallbackQuery(normalizedQuery, supabase, languageCode)
        responseText = fallbackResult.responseText
        responseData = fallbackResult.responseData
        confidence = fallbackResult.confidence
    }
  } catch (error) {
    console.error('Error in intent handling:', error)
    responseText = "I'm experiencing some technical difficulties. Please try asking in a different way."
    confidence = 0.1
  }

  const responseTime = Date.now() - startTime

  return {
    responseText,
    intent,
    entities,
    confidence,
    responseTime,
    responseData,
    success: true
  }
}

function classifyIntent(query: string): string {
  // Department navigation patterns
  if (/where\s+is|location\s+of|find\s+the|directions?\s+to|how\s+to\s+get\s+to/.test(query)) {
    return 'navigation.department'
  }

  // Appointment patterns
  if (/book\s+appointment|schedule|appointment|doctor\s+available/.test(query)) {
    return 'appointment.book'
  }
  if (/check\s+appointment|my\s+appointment|appointment\s+status/.test(query)) {
    return 'appointment.check'
  }

  // Emergency patterns
  if (/emergency|urgent|help\s+me|critical|serious/.test(query)) {
    return 'emergency'
  }

  // Greeting patterns
  if (/hello|hi|hey|good\s+(morning|afternoon|evening)|help/.test(query)) {
    return 'greeting'
  }

  // Hospital info patterns
  if (/visiting\s+hours|wifi|canteen|food|wheelchair|payment|insurance|documents|bus|transport/.test(query)) {
    return 'hospital.info'
  }

  return 'unknown'
}

function extractEntities(query: string): any {
  const entities: any = {}

  // Extract department names
  const departments = [
    'cardiology', 'emergency', 'radiology', 'pharmacy', 'laboratory', 'pediatrics',
    'orthopedics', 'neurology', 'gynecology', 'ophthalmology', 'ent', 'dermatology',
    'psychiatry', 'dialysis', 'icu', 'surgery', 'physiotherapy', 'blood bank', 'billing', 'reception'
  ]

  for (const dept of departments) {
    if (query.includes(dept)) {
      entities.department = dept
      break
    }
  }

  // Extract time expressions
  const timeMatch = query.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
  if (timeMatch) {
    entities.time = timeMatch[0]
  }

  // Extract date expressions
  const dateMatch = query.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (dateMatch) {
    entities.date = dateMatch[0].toLowerCase()
  }

  return entities
}

async function handleDepartmentNavigation(query: string, entities: any, supabase: any, languageCode: string) {
  let department = entities.department

  // If no department in entities, try to extract from query
  if (!department) {
    const deptMatch = query.match(/(cardiology|emergency|radiology|pharmacy|laboratory|pediatrics|orthopedics|neurology|gynecology|ophthalmology|ent|dermatology|psychiatry|dialysis|icu|surgery|physiotherapy|blood bank|billing|reception)/i)
    if (deptMatch) {
      department = deptMatch[1].toLowerCase()
    }
  }

  if (!department) {
    return {
      responseText: "Which department are you looking for? I can help you find Cardiology, Emergency, Radiology, and many other departments.",
      responseData: { type: 'navigation', needsMore: true },
      confidence: 0.4
    }
  }

  // Look up department in database
  const { data: departments, error } = await supabase
    .from('departments')
    .select('*')
    .ilike('name', `%${department}%`)
    .limit(1)

  if (error || !departments || departments.length === 0) {
    return {
      responseText: `I couldn't find information about the ${department} department. Please check the spelling or ask about another department.`,
      responseData: { type: 'navigation', error: true },
      confidence: 0.3
    }
  }

  const dept = departments[0]
  const responseText = getLocalizedResponse('department_location', languageCode, {
    department: dept.name,
    floor: dept.floor,
    room: dept.room_number,
    description: dept.description
  })

  return {
    responseText,
    responseData: {
      type: 'navigation',
      department: dept.name,
      floor: dept.floor,
      room: dept.room_number,
      description: dept.description
    },
    confidence: 0.9
  }
}

async function handleAppointmentQuery(query: string, entities: any, supabase: any, languageCode: string) {
  const department = entities.department
  
  if (!department) {
    return {
      responseText: "Which department would you like to book an appointment with? For example, Cardiology, Neurology, or Pediatrics?",
      responseData: { type: 'appointment', needsMore: true },
      confidence: 0.5
    }
  }

  // Find doctors in the requested department
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      *,
      departments!inner(name, floor, room_number)
    `)
    .ilike('departments.name', `%${department}%`)
    .limit(3)

  if (error || !doctors || doctors.length === 0) {
    return {
      responseText: `I couldn't find any doctors in the ${department} department. Please try another department.`,
      responseData: { type: 'appointment', error: true },
      confidence: 0.4
    }
  }

  const doctor = doctors[0]
  const availableDays = doctor.available_days?.join(', ') || 'weekdays'
  const availableTimes = doctor.available_times?.slice(0, 3).join(', ') || '9:00 AM, 10:00 AM, 11:00 AM'

  const responseText = getLocalizedResponse('appointment_booking', languageCode, {
    doctor: doctor.name,
    department: doctor.departments.name,
    days: availableDays,
    time: availableTimes
  })

  return {
    responseText,
    responseData: {
      type: 'appointment',
      doctor: doctor.name,
      department: doctor.departments.name,
      fee: doctor.consultation_fee,
      availableDays: doctor.available_days,
      availableTimes: doctor.available_times
    },
    confidence: 0.85
  }
}

async function handleHospitalInfo(query: string, supabase: any, languageCode: string) {
  // Search hospital info by keywords
  const { data: hospitalInfo, error } = await supabase
    .from('hospital_info')
    .select('*')

  if (error || !hospitalInfo) {
    return {
      responseText: "I'm having trouble accessing hospital information right now. Please try again later.",
      responseData: { type: 'info', error: true },
      confidence: 0.2
    }
  }

  // Find best matching info based on keywords
  let bestMatch = null
  let bestScore = 0

  for (const info of hospitalInfo) {
    const keywords = info.keywords || []
    let score = 0

    for (const keyword of keywords) {
      if (query.includes(keyword.toLowerCase())) {
        score += 1
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = info
    }
  }

  if (!bestMatch || bestScore === 0) {
    return {
      responseText: "I don't have specific information about that. You can ask me about visiting hours, Wi-Fi, canteen, wheelchair access, payment options, or transportation.",
      responseData: { type: 'info', suggestions: true },
      confidence: 0.3
    }
  }

  const responseText = getLocalizedResponseFromInfo(bestMatch, languageCode)

  return {
    responseText,
    responseData: {
      type: 'info',
      category: bestMatch.category,
      question: bestMatch.question
    },
    confidence: 0.8
  }
}

async function handleFallbackQuery(query: string, supabase: any, languageCode: string) {
  // Try to find any matching keywords in hospital info
  const { data: hospitalInfo } = await supabase
    .from('hospital_info')
    .select('*')

  if (hospitalInfo) {
    for (const info of hospitalInfo) {
      const keywords = info.keywords || []
      for (const keyword of keywords) {
        if (query.includes(keyword.toLowerCase())) {
          return {
            responseText: getLocalizedResponseFromInfo(info, languageCode),
            responseData: { type: 'info', category: info.category },
            confidence: 0.6
          }
        }
      }
    }
  }

  return {
    responseText: "I'm not sure about that. You can ask me about department locations, booking appointments, visiting hours, or hospital facilities.",
    responseData: { type: 'fallback' },
    confidence: 0.2
  }
}

function getLocalizedResponse(intentName: string, languageCode: string, params: any): string {
  // Simplified localization - in a real implementation, you'd query the multilingual_responses table
  const templates = {
    'department_location': {
      'en-US': `The ${params.department} department is located on Floor ${params.floor}, Room ${params.room}. ${params.description}`,
      'ta-IN': `${params.department} பிரிவு ${params.floor}-ம் மாடி, அறை ${params.room}-ல் உள்ளது. ${params.description}`,
      'ml-IN': `${params.department} വിഭാഗം ${params.floor}-ാം നിലയിൽ, റൂം ${params.room}-ൽ സ്ഥിതി ചെയ്യുന്നു. ${params.description}`
    },
    'appointment_booking': {
      'en-US': `I can help you book an appointment. Dr. ${params.doctor} from ${params.department} is available on ${params.days}. Would you like to book at ${params.time}?`,
      'ta-IN': `நான் உங்களுக்கு அப்பாயிண்ட்மென்ட் பதிவு செய்ய உதவ முடியும். ${params.department}-ல் இருந்து டாக்டர் ${params.doctor} ${params.days}-ல் கிடைக்கிறார்.`,
      'ml-IN': `എനിക്ക് നിങ്ങൾക്ക് അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യാൻ സഹായിക്കാം. ${params.department}-ൽ നിന്നുള്ള ഡോ. ${params.doctor} ${params.days}-ൽ ലഭ്യമാണ്.`
    }
  }

  return templates[intentName]?.[languageCode] || templates[intentName]?.['en-US'] || 'I can help you with that.'
}

function getLocalizedResponseFromInfo(info: HospitalInfo, languageCode: string): string {
  switch (languageCode) {
    case 'ta-IN':
      return info.answer_tamil || info.answer_english
    case 'ml-IN':
      return info.answer_malayalam || info.answer_english
    default:
      return info.answer_english
  }
}

function getEmergencyResponse(languageCode: string): string {
  const responses = {
    'en-US': "For medical emergencies, please go directly to the Emergency department on the 1st floor, Room 101-120, or call emergency services immediately. Emergency care is available 24/7.",
    'ta-IN': "மருத்துவ அவசரநிலைகளுக்கு, தயவுசெய்து நேரடியாக 1-ம் மாடி, அறை 101-120-ல் உள்ள அவசர சிகிச்சை பிரிவுக்கு செல்லுங்கள் அல்லது உடனடியாக அவசர சேவைகளை அழைக்கவும்.",
    'ml-IN': "മെഡിക്കൽ എമർജൻസികൾക്കായി, ദയവായി നേരിട്ട് 1-ാം നിലയിലെ എമർജൻസി വിഭാഗത്തിലേക്ക് പോകുക, റൂം 101-120, അല്ലെങ്കിൽ ഉടനടി എമർജൻസി സേവനങ്ങളെ വിളിക്കുക."
  }
  
  return responses[languageCode] || responses['en-US']
}

function getGreetingResponse(languageCode: string): string {
  const responses = {
    'en-US': "Hello! Welcome to City Hospital. I can help you with directions, appointments, and hospital information. How may I assist you today?",
    'ta-IN': "வணக்கம்! சிட்டி மருத்துவமனைக்கு வரவேற்கிறோம். நான் உங்களுக்கு திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் மருத்துவமனை தகவல்களில் உதவ முடியும்.",
    'ml-IN': "നമസ്കാരം! സിറ്റി ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, ഹോസ്പിറ്റൽ വിവരങ്ങൾ എന്നിവയിൽ എനിക്ക് നിങ്ങളെ സഹായിക്കാൻ കഴിയും."
  }
  
  return responses[languageCode] || responses['en-US']
}

async function logInteraction(supabase: any, interaction: any) {
  try {
    await supabase.from('kiosk_interactions').insert({
      session_id: interaction.sessionId,
      user_query: interaction.userQuery,
      language_detected: interaction.languageDetected,
      intent_recognized: interaction.intentRecognized,
      entities: interaction.entities,
      system_response: interaction.systemResponse,
      confidence_score: interaction.confidenceScore,
      response_time_ms: interaction.responseTimeMs
    })
  } catch (error) {
    console.error('Error logging interaction:', error)
  }
}
