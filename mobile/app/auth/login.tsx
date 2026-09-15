import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendMagicLink() {
    if (!email.trim()) return;
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }
    Alert.alert('Check your email', 'Open the sign-in link to continue.');
    if (next) router.replace(next as any);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in to ShootGo</Text>
      <Text style={styles.text}>Browsing is free. Sign in only when you want to interact.</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={sendMagicLink} disabled={busy}>
        <Text style={styles.buttonText}>{busy ? 'Sending…' : 'Continue'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 80, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  text: { color: '#666', marginTop: 10, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14 },
  button: { backgroundColor: '#111', marginTop: 14, padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
