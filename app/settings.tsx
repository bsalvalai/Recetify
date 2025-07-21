import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions, useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Está seguro que desea cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpiar AsyncStorage
              await AsyncStorage.removeItem('username');
              // Actualizar contexto de autenticación
              logout();
              // Navegar a login
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: '(auth)' }],
                })
              );
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
              Alert.alert('Error', 'Ocurrió un error al cerrar sesión.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} /> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuracion</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/ayuda')}>
          <Text style={styles.buttonText}>Ayuda</Text>
          <FontAwesome name="info-circle" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/editarperfil')}>
          <Text style={styles.buttonText}>Editar Perfil</Text>
          <FontAwesome name="pencil" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/cambiarclave')}>
          <Text style={styles.buttonText}>Cambiar clave</Text>
          <FontAwesome name="refresh" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Cerrar sesion</Text>
          <FontAwesome name="sign-out" size={20} color="#111" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Eliminar perfil</Text>
          <FontAwesome name="trash" size={20} color="#111" style={styles.icon} />
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
    fontSize: 20,
    fontWeight: 'regular',
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
  buttonsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    width: '100%',
    height: 56,
  },
  buttonText: {
    fontSize: 14,
    color: '#111',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  icon: {
    position: 'absolute',
    right: 18,
  },
});