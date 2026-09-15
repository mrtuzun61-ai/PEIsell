import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    setEmail(user?.email ?? null);

    if (!user) {
      setProfile(null);
      return;
    }

    const { data: row } = await supabase
      .from('profiles')
      .select('display_name, free_period_ends_at, free_listings_used, created_at')
      .eq('id', user.id)
      .single();

    setProfile(row ?? null);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function signOut() {
    await supabase.auth.signOut();
    setEmail(null);
    setProfile(null);
  }

  if (!email) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Sign in to message sellers, save items and publish listings.</Text>
        <Pressable style={styles.button} onPress={() => router.push('/auth/login')}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }

  const remaining = Math.max(0, 3 - Number(profile?.free_listings_used ?? 0));
  const stillInFreePeriod = profile?.free_period_ends_at
    ? new Date(profile.free_period_ends_at).getTime() > Date.now()
    : false;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.name}>{profile?.display_name || 'ShootGo member'}</Text>
      <Text style={styles.text}>{email}</Text>

      {stillInFreePeriod && (
        <View style={styles.freeCard}>
          <Text style={styles.freeTitle}>{remaining} free listing{remaining === 1 ? '' : 's'} remaining</Text>
          <Text style={styles.freeText}>Your new-user free period is active.</Text>
        </View>
      )}

      <Pressable style={styles.menu} onPress={() => router.push('/my-listings')}>
        <Text style={styles.menuText}>My listings</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <Pressable style={styles.menu} onPress={() => router.push('/saved')}>
        <Text style={styles.menuText}>Saved items</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>
      <Pressable style={styles.menu} onPress={() => router.push('/(tabs)/messages')}>
        <Text style={styles.menuText}>Messages</Text>
        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable style={styles.signOut} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '800', marginTop: 20 },
  text: { marginTop: 6, color: '#666' },
  button: { marginTop: 18, backgroundColor: '#111', padding: 15, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  freeCard: { marginTop: 22, backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16 },
  freeTitle: { fontWeight: '800', fontSize: 17 },
  freeText: { color: '#666', marginTop: 4 },
  menu: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: '#eee' },
  menuText: { fontSize: 16, fontWeight: '700' },
  arrow: { fontSize: 28, color: '#999' },
  signOut: { marginTop: 28, paddingVertical: 14 },
  signOutText: { color: '#a31515', fontWeight: '800' },
});
