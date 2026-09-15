import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { fetchSavedListings } from '@/services/favorites';
import { publicListingImageUrl } from '@/services/storage';

export default function SavedScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchSavedListings());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved</Text>
      <FlatList
        data={items}
        refreshing={loading}
        onRefresh={load}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Items you save will appear here.</Text>}
        renderItem={({ item }) => {
          const images = [...(item.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          const imageUrl = images[0]?.storage_path ? publicListingImageUrl(images[0].storage_path) : null;
          return (
            <Pressable style={styles.row} onPress={() => router.push(`/listing/${item.id}`)}>
              {imageUrl ? <Image source={imageUrl} style={styles.image} contentFit="cover" /> : <View style={styles.placeholder} />}
              <View style={styles.body}>
                <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
                <Text numberOfLines={1} style={styles.name}>{item.title}</Text>
                <Text numberOfLines={1} style={styles.meta}>{item.location_name}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 18 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'center' },
  image: { width: 90, height: 90, borderRadius: 14, backgroundColor: '#eee' },
  placeholder: { width: 90, height: 90, borderRadius: 14, backgroundColor: '#eee' },
  body: { flex: 1 },
  price: { fontSize: 18, fontWeight: '800' },
  name: { fontSize: 15, marginTop: 2 },
  meta: { fontSize: 12, color: '#777', marginTop: 4 },
  empty: { color: '#777', marginTop: 20 },
});
