import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/chat/history
 * Save chat messages to Supabase for persistence.
 * Body: { sessionId: string, messages: Array<{role: string, content: string}> }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { sessionId, messages } = await request.json();

    if (!sessionId || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'sessionId and messages are required' }, { status: 400 });
    }

    // Upsert the chat session with latest messages
    const { error } = await supabase
      .from('chat_sessions')
      .upsert(
        {
          session_id: sessionId,
          messages: messages.slice(-50), // Keep last 50 messages
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      );

    if (error) {
      console.error('Failed to save chat history:', error);
      // Don't fail the request — chat should still work without persistence
      return NextResponse.json({ success: true, warning: 'History not saved' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat history save error:', error);
    return NextResponse.json({ success: true, warning: 'History not saved' });
  }
}

/**
 * GET /api/chat/history?sessionId=xxx
 * Load chat history from Supabase.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ messages: [] });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }

    const { data, error } = await supabase
      .from('chat_sessions')
      .select('messages')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: data.messages || [] });
  } catch {
    return NextResponse.json({ messages: [] });
  }
}
