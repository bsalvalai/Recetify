import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Image, Platform, KeyboardAvoidingView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

import Colors from '@/constants/Colors'; 
import axios from 'axios';

// --- Definición de la Interfaz UserProfile ---
interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    photo?: string;
    phone?: string;
    birthdate?: string;
    role?: string;
}

// --- Constantes para la URL del Backend y API Key ---
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

export default function EditarPerfilScreen() {
    const router = useRouter();
    
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Estados para los campos editables del perfil
    const [editableImageUrl, setEditableImageUrl] = useState('https://placehold.co/150x150/cccccc/333333?text=Cargando...'); 
    const [editableEmail, setEditableEmail] = useState('');
    const [editableUsername, setEditableUsername] = useState(''); // Nuevo estado para el username editable

    // --- useEffect para cargar el nombre de usuario desde AsyncStorage ---
    useEffect(() => {
        const loadUsername = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username'); 
                if (storedUsername) {
                    setCurrentUsername(storedUsername);
                    console.log(`EditarPerfilScreen: Username cargado de AsyncStorage: ${storedUsername}`);
                } else {
                    console.log("EditarPerfilScreen: No se encontró username en AsyncStorage.");
                    setProfileError("No se encontró usuario logueado. Por favor, inicia sesión.");
                    setIsProfileLoading(false); 
                }
            } catch (error) {
                console.error("EditarPerfilScreen: Error al cargar username de AsyncStorage:", error);
                setProfileError("Error al cargar la sesión del usuario.");
                setIsProfileLoading(false);
            }
        };

        loadUsername();
    }, []); 

    // --- useEffect para cargar el perfil del usuario (depende de currentUsername) ---
    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log("EditarPerfilScreen: Iniciando fetchUserProfile.");

            if (!currentUsername) {
                console.log("EditarPerfilScreen: currentUsername es nulo, esperando a que se cargue.");
                setIsProfileLoading(true); 
                return;
            }

            if (!URL_PUBLICA) {
                console.error("EditarPerfilScreen: EXPO_PUBLIC_BACKEND_URL no está definido.");
                setProfileError("Error de configuración: URL del backend no definida.");
                setIsProfileLoading(false);
                return;
            }
            if (!API_KEY) {
                console.error("EditarPerfilScreen: EXPO_PUBLIC_API_KEY no está definido.");
                setProfileError("Error de configuración: API Key no definida.");
                setIsProfileLoading(false);
                return;
            }

            setIsProfileLoading(true);
            setProfileError(null);

            try {
                const url = `${URL_PUBLICA}/user/profile/${currentUsername}`;
                console.log(`EditarPerfilScreen: Intentando cargar perfil para: ${currentUsername} desde ${url}`);
                
                const response = await axios.get<UserProfile>(url, {
                    headers: { 'x-api-key': API_KEY },
                });

                console.log("EditarPerfilScreen: Respuesta de la API de perfil:", response.data);
                if (response.data) {
                    setUserProfile(response.data);
                    setEditableImageUrl(response.data.photo || 'https://placehold.co/150x150/cccccc/333333?text=Sin+Imagen');
                    setEditableEmail(response.data.email || '');
                    setEditableUsername(response.data.username); // Inicializa el campo editable con el username actual
                    console.log("EditarPerfilScreen: Perfil de usuario cargado exitosamente:", response.data);
                } else {
                    console.log("EditarPerfilScreen: No se recibieron datos de perfil del usuario desde la API.");
                    setUserProfile(null);
                    setProfileError("No se encontraron datos de perfil para este usuario.");
                    setEditableImageUrl('https://placehold.co/150x150/cccccc/333333?text=Sin+Imagen'); 
                }
            } catch (error) {
                console.error("EditarPerfilScreen: Error al cargar el perfil del usuario:", error);
                setUserProfile(null);
                setEditableImageUrl('https://placehold.co/150x150/cccccc/333333?text=Error+carga'); 
                if (axios.isAxiosError(error)) {
                    console.error("EditarPerfilScreen: Detalles del error Axios:", error.response?.data, error.response?.status);
                    if (error.response?.status === 404) {
                        setProfileError(`Usuario '${currentUsername}' no encontrado. Verifica el nombre de usuario.`);
                    } else {
                        setProfileError(error.response?.data?.message || error.message || `Error al cargar el perfil. Código: ${error.response?.status || 'N/A'}`);
                    }
                } else {
                    setProfileError("Error desconocido al cargar el perfil.");
                }
            } finally {
                setIsProfileLoading(false);
                console.log("EditarPerfilScreen: Carga de perfil finalizada.");
            }
        };

        if (currentUsername) {
            fetchUserProfile();
        }
    }, [currentUsername, URL_PUBLICA, API_KEY]); 

    // --- Función para manejar el guardado/actualización del perfil ---
    const handleUpdateProfile = async () => {
        console.log("EditarPerfilScreen: Iniciando actualización de perfil.");

        if (!currentUsername || !userProfile) {
            Alert.alert('Error', 'No se pudo cargar la información del usuario.');
            console.error("EditarPerfilScreen: No hay currentUsername o userProfile para actualizar.");
            return;
        }
        if (!editableEmail.trim()) {
            Alert.alert('Error', 'El correo electrónico es obligatorio.');
            console.error("EditarPerfilScreen: Email vacío.");
            return;
        }
        if (!editableUsername.trim()) {
            Alert.alert('Error', 'El nombre de usuario no puede estar vacío.');
            console.error("EditarPerfilScreen: Nombre de usuario vacío.");
            return;
        }

        setIsSavingProfile(true);
        try {
            let finalUsername = userProfile.username; // Por defecto, usa el username original
            let shouldUpdateUsernameInBackend = false;

            // Paso 1: Verificar si el nombre de usuario ha cambiado
            if (editableUsername.trim() !== userProfile.username) {
                console.log(`EditarPerfilScreen: El nombre de usuario ha cambiado de '${userProfile.username}' a '${editableUsername.trim()}'.`);
                try {
                    // Intenta obtener el perfil con el nuevo nombre de usuario.
                    await axios.get(`${URL_PUBLICA}/user/profile/${editableUsername.trim()}`, {
                        headers: { 'x-api-key': API_KEY },
                    });
                    // Si llegamos aquí, la solicitud GET tuvo éxito (código 200),
                    // lo que significa que el nuevo nombre de usuario YA EXISTE.
                    Alert.alert('Error', `El nombre de usuario '${editableUsername.trim()}' ya está en uso. Por favor, elige otro.`);
                    setIsSavingProfile(false);
                    return; // Detiene el proceso de actualización
                } catch (error: any) {
                    if (axios.isAxiosError(error) && error.response?.status === 404) {
                        // ¡Excelente! El nuevo nombre de usuario NO EXISTE, lo que significa que está disponible.
                        console.log(`EditarPerfilScreen: Nuevo nombre de usuario '${editableUsername.trim()}' disponible (recibido 404).`);
                        finalUsername = editableUsername.trim(); // Usaremos este nuevo nombre
                        shouldUpdateUsernameInBackend = true;
                    } else {
                        // Otro tipo de error al verificar la disponibilidad (ej. 500 del servidor)
                        console.error('EditarPerfilScreen: Error inesperado al verificar disponibilidad del nombre de usuario:', error);
                        Alert.alert('Error', `Error al verificar la disponibilidad del nombre de usuario: ${error.response?.data?.message || 'Error desconocido'}`);
                        setIsSavingProfile(false);
                        return;
                    }
                }
            }

            // Paso 2: Preparar los datos para la actualización del perfil
            const updatedProfileData: Partial<UserProfile> = {
                email: editableEmail.trim(),
                photo: editableImageUrl.trim(),
                // Otros campos que quieras actualizar (ej. phone, birthdate)
            };

            // Si el nombre de usuario cambió y está disponible, lo incluimos en los datos a enviar
            if (shouldUpdateUsernameInBackend) {
                updatedProfileData.username = finalUsername;
            }

            console.log("EditarPerfilScreen: Datos a enviar para actualizar perfil (PUT):", JSON.stringify(updatedProfileData, null, 2));

            // Paso 3: Realizar la petición PUT al backend
            // El endpoint PUT /user/profile/:username debería aceptar el username original en la URL
            // y el nuevo username (si cambió) en el cuerpo.
            const url = `${URL_PUBLICA}/user/profile/${currentUsername}`; 
            console.log("EditarPerfilScreen: Intentando PUT a la URL:", url);

            const response = await axios.put(url, updatedProfileData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
            });

            console.log("EditarPerfilScreen: Perfil actualizado exitosamente. Respuesta:", response.data);
            
            // Paso 4: Si el nombre de usuario se actualizó en el backend, también actualizarlo en AsyncStorage
            if (shouldUpdateUsernameInBackend) {
                await AsyncStorage.setItem('username', finalUsername);
                setCurrentUsername(finalUsername); // Actualiza el estado local para reflejar el cambio
                console.log(`EditarPerfilScreen: Username actualizado en AsyncStorage a: ${finalUsername}`);
            }

            Alert.alert('Éxito', 'Perfil actualizado correctamente', [{ text: 'OK', onPress: () => router.back() }]);

        } catch (error) {
            console.error("EditarPerfilScreen: Error al actualizar el perfil:", error);
            if (axios.isAxiosError(error)) {
                console.error("EditarPerfilScreen: Detalles del error Axios al actualizar:", error.response?.data, error.response?.status);
                Alert.alert('Error', error.response?.data?.message || error.message || `Error al actualizar el perfil. Código: ${error.response?.status || 'N/A'}`);
            } else {
                Alert.alert('Error', 'Ocurrió un error inesperado al actualizar el perfil.');
            }
        } finally {
            setIsSavingProfile(false);
            console.log("EditarPerfilScreen: Actualización de perfil finalizada.");
        }
    };

    // --- Renderizado Condicional (Cargando, Error, Contenido) ---
    if (isProfileLoading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint} />
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (profileError) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>{profileError}</Text>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!userProfile) { 
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>No se pudo cargar el perfil. Por favor, intenta nuevamente.</Text>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Define el comportamiento
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Ajusta este valor
        >
            <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="chevron-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar perfil</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.divider}></View>
            
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: editableImageUrl }} 
                        style={styles.profileImage}
                        onError={(e) => {
                            console.log("Error al cargar la imagen de perfil:", e.nativeEvent.error);
                            setEditableImageUrl(''); // Deja vacío para que el placeholder CSS se encargue
                        }}
                    />
                    <Text style={styles.usernameDisplay}>{userProfile.username}</Text>
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>URL de imagen de perfil</Text>
                    <TextInput
                        style={styles.textInput}
                        value={editableImageUrl} 
                        onChangeText={setEditableImageUrl}
                        placeholder="URL de imagen de perfil"
                        keyboardType="url"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Correo electrónico</Text>
                    <TextInput
                        style={styles.textInput}
                        value={editableEmail}
                        onChangeText={setEditableEmail}
                        placeholder="Correo electrónico"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.confirmButton, isSavingProfile && styles.confirmButtonDisabled]}
                    onPress={handleUpdateProfile}
                    disabled={isSavingProfile}
                >
                    {isSavingProfile ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.confirmButtonText}>Confirmar cambios</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: Colors.light.text,
    },
    errorText: {
        fontSize: 12,
        color: "red", 
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonPrimary: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginTop: 15,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.light.background ,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
    },
    headerTitle: {
        fontSize: 22,
        color: '#111',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
      width: 24,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.light.text, 
        width: '100%',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: Colors.light.tint, // Usar el color del tema
        marginBottom: 10,
    },
    usernameDisplay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    fieldContainer: {
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 10,
        textAlign: 'left',
    },
    textInput: {
        backgroundColor: Colors.light.textInput,
        borderRadius: 20,
        paddingHorizontal: 18,
        paddingVertical: 12,
        fontSize: 12,
        marginBottom: 40,
        width: '100%',
        height: 46,
        color: '#111',
      },
    disabledInput: {
        backgroundColor: '#e0e0e0',
        color: '#777',
    },
    hintText: {
        fontSize: 10,
        color: Colors.light.text,
        marginTop: 5,
        marginLeft: 5,
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
        paddingTop: 10,
    },
    confirmButton: {
        height: 48,
        backgroundColor: Colors.light.button, 
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    confirmButtonDisabled: {
        backgroundColor: '#90ee90',
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
});