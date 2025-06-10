import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState('www.imagenusuario.com/persona1');
  const [email, setEmail] = useState('Igonzalezr@gmail.com');
  const [username, setUsername] = useState('Igonzalezr02');

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} /> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>URL de imagen de perfil</Text>
          <TextInput
            style={styles.textInput}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="URL de imagen de perfil"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Correo electrónico</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Nombre de usuario</Text>
          <TextInput
            style={styles.textInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Nombre de usuario"
          />
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
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
    fontSize: 24,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  fieldContainer: {
    marginBottom: 30,
  },
  fieldLabel: {
    fontSize: 20,
    fontWeight: 'regular',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: Colors.light.textInput,
    padding: 15,
    borderRadius: 20,
    fontSize: 14,
    height: 40,
    color: '#000',
    textAlign: 'left',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  confirmButton: {
    height: 48,
    backgroundColor: '#D32F2F',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});