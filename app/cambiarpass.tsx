import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView, // Importar KeyboardAvoidingView
    Platform,             // Importar Platform
    ScrollView            // Importar ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors'; // Asegúrate de que esta ruta sea correcta
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Asegúrate de que estas variables de entorno estén configuradas en tu proyecto Expo
const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

export default function CambiarClaveScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const router = useRouter();

    const handlePasswordChange = async () => {
        setErrorMessage('');

        // Validaciones básicas
        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMessage('Por favor, complete todos los campos.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas nuevas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (currentPassword === newPassword) {
            setErrorMessage('La nueva contraseña debe ser diferente a la actual.');
            return;
        }

        setIsLoading(true);

        try {
            // Obtener el username del usuario logueado
            const username = await AsyncStorage.getItem('username');
            if (!username) {
                setErrorMessage('Error: Usuario no encontrado. Por favor, inicie sesión nuevamente.');
                setIsLoading(false);
                return;
            }

            // Verificar la contraseña actual
            // Nota: Es mejor tener un endpoint de verificación de contraseña actual separado
            // en lugar de usar /user/login, por razones de seguridad y claridad de la API.
            // Para este ejemplo, sigo tu lógica existente.
            const loginResponse = await axios.post(
                `${URL_PUBLICA}/user/login`,
                {
                    username: username,
                    password: currentPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                    },
                }
            );

            // Asumiendo que el loginResponse.data es true/false o un objeto de usuario
            // si la contraseña es correcta, y false/nulo/error si es incorrecta.
            if (!loginResponse.data) {
                setErrorMessage('La contraseña actual es incorrecta.');
                setIsLoading(false);
                return;
            }

            // Si llegamos aquí, la contraseña actual es correcta
            // Ahora cambiamos la contraseña
            const changeResponse = await axios.put(
                `${URL_PUBLICA}/user/password`,
                {
                    username: username,
                    new_password: newPassword,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                    },
                }
            );

            if (changeResponse.status === 200) {
                Alert.alert(
                    'Éxito',
                    'Su contraseña ha sido cambiada exitosamente.',
                    [
                        {
                            text: 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
            } else {
                setErrorMessage('Error al cambiar la contraseña. Intente nuevamente.');
            }

        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    setErrorMessage('La contraseña actual es incorrecta.');
                    setCurrentPassword(''); // Limpiar la contraseña incorrecta
                } else if (error.response?.status === 404) {
                    setErrorMessage('Usuario no encontrado.');
                } else {
                    setErrorMessage(error.response?.data?.message || 'Error del servidor. Intente nuevamente.');
                }
            } else {
                setErrorMessage('Error de conexión. Verifique su internet.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => {
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            // 'padding' para iOS es común y 'height' o 'position' para Android
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // Offset adicional si el teclado sigue cubriendo en iOS.
            // Puedes ajustar este valor (ej. 60, 80) dependiendo de la altura de tu header y elementos.
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
            <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false }} />

            {/* Header que se mantiene fijo */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome name="chevron-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cambiar Clave</Text>
                <View style={styles.placeholder} /> {/* Placeholder para centrar el título */}
            </View>

            <View style={styles.divider} /> {/* Línea divisoria */}

            {/* ScrollView para el contenido del formulario que se ajustará con el teclado */}
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled" // Importante para que los botones y otros elementos respondan
            >
                <View style={styles.formContentInner}>
                    <Text style={styles.title}>Cambiar Contraseña</Text>
                    <Text style={styles.subtitle}>
                        Para tu seguridad, ingresa tu contraseña actual y define una nueva contraseña.
                    </Text>

                    {/* Contraseña Actual */}
                    <Text style={styles.label}>Contraseña actual</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Ingrese su contraseña actual..."
                            placeholderTextColor="#888"
                            secureTextEntry={!showCurrentPass}
                            value={currentPassword}
                            onChangeText={(text) => {
                                setCurrentPassword(text);
                                clearError();
                            }}
                            editable={!isLoading}
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => setShowCurrentPass(!showCurrentPass)} style={styles.eyeIcon}>
                            <Ionicons name={showCurrentPass ? "eye" : "eye-off"} size={22} color="#a94442" />
                        </Pressable>
                    </View>

                    {/* Nueva Contraseña */}
                    <Text style={styles.label}>Nueva contraseña</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Ingrese su nueva contraseña..."
                            placeholderTextColor="#888"
                            secureTextEntry={!showNewPass}
                            value={newPassword}
                            onChangeText={(text) => {
                                setNewPassword(text);
                                clearError();
                            }}
                            editable={!isLoading}
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeIcon}>
                            <Ionicons name={showNewPass ? "eye" : "eye-off"} size={22} color="#a94442" />
                        </Pressable>
                    </View>

                    {/* Confirmar Nueva Contraseña */}
                    <Text style={styles.label}>Confirme la nueva contraseña</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Confirme su nueva contraseña..."
                            placeholderTextColor="#888"
                            secureTextEntry={!showConfirmPass}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                clearError();
                            }}
                            editable={!isLoading}
                            autoCapitalize="none"
                        />
                        <Pressable onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeIcon}>
                            <Ionicons name={showConfirmPass ? "eye" : "eye-off"} size={22} color="#a94442" />
                        </Pressable>
                    </View>

                    {errorMessage ? (
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    ) : null}

                    <TouchableOpacity
                        style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
                        onPress={handlePasswordChange}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: Colors.light.background,
        // Añadir paddingTop para manejar el notch/barra de estado si es necesario
        // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#111',
        textAlign: 'center',
    },
    placeholder: {
        width: 24, // Para equilibrar el ícono de la izquierda y centrar el título
    },
    divider: {
        backgroundColor: "#000",
        width: "100%",
        height: 1,
    },
    // Estilo para el contenedor de contenido del ScrollView
    scrollViewContent: {
        flexGrow: 1, // Permite que el contenido crezca y se haga scroll
        justifyContent: 'flex-start', // Alinea el contenido arriba
        // paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Opcional: añade padding inferior extra si el último elemento queda muy pegado al teclado
    },
    // Contenedor interno para aplicar padding horizontal al formulario
    formContentInner: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: 10,
        color: '#111',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 20,
    },
    label: {
        fontSize: 14,
        color: '#000000ff',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: Colors.light.textInput,
        borderRadius: 20,
        paddingHorizontal: 18,
        height: 46,
    },
    input: {
        fontSize: 14,
        color: '#111',
        paddingVertical: 12,
        // flex: 1 ya está en línea, no es necesario aquí si ya está.
    },
    eyeIcon: {
        padding: 5,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: -10,
        fontWeight: '500',
    },
    button: {
        backgroundColor: Colors.light.button,
        borderRadius: 15,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 20,
        height: 54,
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});