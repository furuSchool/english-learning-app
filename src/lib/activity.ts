import { createClient } from '@/lib/supabase/client'

export async function incrementActivityLog(): Promise<void> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  await supabase.rpc('increment_activity', { p_date: today })
}

export async function getActivityLogs(days = 365) {
  const supabase = createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('activity_logs')
    .select('date, task_count')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return data || []
}
