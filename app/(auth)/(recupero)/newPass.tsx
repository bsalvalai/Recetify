import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecuperoClaveNueva() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.label}>Nueva clave</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Nueva clave"
          placeholderTextColor="#a94442"
          secureTextEntry={!showPass}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeIcon}>
          <Ionicons name={showPass ? "eye-off" : "eye"} size={22} color="#a94442" />
        </Pressable>
      </View>
      <Text style={styles.label}>Confirme la clave</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Confirme la clave"
          placeholderTextColor="#a94442"
          secureTextEntry={!showConfirm}
          value={confirm}
          onChangeText={setConfirm}
        />
        <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
          <Ionicons name={showConfirm ? "eye-off" : "eye"} size={22} color="#a94442" />
        </Pressable>
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '500', marginBottom: 18, color: '#111', textAlign: 'center' },
  label: { fontSize: 15, color: '#222', marginBottom: 6, alignSelf: 'flex-start' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 14 },
  input: { backgroundColor: '#FFD6D6', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 16, color: '#111' },
  eyeIcon: { position: 'absolute', right: 18, top: 12 },
  button: { backgroundColor: '#D32F2F', borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '500' },
});