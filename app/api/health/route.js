import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.from('_test').select('*').limit(1)

    return Response.json({
      status: 'ok',
      supabase: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    return Response.json({ status: 'error', message: e.message }, { status: 500 })
  }
}