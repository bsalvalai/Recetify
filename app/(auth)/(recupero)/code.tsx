import Colors from '@/constants/Colors';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack, router, useRouter } from 'expo-router';
export default function RecuperoClaveCodigo({ navigation }: any) {
  const [code, setCode] = useState('');

  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recupero de clave</Text>
      <Text style={styles.subtitle}>Ingrese el codigo enviado por Mail para continuar</Text>
      <View style={styles.codeContainer}>
        {[...Array(6)].map((_, i) => (
          <TextInput
            key={i}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="number-pad"
            value={code[i] || ''}
            onChangeText={text => {
              let newCode = code.split('');
              newCode[i] = text;
              setCode(newCode.join(''));
            }}
          />
        ))}
      </View>
      <Text style={styles.resendText}>
        No recibiste el código? Presione aquí{'\n'}Para enviar nuevamente
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/(recupero)/newPass')}
      >
        <Text style={styles.buttonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background, alignItems: 'center', marginHorizontal: 16, justifyContent: 'center', marginBottom: 100 },
  title: { fontSize: 24, fontWeight: '500', marginBottom: 40, color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#000', marginBottom: 30, textAlign: 'center' },
  codeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  codeInput: { backgroundColor: Colors.light.textInput, borderRadius: 10, width: 30, height: 40, marginHorizontal: 10, textAlign: 'center', fontSize: 20, color: '#000'},
  resendText: { color: '#444', fontSize: 14, marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: Colors.light.button, borderRadius: 15, paddingVertical: 14, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});