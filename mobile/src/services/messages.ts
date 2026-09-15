import { supabase } from '@/lib/supabase';

export async function openConversation(listingId: string) {
  const { data, error } = await supabase.rpc('create_or_get_conversation', {
    p_listing_id: listingId,
  });
  if (error) throw error;
  return data as string;
}

export async function fetchConversations() {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      listing_id,
      buyer_id,
      seller_id,
      created_at,
      listings ( id, title, price, location_name, status ),
      messages ( id, body, sender_id, read_at, created_at )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(conversationId: string, body: string) {
  const text = body.trim();
  if (!text) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) throw new Error('Authentication required.');

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: text,
  });
  if (error) throw error;
}

export function subscribeToConversation(conversationId: string, onChange: () => void) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      onChange,
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
