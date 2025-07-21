import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

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
      <TouchableOpacity style={styles.button}>
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
  input: { backgroundColor: Colors.light.textInput, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 12, fontSize: 14, color: '#111', height: 46 },
  eyeIcon: { position: 'absolute', right: 10},
  button: { backgroundColor: Colors.light.button, borderRadius: 15, paddingVertical: 18, alignItems: 'center', width: '100%', marginTop: 25, height: 54},
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});