import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useNavigation } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
interface LoginRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  message?: string;
}

export default function LoginRequiredModal({ visible, onClose, message }: LoginRequiredModalProps) {
  const router = useRouter();
  const navigation = useNavigation();

  const handleGoToLogin = () => {
    onClose();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: '(auth)' }, // Asegúrate de que '(auth)' sea el nombre correcto de tu grupo de rutas de autenticación
        ],
      })
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Iniciar Sesión Requerido</Text>
          <Text style={styles.message}>
            {message || 'Debes iniciar sesión para acceder a esta funcionalidad.'}
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
              <Text style={styles.loginButtonText}>Ir al Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
