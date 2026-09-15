import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { createDraft, publishListing } from '@/services/listings';
import { uploadListingImage } from '@/services/storage';
import { router } from 'expo-router';

export default function SellScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busy, setBusy] = useState(false);

  async function requireAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push('/auth/login?next=/(tabs)/sell');
      return false;
    }
    return true;
  }

  async function pickImage() {
    if (!(await requireAuth())) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled) setImageUri(res.assets[0].uri);
  }

  async function useLocation() {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Location permission denied', 'Enter your city or area manually.');
      return;
    }

    const p = await Location.getCurrentPositionAsync({});
    setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude });

    try {
      const places = await Location.reverseGeocodeAsync({ latitude: p.coords.latitude, longitude: p.coords.longitude });
      const first = places[0];
      const label = [first?.city, first?.region].filter(Boolean).join(', ');
      setLocationName(label || 'Current location');
    } catch {
      setLocationName('Current location');
    }
  }

  async function submit() {
    if (!(await requireAuth())) return;

    const numericPrice = Number(price);
    if (!imageUri || !title.trim() || !locationName.trim() || !Number.isFinite(numericPrice) || numericPrice < 0) {
      Alert.alert('Missing information', 'Add a photo, valid price, short title and location.');
      return;
    }

    setBusy(true);
    try {
      const draft = await createDraft({
        title: title.trim(),
        price: numericPrice,
        location_name: locationName.trim(),
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
      });

      await uploadListingImage(draft.id, imageUri, 0);
      const result = await publishListing(draft.id);

      if (result.published) {
        Alert.alert('Published', result.used_free_credit ? 'Your free listing is live for 30 days.' : 'Your listing is live for 30 days.');
        setImageUri(null);
        setPrice('');
        setTitle('');
        setLocationName('');
        setCoords(null);
        router.replace('/(tabs)');
        return;
      }

      if (result.payment_required) {
        Alert.alert(`Listing fee: $${result.fee} ${result.currency ?? 'CAD'}`, 'Your listing is saved as a draft. Payment checkout will be connected next; after verified payment it can be published.');
        return;
      }

      Alert.alert('Could not publish', 'Your listing is still saved as a draft.');
    } catch (e: any) {
      Alert.alert('Could not publish', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sell</Text>
      <Text style={styles.subtitle}>Photo → Price → Location → Sell</Text>
      <Pressable style={styles.photo} onPress={pickImage}>
        <Text>{imageUri ? 'Photo selected ✓' : 'Take / choose photo'}</Text>
      </Pressable>
      <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <TextInput style={styles.input} placeholder="Short title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="City / area" value={locationName} onChangeText={setLocationName} />
      <Pressable style={styles.secondary} onPress={useLocation}><Text>Use current location</Text></Pressable>
      <Pressable style={styles.publish} disabled={busy} onPress={submit}>
        <Text style={styles.publishText}>{busy ? 'Publishing…' : 'PUBLISH LISTING'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 60, paddingHorizontal: 18, paddingBottom: 100, backgroundColor: '#fff' },
  title: { fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#666', marginTop: 4, marginBottom: 24 },
  photo: { height: 180, borderRadius: 18, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, marginTop: 12 },
  secondary: { padding: 14, alignItems: 'center', marginTop: 8 },
  publish: { backgroundColor: '#111', borderRadius: 16, padding: 17, alignItems: 'center', marginTop: 18 },
  publishText: { color: '#fff', fontWeight: '800' },
});
