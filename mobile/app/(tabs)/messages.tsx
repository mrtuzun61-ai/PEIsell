import { StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <Text style={styles.empty}>Your conversations will appear here.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '800' },
  empty: { marginTop: 24, color: '#666' },
});
