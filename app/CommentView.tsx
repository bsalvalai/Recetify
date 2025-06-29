// app/comments.tsx
import { StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import CommentCard from '@/components/CommentCard';
import Colors from '@/constants/Colors';
import { useState, useEffect, useRef } from 'react'; // <-- ADD useRef
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIGURACIÓN GLOBAL ---
// Asegúrate de que esta URL sea la IP local de tu máquina, no 'localhost'
// Por ejemplo: 'http://192.168.0.100:8080'
const URL_BASE_BACKEND = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8080'; // <-- VERIFICA ESTA URL EN app.config.js o .env
const API_KEY = 'dapps1-2025'; // Tu API Key

// --- Interfaz para los datos del usuario actual (similar a UserProfile en UserScreen) ---
interface CurrentUserData {
  userId: string; // user_id del backend
  username: string;
  photoUrl: string; // URL de la foto para el avatar
}

// --- Interfaz para los datos de un comentario ---
interface Comment {
  id: string;
  user: {
    username: string;
    avatarUrl: string;
  };
  text: string;
  rating: number;
}

// --- Datos de ejemplo de comentarios (se cargarían de la API en producción) ---
const mockComments: Comment[] = [
  { id: '1', user: { username: 'lg123', avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' }, text: 'Recetaza! Me quedo muy rico y terminamos comiendo todos', rating: 4, },
  { id: '2', user: { username: 'rama_202', avatarUrl: 'https://randomuser.me/api/portraits/men/2.jpg' }, text: 'A mi familia le encanto! Gracias!!', rating: 3, },
  { id: '3', user: { username: 'valenciok', avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg' }, text: 'Quedo rico aunque quizas hubiera quedado mejor si se le agregara un poco de cebolla...', rating: 2, },
  { id: '4', user: { username: 'soymicaela1', avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg' }, text: 'Excelente receta', rating: 4, },
  { id: '5', user: { username: 'tramand.ok', avatarUrl: 'https://randomuser.me/api/portraits/men/5.jpg' }, text: 'Muy rico y muy claros los pasos!', rating: 4, },
];

export default function CommentsScreen() {
  const [commentText, setCommentText] = useState('');
  const [ratingInput, setRatingInput] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [isSending, setIsSending] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState<CurrentUserData | null>(null);

  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();

  // Nuevo estado para almacenar el username de AsyncStorage, similar a UserScreen
  const [asyncStorageUsername, setAsyncStorageUsername] = useState<string | null>(null);

  // useEffect 1: Carga el username de AsyncStorage (se ejecuta una vez al montar)
  useEffect(() => {
    const fetchUsernameFromStorage = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          console.log('Username fetched from AsyncStorage:', storedUsername);
          setAsyncStorageUsername(storedUsername);
        } else {
          console.warn('No username found in AsyncStorage. User might not be logged in.');
          Alert.alert("Error de autenticación", "No se encontró el usuario. Por favor, inicie sesión.");
          setIsUserLoading(false); // No hay usuario para cargar
          // router.replace('/login'); // Opcional: Redirigir al login
        }
      } catch (error) {
        console.error('Error fetching username from AsyncStorage:', error);
        Alert.alert('Error', 'Ocurrió un error al leer tus datos de sesión.');
        setIsUserLoading(false); // Manejar el error de lectura
      }
    };

    fetchUsernameFromStorage();
  }, []); // Dependencia vacía: se ejecuta una vez al montar

  // useEffect 2: Obtiene los datos completos del perfil del usuario cuando asyncStorageUsername está disponible
  useEffect(() => {
    const fetchUserProfile = async (username: string) => {
      setIsUserLoading(true); // Inicia la carga del usuario
      try {
        if (!URL_BASE_BACKEND) {
          throw new Error("EXPO_PUBLIC_BACKEND_URL not defined. Check your .env file and app.config.js.");
        }

        console.log(`Fetching profile for: ${username} from ${URL_BASE_BACKEND}/user/profile/${username}`);
        const response = await axios.get(`${URL_BASE_BACKEND}/user/profile/${username}`, {
          headers: { 'x-api-key': API_KEY },
        });

        if (response.data) {
          const { user_id, username: fetchedUsername, photo } = response.data; // Renombrar 'username' para evitar conflicto
          setCurrentUserData({
            userId: String(user_id),
            username: fetchedUsername,
            photoUrl: photo || 'https://via.placeholder.com/150/EEEEEE/808080?text=No+Foto',
          });
          console.log("Current user data fetched:", { userId: user_id, username: fetchedUsername, photo });
        } else {
          console.warn("No user profile data received for current user.");
          Alert.alert("Error de perfil", "No se pudieron cargar los datos de tu perfil.");
        }
      } catch (error: any) {
        console.error('Error fetching current user data:', error);
        if (axios.isAxiosError(error)) {
          Alert.alert('Error de red', error.response?.data?.message || 'No se pudo cargar tu perfil. Revisa tu conexión.');
        } else {
          Alert.alert('Error', 'Ocurrió un error inesperado al cargar tu perfil.');
        }
      } finally {
        setIsUserLoading(false); // Finaliza la carga del usuario
      }
    };

    if (asyncStorageUsername) { // Solo si ya tenemos el username de AsyncStorage
      fetchUserProfile(asyncStorageUsername);
    } else {
      // Si asyncStorageUsername es null (por ejemplo, no hay usuario logueado),
      // ya se manejó en el primer useEffect, o la carga ya terminó si no se encontró.
      // Aseguramos que el loading termine si no hay username.
      if (!isUserLoading && currentUserData === null) {
         // Esto es para cubrir el caso en que el primer useEffect ya marcó isUserLoading a false
         // pero no encontró un username.
      }
    }
  }, [asyncStorageUsername, URL_BASE_BACKEND, API_KEY]); // Depende de asyncStorageUsername, URL y API_KEY

  // useEffect para cargar comentarios de la receta (solo si tenemos recipeId y el usuario ya cargó)
  useEffect(() => {
    if (recipeId && !isUserLoading) {
      console.log(`Cargando comentarios para Recipe ID: ${recipeId}`);
      // Aquí iría tu lógica para cargar comentarios existentes desde un endpoint como /recipe/{id}/comments
      // fetchComments(recipeId); // Descomenta si implementas fetchComments
    } else if (!recipeId) {
      console.warn("No se proporcionó un recipeId a la pantalla de comentarios.");
      Alert.alert("Error", "No se pudo cargar la receta. Por favor, intente de nuevo.");
      router.back();
    }
  }, [recipeId, isUserLoading]); // Dependencias: recipeId y isUserLoading

  const handleGoBack = () => {
    router.back();
  };

  const handleSubmitComment = async () => {
    const parsedRating = parseInt(ratingInput, 10);

    // Validaciones
    if (!currentUserData) {
      Alert.alert('Error', 'No se pudieron cargar tus datos de usuario. Por favor, intenta de nuevo.');
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
      };

      console.log('Enviando comentario con payload:', payload);

      const response = await axios.post(`${URL_BASE_BACKEND}/recipe/review`, payload, {
        headers: { 'x-api-key': API_KEY },
      });

      console.log('Respuesta del servidor al enviar comentario:', response.data);

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', '¡Comentario enviado correctamente!');
        const newComment: Comment = {
          id: `temp-${Date.now()}`,
          user: { username: currentUserData.username, avatarUrl: currentUserData.photoUrl },
          text: commentText.trim(),
          rating: parsedRating,
        };
        setComments([newComment, ...comments]);
        setCommentText('');
        setRatingInput('');
      } else {
        Alert.alert('Error al enviar', response.data?.message || 'Hubo un problema al enviar el comentario.');
      }
    } catch (error: any) {
      console.error('Error al enviar el comentario:', error);
      if (axios.isAxiosError(error)) {
        Alert.alert('Error de red', error.response?.data?.message || 'No se pudo conectar con el servidor. Verifica tu conexión.');
      } else {
        Alert.alert('Error desconocido', 'Ocurrió un error inesperado al enviar el comentario.');
      }
    } finally {
      setIsSending(false);
    }
  };

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

      {isUserLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
          <Text style={{ marginTop: 10, color: Colors.light.text }}>Cargando tus datos...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <CommentCard comment={item} />}
            contentContainerStyle={styles.commentsListContent}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
          />

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
    fontSize: 24,
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
    fontSize: 14,
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
    fontSize: 14,
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
});