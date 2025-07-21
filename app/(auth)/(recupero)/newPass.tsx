import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import axios from 'axios';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'dapps1-2025';

export default function RecuperoClaveNueva() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const handleNext = async () => {
    try {
      if (password !== confirm) {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
        return;
      }
      if (!password || !confirm) {
        Alert.alert('Error', 'Por favor, complete todos los campos.');
        return;
      }

      const response = await axios.put(`${URL_PUBLICA}/user/password`, {
        username: params.username,
        new_password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      })

      await AsyncStorage.setItem('username', Array.isArray(params.username) ? params.username[0] : params.username as string);
      navigation.dispatch(
          CommonActions.reset({
          index: 0, // El índice de la ruta activa en la nueva pila
          routes: [
            { name: '(tabs)' }, // La única ruta en la nueva pila será 'Home'
          ],
          })
      ); // Redirige a la sección de tabs
      return;
    } catch (error) {
      console.error('Error al enviar la nueva contraseña:', error);
      Alert.alert('Error', 'Ocurrió un error al enviar la nueva contraseña. Por favor, inténtelo de nuevo más tarde.');
    }
  }
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.label}>Nueva clave</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nueva clave..."
          placeholderTextColor= {Colors.light.text}
          secureTextEntry={!showPass}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
          <Ionicons name={showPass ? "eye" : "eye-off"} size={24} color="#a94442" />
        </Pressable>
      </View>
      <Text style={styles.label}>Confirme la clave</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Confirme la clave..."
          placeholderTextColor= {Colors.light.text}
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
        />
        <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
          <Ionicons name={showConfirm ? "eye" : "eye-off"} size={24} color="#a94442" />
        </Pressable>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingBottom: 100},
  title: { fontSize: 20, fontWeight: '500', marginBottom: 40, color: '#111', textAlign: 'center' },
  label: { fontSize: 16, color: '#000', marginBottom: 10, fontWeight: '500'},
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 15},
  input: { backgroundColor: Colors.light.textInput, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 12, color: '#111', height: 46 },
  eyeIcon: { position: 'absolute', right: 10},
  button: { backgroundColor: Colors.light.button, borderRadius: 15, paddingVertical: 18, alignItems: 'center', width: '100%', marginTop: 25, height: 54, justifyContent: "center"},
  buttonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});