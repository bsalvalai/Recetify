import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import axios from 'axios';

const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'dapps1-2025';

export default function RecuperoClaveEmail({ navigation }: any) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleMailSender = () => {
    try{
      // Enviar el email al backend para el envío del código de recuperación
      axios.post(`${URL_PUBLICA}/user/password`, { 
        email: email,
       }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': `${API_KEY}`,
        },
      });
      console.log('Email enviado correctamente');
      router.push({pathname: "/(auth)/(recupero)/code", params: email}); // Redirigir a la pantalla de ingreso del código
    }
    catch (error) {
      console.error('Error al enviar el email:', error);
    }
    console.log('Email enviado a:', email);
  }
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
        onPress={handleMailSender}
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: '500', marginBottom: 35, color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#222', marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: Colors.light.textInput, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 14, marginBottom: 40, width: '100%', color: '#111' },
  button: { backgroundColor: Colors.light.button, borderRadius: 15, paddingVertical: 14, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});