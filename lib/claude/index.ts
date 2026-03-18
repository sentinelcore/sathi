import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ─── OCR: Extract health reading from a device photo ───────────────────────

export interface OcrResult {
  metric_type: 'blood_pressure' | 'blood_glucose' | 'spo2' | 'weight' | 'heart_rate' | 'temperature' | 'unknown'
  systolic?: number
  diastolic?: number
  value?: number
  unit?: string
  display_value: string
  confidence: 'high' | 'medium' | 'low'
  raw_text?: string
}

export async function extractHealthReading(imageUrl: string): Promise<OcrResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: `You are analyzing a photo taken by an elderly person of a medical device reading.
Extract the health measurement shown in the image.

Return ONLY valid JSON (no markdown, no explanation):
{
  "metric_type": "blood_pressure" | "blood_glucose" | "spo2" | "weight" | "heart_rate" | "temperature" | "unknown",
  "systolic": number or null,
  "diastolic": number or null,
  "value": number or null,
  "unit": string or null,
  "display_value": "human readable value e.g. 120/80 mmHg or 98 mg/dL",
  "confidence": "high" | "medium" | "low",
  "raw_text": "any text visible on display"
}

If you cannot read the display clearly, set confidence to "low".`,
          },
        ],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text) as OcrResult
  } catch {
    return {
      metric_type: 'unknown',
      display_value: 'Could not read',
      confidence: 'low',
      raw_text: text,
    }
  }
}

// ─── Generate daily health summary ────────────────────────────────────────

export interface ReadingSummaryInput {
  parentName: string
  childName: string
  date: string
  readings: Array<{
    metric: string
    value: string
    status: 'normal' | 'elevated' | 'low' | 'critical'
  }>
  conditions: string[]
  missedReadings: string[]
}

export async function generateDailySummary(input: ReadingSummaryInput): Promise<{
  summary_text: string
  summary_short: string
  health_score: number
  has_concerns: boolean
  concern_level: 'normal' | 'watch' | 'alert' | 'urgent'
}> {
  const readingsText = input.readings.length > 0
    ? input.readings.map(r => `- ${r.metric}: ${r.value} (${r.status})`).join('\n')
    : 'No readings recorded today.'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `You are Sathi, a caring health assistant. Generate a daily health update for ${input.childName} about their parent ${input.parentName}.

Date: ${input.date}
Parent's conditions: ${input.conditions.join(', ') || 'None specified'}

Today's readings:
${readingsText}
${input.missedReadings.length > 0 ? `Missing readings: ${input.missedReadings.join(', ')}` : ''}

Return ONLY valid JSON (no markdown):
{
  "summary_text": "3-5 sentences. Warm, clear tone. Note any concerns calmly. End with a practical tip if needed. Written to the NRI child. Keep under 120 words.",
  "summary_short": "One sentence summary for notification preview. Under 20 words.",
  "health_score": number from 0-100 based on readings and trends,
  "has_concerns": boolean,
  "concern_level": "normal" | "watch" | "alert" | "urgent"
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  try {
    return JSON.parse(text)
  } catch {
    return {
      summary_text: `${input.parentName} completed their health check-in today. All readings have been recorded.`,
      summary_short: `${input.parentName}'s daily health check-in is complete.`,
      health_score: 75,
      has_concerns: false,
      concern_level: 'normal',
    }
  }
}

// ─── AI Companion chat ─────────────────────────────────────────────────────

export async function companionChat(
  message: string,
  parentName: string,
  conditions: string[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    system: `You are Sathi, a warm and friendly health companion for ${parentName}.
They are an elderly person${conditions.length ? ` managing ${conditions.join(', ')}` : ''}.
Keep responses short (2-3 sentences max), simple, and encouraging.
You can answer basic health questions but always recommend consulting a doctor for medical advice.
Never be alarmist. Be like a caring friend.`,
    messages: [{ role: 'user', content: message }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : 'I am here for you. How can I help?'
}
