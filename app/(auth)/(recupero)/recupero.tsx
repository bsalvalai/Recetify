import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function RecuperoClaveEmail({ navigation }: any) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  
  //Despues ver que onda la parte visual y tratar de sacarle el header
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.subtitle}>Ingrese su email registrado en la cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Ingrese su email..."
        placeholderTextColor="#000"
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 35,
    color: '#000',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#222',
    marginBottom: 40,
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 40,
    width: '100%',
    color: '#111'
  },
  button: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    width: '100%',
    height: 54,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
});