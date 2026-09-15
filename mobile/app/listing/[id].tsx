import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from('listings').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) console.error(error);
      else setItem(data);
    });
  }, [id]);

  async function messageSeller() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push(`/auth/login?next=/listing/${id}`);
      return;
    }
    Alert.alert('Messaging', 'Conversation creation is backed by the conversations/messages schema in the included migration.');
  }

  if (!item) return <View style={styles.center}><Text>Loading…</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}><Text>Product photo</Text></View>
      <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.location_name}</Text>
      {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
      <Pressable style={styles.button} onPress={messageSeller}>
        <Text style={styles.buttonText}>MESSAGE SELLER</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 80, backgroundColor: '#fff' },
  hero: { aspectRatio: 1, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  price: { fontSize: 30, fontWeight: '900', margin: 18, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', marginHorizontal: 18 },
  meta: { color: '#666', margin: 18, marginTop: 6 },
  desc: { marginHorizontal: 18, lineHeight: 22 },
  button: { margin: 18, marginTop: 28, backgroundColor: '#111', padding: 17, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
