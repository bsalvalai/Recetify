import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecuperoClaveEmail({ navigation }: any) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.subtitle}>Ingrese su email registrado en la cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su email"
        placeholderTextColor="#a94442"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/code')}
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '500', marginBottom: 18, color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#222', marginBottom: 18, textAlign: 'center' },
  input: { backgroundColor: '#FFD6D6', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, marginBottom: 24, width: '100%', color: '#111' },
  button: { backgroundColor: '#D32F2F', borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '500' },
});