import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function MyListingsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      router.replace('/auth/login?next=/my-listings');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    setItems(data ?? []);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('listings').update({ status }).eq('id', id);
    if (error) {
      Alert.alert('Could not update listing', error.message);
      return;
    }
    await load();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My listings</Text>
      <FlatList
        data={items}
        refreshing={loading}
        onRefresh={load}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Ready to sell something?</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => router.push(`/listing/${item.id}`)}>
              <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.meta}>{item.location_name} · {item.status}</Text>
            </Pressable>
            <View style={styles.actions}>
              {item.status === 'active' && (
                <Pressable style={styles.action} onPress={() => updateStatus(item.id, 'sold')}>
                  <Text style={styles.actionText}>Mark sold</Text>
                </Pressable>
              )}
              <Pressable style={styles.action} onPress={() => updateStatus(item.id, 'deleted')}>
                <Text style={[styles.actionText, styles.danger]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 18 },
  card: { borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 14, marginBottom: 12 },
  price: { fontSize: 18, fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '600', marginTop: 3 },
  meta: { color: '#777', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  action: { paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#f3f3f3' },
  actionText: { fontWeight: '700' },
  danger: { color: '#a31515' },
  empty: { color: '#777', marginTop: 20 },
});
