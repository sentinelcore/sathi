import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractHealthReading } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageUrl, metricHint } = await request.json()
  if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 })

  try {
    const result = await extractHealthReading(imageUrl)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[OCR] Failed:', err)
    return NextResponse.json({ error: 'OCR failed' }, { status: 500 })
  }
}
