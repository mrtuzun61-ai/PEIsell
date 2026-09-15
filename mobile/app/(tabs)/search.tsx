import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput placeholder="Search ShootGo…" style={styles.input} />
      <Text style={styles.help}>Keyword, location, radius and price filters can be wired to Supabase queries here.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  input: { marginTop: 16, borderWidth: 1, borderColor: '#ddd', borderRadius: 14, padding: 14 },
  help: { marginTop: 16, color: '#666' },
});
