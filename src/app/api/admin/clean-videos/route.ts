import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { CURATED_VIDEOS } from '@/lib/ted-talks'

function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * DELETE /api/admin/clean-videos
 * Removes all video_listening tasks whose youtube_id is NOT in the curated list.
 * Call this once to clean up Gemini-hallucinated video tasks already in the DB.
 */
export async function DELETE() {
  const supabase = createAdminClient()
  const validIds = CURATED_VIDEOS.map(v => v.youtube_id)

  // Fetch all video_listening tasks
  const { data: allVideos, error: fetchError } = await supabase
    .from('tasks')
    .select('id, content')
    .eq('type', 'video_listening')

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Filter to bad ones (youtube_id not in curated list)
  const badIds = (allVideos ?? [])
    .filter(t => {
      const content = t.content as { youtube_id?: string }
      return !content?.youtube_id || !validIds.includes(content.youtube_id)
    })
    .map(t => t.id)

  if (badIds.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'No invalid video tasks found.' })
  }

  const { error: deleteError } = await supabase
    .from('tasks')
    .delete()
    .in('id', badIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({
    deleted: badIds.length,
    message: `Deleted ${badIds.length} video_listening tasks with unverified YouTube IDs.`,
  })
}
