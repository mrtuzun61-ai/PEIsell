import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEmail(data.session?.user.email ?? null));
  }, []);

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Sign in to manage listings, messages and favorites.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.text}>{email}</Text>
      <Text style={styles.text}>Free listing eligibility and listing history can be shown here.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  text: { marginTop: 14, color: '#555' },
  button: { marginTop: 18, backgroundColor: '#111', padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
});
