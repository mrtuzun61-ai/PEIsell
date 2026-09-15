import { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fetchMessages, sendMessage, subscribeToConversation } from '@/services/messages';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [me, setMe] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function load() {
    if (!id) return;
    setMessages(await fetchMessages(id));
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? null));
    load().catch(console.error);
    if (!id) return;
    return subscribeToConversation(id, () => load().catch(console.error));
  }, [id]);

  async function submit() {
    if (!id || !body.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(id, body);
      setBody('');
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const mine = item.sender_id === me;
          return (
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
              <Text style={mine ? styles.mineText : styles.theirText}>{item.body}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Send the first message.</Text>}
      />
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          value={body}
          onChangeText={setBody}
          placeholder="Message…"
          multiline
          maxLength={4000}
        />
        <Pressable style={styles.send} onPress={submit} disabled={sending || !body.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, gap: 10, flexGrow: 1 },
  bubble: { maxWidth: '82%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { alignSelf: 'flex-end', backgroundColor: '#111' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#f1f1f1' },
  mineText: { color: '#fff' },
  theirText: { color: '#111' },
  empty: { textAlign: 'center', color: '#777', marginTop: 40 },
  composer: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#eee', padding: 10, alignItems: 'flex-end' },
  input: { flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 },
  send: { backgroundColor: '#111', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13 },
  sendText: { color: '#fff', fontWeight: '800' },
});
