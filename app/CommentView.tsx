// app/comments.tsx

import { StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import CommentCard from '@/components/CommentCard';
import Colors from '@/constants/Colors';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import { CommonActions } from '@react-navigation/native';

// --- CONFIGURACIÓN GLOBAL ---
console.log('App Config Extra:', Constants.expoConfig?.extra);
const URL_BASE_BACKEND = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025'; // Considera si esta API_KEY también debería venir de Constants.expoConfig?.extra si cambia

// --- Interfaz para los datos del usuario actual ---
interface CurrentUserData {
    userId: string;
    username: string;
    photoUrl: string;
}

// --- Interfaz para los datos de un comentario (para el frontend) ---
interface Comment {
    id: string; // Mapea de review_id
    user: {
        username: string;
        avatarUrl: string;
    };
    text: string; // Mapea de comment
    rating: number;
}

// --- Interfaz para los datos de un comentario tal como vienen en el array 'reviews' de la receta ---
interface BackendComment {
    review_id: string;
    user_id: string;
    username: string;
    imageUrl: string; // ¡¡¡CAMBIO CLAVE AQUÍ!!!
    comment: string;
    rating: number;
    // Otros campos que tu backend pueda incluir, como 'timestamp'
}

// --- Interfaz para la estructura COMPLETA de la receta cuando se pide por ID ---
interface FullRecipeData {
    recipe_id: number;
    recipe_name: string;
    ingredients: any[];
    steps: any[];
    preparation_time: string;
    description: string;
    quantity_servings: number;
    type: string;
    reviews: BackendComment[]; // ¡Aquí está el array de comentarios!
    author: string;
    rating: number;
    photos: string[];
    videos?: string[];
}


export default function CommentsScreen() {

    const [commentText, setCommentText] = useState('');
    const [ratingInput, setRatingInput] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isUserLoading, setIsUserLoading] = useState(true); // Se usa para la carga del usuario/perfil
    const [currentUserData, setCurrentUserData] = useState<CurrentUserData | null>(null);
    const [isLoadingComments, setIsLoadingComments] = useState(true);
    const [commentsError, setCommentsError] = useState<string | null>(null);

    const { recipeId } = useLocalSearchParams<{ recipeId: string }>();

    const [asyncStorageUsername, setAsyncStorageUsername] = useState<string | null>(null);

    const navigation = useNavigation();

    // useEffect 1: Carga el username de AsyncStorage
    useEffect(() => {
        const fetchUsernameFromStorage = async () => {
            setIsUserLoading(true); // Inicia la carga del usuario
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                if (storedUsername) {
                    console.log('Username fetched from AsyncStorage:', storedUsername);
                    setAsyncStorageUsername(storedUsername);
                } else {
                    console.warn('No username found in AsyncStorage. User might not be logged in.');
                    setAsyncStorageUsername(null); // Asegurarse de que sea null si no hay username
                }
            } catch (error) {
                console.error('Error fetching username from AsyncStorage:', error);
                Alert.alert('Error', 'Ocurrió un error al leer tus datos de sesión.');
                setAsyncStorageUsername(null); // En caso de error, también lo ponemos en null
            } finally {
                // La carga del usuario se completará en el siguiente useEffect (fetchUserProfile)
                // setIsUserLoading(false); // No se pone aquí porque fetchUserProfile también usa este estado
            }
        };
        fetchUsernameFromStorage();
    }, []); // Se ejecuta solo una vez al montar el componente

    // useEffect 2: Obtiene los datos completos del perfil del usuario (si asyncStorageUsername está disponible)
    useEffect(() => {
        const fetchUserProfile = async (username: string) => {
            setIsUserLoading(true); // Asegura que el spinner esté activo
            try {
                if (!URL_BASE_BACKEND) {
                    throw new Error("EXPO_PUBLIC_BACKEND_URL not defined. Check your .env file and app.config.js.");
                }
                const profileUrl = `${URL_BASE_BACKEND}/user/profile/${username}`;
                console.log(`DEBUG_PROFILE_URL: ${profileUrl}`);
                console.log(`DEBUG_API_KEY_PROFILE_FETCH: ${API_KEY}`);

                const response = await axios.get(profileUrl, {
                    headers: { 'x-api-key': API_KEY },
                });

                if (response.data) {
                    const { user_id, username: fetchedUsername, photo } = response.data;
                    setCurrentUserData({
                        userId: String(user_id),
                        username: fetchedUsername,
                        photoUrl: photo || 'https://via.placeholder.com/150/EEEEEE/808080?text=No+Foto',
                    });
                    console.log("Current user data fetched:", { userId: user_id, username: fetchedUsername, photo });
                } else {
                    console.warn("No user profile data received for current user.");
                    setCurrentUserData(null);
                }
            } catch (error: any) {
                console.error('Error fetching current user data:', error);
                setCurrentUserData(null); // Limpiar datos de usuario en caso de error
            } finally {
                setIsUserLoading(false); // La carga del usuario ha terminado
            }
        };

        if (asyncStorageUsername) { // Solo intentar cargar el perfil si hay un username en AsyncStorage
            fetchUserProfile(asyncStorageUsername);
        } else {
            // Si no hay username en AsyncStorage, el usuario no está logueado
            setCurrentUserData(null);
            setIsUserLoading(false); // La carga del usuario ha terminado (no hay usuario)
        }
    }, [asyncStorageUsername, URL_BASE_BACKEND, API_KEY]); // Depende de asyncStorageUsername

    // Función para Cargar los comentarios de la receta desde el backend
    const fetchComments = useCallback(async () => {
        if (!recipeId) {
            console.warn("No recipeId disponible para cargar comentarios.");
            setCommentsError("No se pudo cargar la receta. Por favor, intente de nuevo.");
            setIsLoadingComments(false);
            return;
        }

        setIsLoadingComments(true);
        setCommentsError(null);
        const recipeUrl = `${URL_BASE_BACKEND}/recipe?ID=${recipeId}`;
        console.log(`DEBUG_RECIPE_URL_FETCH_COMMENTS: ${recipeUrl}`);
        console.log(`DEBUG_API_KEY_FETCH_COMMENTS: ${API_KEY}`);

        try {
            if (!URL_BASE_BACKEND) {
                throw new Error("EXPO_PUBLIC_BACKEND_URL not defined for recipe API.");
            }

            const response = await axios.get<FullRecipeData>(
                recipeUrl,
                {
                    headers: { 'x-api-key': API_KEY },
                }
            );

            console.log("Respuesta de la receta (incluyendo reviews) del backend:", response.data);

            if (response.status === 200 && response.data && Array.isArray(response.data.reviews)) {
                const backendReviews = response.data.reviews;

                const mappedComments: Comment[] = backendReviews.map(backendComment => ({
                    id: String(backendComment.review_id),
                    user: {
                        username: backendComment.username,
                        avatarUrl: backendComment.imageUrl || 'https://via.placeholder.com/50/CCCCCC/FFFFFF?text=User',
                    },
                    text: backendComment.comment,
                    rating: typeof backendComment.rating === 'string' ? parseInt(backendComment.rating, 10) : backendComment.rating,
                }));
                setComments(mappedComments);
            } else {
                setComments([]);
                setCommentsError("No se encontraron comentarios o hubo un problema al cargar la receta.");
            }
        } catch (error: any) {
            console.error('Error fetching recipe/comments:', error);
            setComments([]);
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.message, error.response?.status, error.response?.data);
                if (error.response?.status === 404) {
                    setCommentsError("La receta no fue encontrada o aún no tiene comentarios.");
                } else {
                    setCommentsError(error.response?.data?.message || 'Error de red al cargar la receta y comentarios.');
                }
            } else {
                setCommentsError('Error desconocido al cargar la receta y comentarios.');
            }
        } finally {
            setIsLoadingComments(false);
        }
    }, [recipeId, URL_BASE_BACKEND, API_KEY]);

    // useEffect para cargar comentarios de la receta cuando recipeId está disponible y el usuario terminó de cargar
    useEffect(() => {
        if (recipeId && !isUserLoading) { // Ahora depende de isUserLoading
            fetchComments();
        } else if (!recipeId) {
            console.warn("No se proporcionó un recipeId a la pantalla de comentarios.");
            Alert.alert("Error", "No se pudo cargar la receta. Por favor, intente de nuevo.");
            router.back();
        }
    }, [recipeId, isUserLoading, fetchComments]); // Depende de isUserLoading

    const handleGoBack = () => {
        router.back();
    };

    const handleSubmitComment = async () => {
        const parsedRating = parseInt(ratingInput, 10);

        // *** Verificar si currentUserData existe (lo que implica que el usuario está logueado) ***
        if (!currentUserData) {
            Alert.alert('Acceso Denegado', 'Necesitas iniciar sesión para enviar un comentario.');
            return;
        }

        if (commentText.trim().length === 0 || isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            Alert.alert('Error de entrada', 'Por favor, escribe un comentario y un rating válido (1-5).');
            return;
        }
        if (!recipeId) {
            Alert.alert('Error', 'No se pudo encontrar el ID de la receta para enviar el comentario.');
            return;
        }

        setIsSending(true);

        try {
            const payload = {
                user_id: currentUserData.userId,
                recipe_id: recipeId,
                username: currentUserData.username,
                comment: commentText.trim(),
                rating: String(parsedRating),
                imageurl: currentUserData.photoUrl,
            };

            const submitUrl = `${URL_BASE_BACKEND}/recipe/review`;
            console.log(`DEBUG_SUBMIT_URL: ${submitUrl}`);
            console.log(`DEBUG_PAYLOAD_SUBMIT:`, payload);
            console.log(`DEBUG_API_KEY_SUBMIT: ${API_KEY}`);

            const response = await axios.post(submitUrl, payload, {
                headers: { 'x-api-key': API_KEY },
            });

            console.log('Respuesta del servidor al enviar comentario:', response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Éxito', '¡Comentario enviado correctamente!');
                fetchComments();
                setCommentText('');
                setRatingInput('');
            } else {
                Alert.alert('Error al enviar', response.data?.message || 'Hubo un problema al enviar el comentario.');
            }
        } catch (error: any) {
            console.error('Error al enviar el comentario:', error);
            if (axios.isAxiosError(error)) {
                console.error('Axios error details:', error.message, error.response?.status, error.response?.data);
                Alert.alert('Error de red', error.response?.data?.message || 'No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                Alert.alert('Error desconocido', 'Ocurrió un error inesperado al enviar el comentario.');
            }
        } finally {
            setIsSending(false);
        }
    };

    // inputsDisabled ahora considera si el usuario está cargando o no hay datos de usuario
    const inputsDisabled = isSending || isUserLoading || !currentUserData;

    return (
        <KeyboardAvoidingView
            style={styles.fullScreenContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <Stack.Screen options={{ title: "Comentarios", headerTitleAlign: 'center', headerShown: false}} />
            <View style={styles.topBar}>
                <TouchableOpacity onPress={handleGoBack}>
                    <FontAwesome name="chevron-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comentarios</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

            {/* Manejo de estados de carga y error */}
            {isUserLoading || isLoadingComments ? ( // Si el usuario o los comentarios están cargando
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.light.tint} />
                    <Text style={{ marginTop: 10, color: Colors.light.text }}>
                        {isUserLoading ? "Cargando tus datos de sesión..." : "Cargando comentarios..."}
                    </Text>
                </View>
            ) : commentsError ? ( // Si hay un error al cargar comentarios
                <View style={styles.loadingOverlay}>
                    <Text style={[styles.messageText, { color: 'red' }]}>{commentsError}</Text>
                    <TouchableOpacity onPress={fetchComments} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            ) : ( // Contenido principal
                <>
                    {comments.length === 0 ? (
                        <View style={styles.loadingOverlay}>
                            <Text style={styles.messageText}>Sé el primero en comentar esta receta.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={comments}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => <CommentCard comment={item} />}
                            contentContainerStyle={styles.commentsListContent}
                            showsVerticalScrollIndicator={false}
                            style={styles.flatList}
                        />
                    )}

                    {/* *** NUEVO: Renderizado condicional del input de comentarios *** */}
                    {!currentUserData ? ( // Si no hay currentUserData (usuario no logueado)
                        <View style={styles.notLoggedInContainer}>
                            <Text style={styles.notLoggedInText}>
                                Inicia sesión para dejar tu comentario y calificación.
                            </Text>
                            <TouchableOpacity
                                style={styles.loginButton}
                                onPress={() => navigation.dispatch(
                                      CommonActions.reset({
                                        index: 0,
                                        routes: [
                                          { name: '(auth)' }, // Asegúrate de que '(auth)' sea el nombre correcto de tu grupo de rutas de autenticación
                                        ],
                                      })
                                    )} // O la ruta a tu pantalla de login
                            >
                                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    ) : ( // Si hay currentUserData (usuario logueado), muestra el input
                        <View style={styles.inputSectionContainer}>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Escribi tu comentario..."
                                placeholderTextColor={Colors.light.text}
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline={true}
                                editable={!inputsDisabled}
                            />
                            <TextInput
                                style={styles.ratingInput}
                                placeholder="Puntea!"
                                placeholderTextColor={Colors.light.text}
                                keyboardType="numeric"
                                maxLength={1}
                                value={ratingInput}
                                onChangeText={(text) => setRatingInput(text.replace(/[^1-5]/g, ''))}
                                editable={!inputsDisabled}
                            />
                            <TouchableOpacity onPress={handleSubmitComment} style={styles.submitButton} disabled={inputsDisabled}>
                                {isSending ? (
                                    <ActivityIndicator color={Colors.light.icon} />
                                ) : (
                                    <FontAwesome name="send" size={24} color={Colors.light.icon} />
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                    {/* *** FIN NUEVO *** */}
                </>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        padding: 20, // Añadir padding para que el texto no quede pegado a los bordes
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'regular',
        color: '#111',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 24,
    },
    flatList: {
        flex: 1,
    },
    commentsListContent: {
        paddingBottom: 20,
    },
    inputSectionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.light.background,
        borderTopWidth: 1,
        borderTopColor: Colors.light.buttonBorder,
    },
    commentInput: {
        flex: 1,
        backgroundColor: Colors.light.textInput,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        minHeight: 40,
        maxHeight: 100,
        fontSize: 12,
        color: Colors.light.text,
        marginRight: 10,
    },
    ratingInput: {
        width: 70,
        backgroundColor: Colors.light.textInput,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 10,
        height: 40,
        fontSize: 12,
        color: Colors.light.text,
        textAlign: 'center',
        marginRight: 10,
    },
    submitButton: {
        backgroundColor: Colors.light.button,
        borderRadius: 10,
        padding: 10,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 40,
    },
    messageText: {
        fontSize: 14,
        color: Colors.light.text,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: Colors.light.tint,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    // *** NUEVOS ESTILOS PARA USUARIO NO LOGUEADO ***
    notLoggedInContainer: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: Colors.light.cardBackground,
        borderTopWidth: 1,
        borderTopColor: Colors.light.buttonBorder,
    },
    notLoggedInText: {
        fontSize: 14,
        color: Colors.light.text,
        textAlign: 'center',
        marginBottom: 15,
    },
    loginButton: {
        backgroundColor: Colors.light.button,
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});