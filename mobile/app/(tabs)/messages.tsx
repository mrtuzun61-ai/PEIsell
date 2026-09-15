import { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { fetchConversations } from '@/services/messages';

export default function MessagesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const ok = !!data.session;
    setSignedIn(ok);
    if (!ok) {
      setItems([]);
      return;
    }
    setItems(await fetchConversations());
  }, []);

  useFocusEffect(useCallback(() => { load().catch(console.error); }, [load]));
  useEffect(() => { load().catch(console.error); }, [load]);

  if (signedIn === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.empty}>Sign in to message sellers.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/auth/login?next=/(tabs)/messages')}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Your conversations will appear here.</Text>}
        renderItem={({ item }) => {
          const listing = item.listings;
          const msgs = [...(item.messages ?? [])].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
          const last = msgs[0];
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/conversation/${item.id}`)}>
              <View style={styles.thumb}><Text>Photo</Text></View>
              <View style={styles.textWrap}>
                <Text style={styles.name} numberOfLines={1}>{listing?.title ?? 'Listing'}</Text>
                <Text style={styles.preview} numberOfLines={1}>{last?.body ?? 'Start conversation'}</Text>
              </View>
              <Text style={styles.price}>{listing?.price != null ? `$${listing.price}` : ''}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  list: { paddingTop: 16, paddingBottom: 110 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  thumb: { width: 58, height: 58, borderRadius: 12, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
  name: { fontWeight: '800', fontSize: 15 },
  preview: { color: '#666', marginTop: 4 },
  price: { fontWeight: '800' },
  empty: { marginTop: 28, color: '#666' },
  button: { marginTop: 18, backgroundColor: '#111', padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
