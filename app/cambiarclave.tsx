import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CambiarClaveScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar clave</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.separator} />

      <View style={styles.content}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nueva clave</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••••"
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <FontAwesome 
                name={showNewPassword ? "eye" : "eye-slash"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Confirme la clave</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••••"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome 
                name={showConfirmPassword ? "eye" : "eye-slash"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningLabel}>Advertencia:</Text>
          <Text style={styles.warningText}>
            Vas a recibir un correo electrónico para confirmar el cambio de clave
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  separator: {
    height: 1,
    backgroundColor: '#CCC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  fieldContainer: {
    marginBottom: 40,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 15,
    textAlign: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD6D6',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#111',
  },
  eyeButton: {
    padding: 5,
  },
  warningContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  warningLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 5,
  },
  warningText: {    
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  nextButton: {
    backgroundColor: '#D32F2F',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});