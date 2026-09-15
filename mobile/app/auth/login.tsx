import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [busy, setBusy] = useState(false);

  function continueToRequestedAction() {
    if (next) router.replace(next as any);
    else router.replace('/(tabs)');
  }

  async function submit() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || password.length < 6) {
      Alert.alert('Check your details', 'Enter a valid email and a password with at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        continueToRequestedAction();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;

      if (data.session) {
        continueToRequestedAction();
      } else {
        Alert.alert('Check your email', 'Confirm your email, then come back and sign in.');
        setMode('signin');
      }
    } catch (e: any) {
      Alert.alert(mode === 'signin' ? 'Sign in failed' : 'Could not create account', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>ShootGo</Text>
      <Text style={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</Text>
      <Text style={styles.text}>
        Browsing is always open. Sign in only when you want to message, save or sell.
      </Text>

      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={submit} disabled={busy}>
        <Text style={styles.buttonText}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Text>
      </Pressable>

      <Pressable
        style={styles.switchButton}
        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        disabled={busy}
      >
        <Text style={styles.switchText}>
          {mode === 'signin' ? 'New to ShootGo? Create account' : 'Already have an account? Sign in'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76, backgroundColor: '#fff' },
  brand: { fontSize: 20, fontWeight: '900', marginBottom: 22 },
  title: { fontSize: 30, fontWeight: '800' },
  text: { color: '#666', marginTop: 10, marginBottom: 22, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14, marginBottom: 12 },
  button: { backgroundColor: '#111', marginTop: 2, padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '800' },
  switchButton: { paddingVertical: 18, alignItems: 'center' },
  switchText: { fontWeight: '700', color: '#444' },
});
