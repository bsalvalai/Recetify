import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inicio de sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingrese su nombre de usuario..."
        placeholderTextColor="#a94442"
        value={username}
        onChangeText={setUsername}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Ingrese su clave de ingreso..."
          placeholderTextColor="#a94442"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#111" />
        </Pressable>
      </View>

      <TouchableOpacity onPress={() => router.push('/(auth)/(recupero)/recupero')}>
        <Text style={styles.forgotText}>
          ¿Olvidaste tu clave de ingreso? Presiona aqui
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    marginBottom: 36,
    color: '#111',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFD6D6',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 18,
    width: '100%',
    color: '#111',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 18,
    top: 12,
  },
  forgotText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 28,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#D32F2F',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
});