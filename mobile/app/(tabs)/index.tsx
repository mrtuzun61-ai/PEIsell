import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { fetchActiveListings } from '@/services/listings';
import { publicListingImageUrl } from '@/services/storage';

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setItems(await fetchActiveListings());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <View style={styles.center}><Text>Loading products…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ShootGo</Text>
      <Text style={styles.location}>Atlantic Canada</Text>

      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>Nothing here yet. Be the first to sell something.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const images = [...(item.listing_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          const imageUrl = images[0]?.storage_path ? publicListingImageUrl(images[0].storage_path) : null;

          return (
            <Pressable style={styles.card} onPress={() => router.push(`/listing/${item.id}`)}>
              {imageUrl ? (
                <Image source={imageUrl} style={styles.image} contentFit="cover" transition={150} />
              ) : (
                <View style={styles.imagePlaceholder}><Text>Photo</Text></View>
              )}
              <Text style={styles.price}>{item.is_free ? 'FREE' : `$${item.price}`}</Text>
              <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.meta}>{item.location_name}</Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 14, backgroundColor: '#fff' },
  logo: { fontSize: 28, fontWeight: '800' },
  location: { marginTop: 2, marginBottom: 12, color: '#666' },
  list: { paddingBottom: 120 },
  row: { gap: 12 },
  card: { flex: 1, marginBottom: 18 },
  image: { width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: '#f1f1f1' },
  imagePlaceholder: { aspectRatio: 1, borderRadius: 16, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center' },
  price: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  title: { fontSize: 15, marginTop: 2 },
  meta: { fontSize: 12, color: '#777', marginTop: 2 },
  center: { padding: 30, alignItems: 'center', justifyContent: 'center' },
});
