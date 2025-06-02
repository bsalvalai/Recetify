import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function RecuperoClaveCodigo({ navigation }: any) {
  const [code, setCode] = useState('');

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
        onPress={() => navigation.navigate('newPass')}
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
  codeContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  codeInput: { backgroundColor: '#FFD6D6', borderRadius: 10, width: 38, height: 38, marginHorizontal: 4, textAlign: 'center', fontSize: 20, color: '#111' },
  resendText: { color: '#444', fontSize: 13, marginBottom: 24, textAlign: 'center' },
  button: { backgroundColor: '#D32F2F', borderRadius: 12, paddingVertical: 14, alignItems: 'center', width: '100%' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '500' },
});