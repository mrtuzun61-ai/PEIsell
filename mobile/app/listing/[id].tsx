import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { openConversation } from '@/services/messages';
import { publicListingImageUrl } from '@/services/storage';

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('listings')
      .select(`*, listing_images(storage_path, sort_order), profiles!listings_seller_id_fkey(display_name, created_at)`)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
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
    try {
      const conversationId = await openConversation(id!);
      router.push(`/conversation/${conversationId}`);
    } catch (e: any) {
      Alert.alert('Could not start chat', e?.message ?? 'Please try again.');
    }
  }

  if (!item) return <View style={styles.center}><Text>Loading…</Text></View>;

  const images = [...(item.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const hero = images[0]?.storage_path ? publicListingImageUrl(images[0].storage_path) : null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {hero ? <Image source={hero} style={styles.hero} contentFit="cover" /> : <View style={styles.heroPlaceholder}><Text>Product photo</Text></View>}
      <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>{item.location_name}</Text>
      {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
      <View style={styles.sellerBox}>
        <Text style={styles.sellerLabel}>Seller</Text>
        <Text style={styles.sellerName}>{item.profiles?.display_name || 'ShootGo seller'}</Text>
      </View>
      <Pressable style={styles.button} onPress={messageSeller}>
        <Text style={styles.buttonText}>MESSAGE SELLER</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 80, backgroundColor: '#fff' },
  hero: { width: '100%', aspectRatio: 1, backgroundColor: '#eee' },
  heroPlaceholder: { aspectRatio: 1, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  price: { fontSize: 30, fontWeight: '900', margin: 18, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', marginHorizontal: 18 },
  meta: { color: '#666', margin: 18, marginTop: 6 },
  desc: { marginHorizontal: 18, lineHeight: 22 },
  sellerBox: { marginHorizontal: 18, marginTop: 24, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 18 },
  sellerLabel: { color: '#777', fontSize: 12 },
  sellerName: { fontWeight: '800', fontSize: 16, marginTop: 3 },
  button: { margin: 18, marginTop: 28, backgroundColor: '#111', padding: 17, borderRadius: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
