// app/recipe-preview.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useVideoPlayer, VideoView } from 'expo-video';
import Constants from 'expo-constants';

import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// ** Importa CommonActions y useNavigationContainerRef **
import { CommonActions, useNavigationContainerRef } from '@react-navigation/native';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface StepData {
  description: string;
  mediaUrlInput: string;
  mediaType: 'image' | 'mp4-video' | null;
  displayMediaUrls: string[];
}

interface FullRecipeData {
  recipeName: string;
  coverImageUrl: string;
  briefDescription: string;
  dishType: string | null;
  ingredients: Ingredient[];
  steps: StepData[];
  createdByUsername?: string;
}

interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  photo: string; 
  phone: string;
  birthdate: string;
  role: string;
}

const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 16 * 2 - 15 * 2;

export default function RecipePreviewScreen() {
  const params = useLocalSearchParams();
  const recipeDataString = params.recipeData as string;
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // ** 1. Obtén la referencia al contenedor de navegación **
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    const fetchAndSetUsername = async () => {
      try {
        const usernameFromStorage = await AsyncStorage.getItem('username');
        if (usernameFromStorage) {
          console.log('Username fetched from AsyncStorage:', usernameFromStorage);
          setCurrentUsername(usernameFromStorage);
        } else {
          console.log('No username found in AsyncStorage. User might not be logged in.');
          setIsProfileLoading(false);
        }
      } catch (error) {
        console.error('Error fetching username from AsyncStorage:', error);
        setIsProfileLoading(false);
      }
    };
    fetchAndSetUsername();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUsername) {
        setIsProfileLoading(false);
        return;
      }
      setIsProfileLoading(true);
      setProfileError(null);

      try {
        if (!URL_PUBLICA) {
          throw new Error("EXPO_PUBLIC_BACKEND_URL not defined. Check your .env file and app.config.js.");
        }
        console.log(`Fetching profile for: ${currentUsername} from ${URL_PUBLICA}/user/profile/${currentUsername}`);
        
        const response = await axios.get<UserProfile>( 
          `${URL_PUBLICA}/user/profile/${currentUsername}`,
          {
            headers: { 'x-api-key': API_KEY },
          }
        );
        if (response.data) {
          setUserProfile(response.data);
          console.log("User profile fetched successfully:", response.data);
        } else {
          console.log("No user profile data received from API.");
          setUserProfile(null);
          setProfileError("No se encontraron datos de perfil.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        if (axios.isAxiosError(error)) {
          setProfileError(error.response?.data?.message || error.message || "Error al cargar el perfil.");
        } else {
          setProfileError("Error desconocido al cargar el perfil.");
        }
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchUserProfile();
  }, [currentUsername, URL_PUBLICA, API_KEY]);
  
  let recipe: FullRecipeData | null = null;
  try {
    if (recipeDataString) {
      recipe = JSON.parse(recipeDataString);
    }
  } catch (e) {
    console.error("Error parsing recipeData param:", e);
    Alert.alert("Error", "No se pudo cargar la previsualización de la receta.");
    router.back();
    return null;
  }

  if (!recipe) {
    return (
      <View style={styles.fullScreenContainer}>
        <Text style={styles.loadingText}>Cargando previsualización...</Text>
      </View>
    );
  }

  const transformRecipeForBackend = (
    frontendRecipe: FullRecipeData, 
    userId: number 
  ) => {
    return {
      recipe_name: frontendRecipe.recipeName,
      ingredients: frontendRecipe.ingredients.map(ing => ({
        ingredient_id: null,
        ingredient_name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
      })),
      steps: frontendRecipe.steps.map((step, index) => ({
        step_id: null,
        description: step.description,
        order: index + 1,
        photos: step.mediaType === 'image' ? step.displayMediaUrls : [],
        videos: step.mediaType === 'mp4-video' ? step.displayMediaUrls : [],
      })),
      preparation_time: "",
      quantity_servings: 0,
      description: frontendRecipe.briefDescription,
      type: frontendRecipe.dishType,
      photos: frontendRecipe.coverImageUrl ? [frontendRecipe.coverImageUrl] : [],
      user_id: userId,
    };
  };

  const handlePublish = async () => {
    if (isPublishing) return;

    if (!userProfile || !userProfile.user_id) {
      Alert.alert("Error de Publicación", "No se pudo obtener el ID del usuario. Por favor, asegúrate de estar logueado.");
      return;
    }
    if (!URL_PUBLICA) {
      Alert.alert("Error de Configuración", "La URL del backend no está definida. Contacta al soporte.");
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const recipePayload = transformRecipeForBackend(recipe, userProfile.user_id);
      console.log("Enviando receta al backend:", JSON.stringify(recipePayload, null, 2));

      const response = await axios.post(
        `${URL_PUBLICA}/recipe`, // URL CORREGIDA A /recipe
        recipePayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      // AÑADE ESTAS LÍNEAS PARA DEBUGGING DE LA RESPUESTA DEL BACKEND
      console.log("Respuesta completa del backend:", response);
      console.log("Datos de la respuesta (response.data):", response.data);
      console.log("Estado HTTP de la respuesta (response.status):", response.status);
      // FIN LÍNEAS DE DEBUGGING

      // ** Lógica para verificar el éxito de la publicación **
      // Basado en el problema anterior, ajusta esta condición
      // Opción A: Backend devuelve el objeto Recipe (ej. status 201)
      if (response.status === 201 && response.data) { // Opción A: Backend devuelve 201 y datos
        Alert.alert("Éxito", "Receta publicada correctamente.", [
          {
            text: "OK",
            onPress: () => {
              // ** Añade un pequeño setTimeout aquí **
              setTimeout(() => {
                if (navigationRef.isReady()) {
                  navigationRef.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: '/' }], // Asegúrate de que '/' es el nombre correcto de tu ruta de inicio
                    })
                  );
                } else {
                  console.warn("Navigation ref aún no lista después de timeout. Volviendo a router.replace.");
                  router.replace('/'); // Fallback
                }
              }, 50); // Un pequeño retraso de 50 milisegundos
            },
          },
        ]);
      } 
      else if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success) { // Opción B: Backend devuelve { success: true }
         Alert.alert("Éxito", response.data.message || "Receta publicada correctamente.", [
          {
            text: "OK",
            onPress: () => {
              // ** Añade un pequeño setTimeout aquí **
              setTimeout(() => {
                if (navigationRef.isReady()) {
                  navigationRef.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: '/' }],
                    })
                  );
                } else {
                  console.warn("Navigation ref aún no lista después de timeout. Volviendo a router.replace.");
                  router.replace('/'); // Fallback
                }
              }, 50); // Un pequeño retraso de 50 milisegundos
            },
          },
        ]);
      }
      // Opción para cuando el backend indica un error o formato inesperado
      else {
        // Asegúrate de usar '?.message' para evitar errores si response.data es null/undefined
        Alert.alert("Error al Publicar", response.data?.message || "La receta no pudo ser publicada. Inténtalo de nuevo.");
        setPublishError(response.data?.message || "Error desconocido.");
      }
    } catch (error) {
      console.error("Error al publicar la receta:", error);
      if (axios.isAxiosError(error)) {
        Alert.alert("Error de Red", error.response?.data?.message || error.message || "Hubo un problema de conexión o servidor.");
        setPublishError(error.response?.data?.message || error.message || "Error de red.");
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado al publicar la receta.");
        setPublishError("Error inesperado.");
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      "Descartar Receta",
      "¿Estás seguro de que quieres descartar esta receta? Se perderá toda la información.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          onPress: () => {
            // Aquí puedes decidir si quieres resetear completamente o solo reemplazar
            // router.replace('/'); // Esto solo reemplaza la pantalla actual, manteniendo el historial anterior
            if (navigationRef.isReady()) { // Si quieres resetear también al descartar
                navigationRef.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: '/' }],
                  })
                );
            } else {
                router.replace('/');
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert("Guardar Receta", "Lógica para guardar la receta en el dispositivo/servidor (ej. como borrador).");
  };
  
  const username = userProfile?.username || 'Anónimo';

  return (
    <View style={styles.fullScreenContainer}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Receta</Text>
        <View style={styles.placeholder} />
      </View>
        <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        <Text style={styles.recipeName}>{recipe.recipeName}</Text>
        <Image
          source={{ uri: recipe.coverImageUrl || 'https://via.placeholder.com/150' }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <Text style={styles.detailText}>Tipo: {recipe.dishType || 'No especificado'}</Text>
        <Text style={styles.detailText}>Creada por: {username}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{recipe.briefDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ing, index) => (
              <Text key={index} style={styles.ingredientText}>
                • {ing.name}: {ing.quantity} {ing.unit}
              </Text>
            ))
          ) : (
            <Text style={styles.noDataText}>No se han agregado ingredientes.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pasos</Text>
          {recipe.steps.length > 0 ? (
            recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>Paso {index + 1}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {step.mediaType && step.displayMediaUrls.length > 0 && (
                  <View style={styles.stepMediaContainer}>
                    {step.mediaType === 'image' ? (
                      <FlatList
                        data={step.displayMediaUrls}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, idx) => `step-image-${index}-${idx}`}
                        snapToInterval={ITEM_WIDTH} 
                        decelerationRate="fast" 
                        snapToAlignment="center" 
                        renderItem={({ item }) => (
                          <View style={{ width: ITEM_WIDTH, height: '100%' }}>
                            <Image source={{ uri: item }} style={styles.stepImage} resizeMode="cover" />
                          </View>
                        )}
                      />
                    ) : ( // mp4-video
                      <VideoPreviewPlayer url={step.displayMediaUrls[0]} />
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No se han agregado pasos.</Text>
          )}
        </View>

      </ScrollView>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard} disabled={isPublishing}>
          <Text style={styles.buttonText}>Descartar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isPublishing}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.publishButton} 
          onPress={handlePublish} 
          disabled={isPublishing || !userProfile || !recipe || isProfileLoading} 
        >
          {isPublishing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Publicar</Text>
          )}
        </TouchableOpacity>
      </View>
      {publishError && (
        <View style={{ padding: 10, backgroundColor: 'red', position: 'absolute', bottom: 70, width: '100%' }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{publishError}</Text>
        </View>
      )}
    </View>
  );
}

const VideoPreviewPlayer = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url);
  return (
    <VideoView
      player={player}
      controls={true}
      style={styles.stepVideoPlayer}
      contentFit="cover"
      loop={false}
      muted={false}
      volume={1.0}
      rate={1.0}
    />
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100, 
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
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#555',
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#E0E0E0',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  section: {
    marginTop: 25,
    marginBottom: 15,
    //paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  ingredientText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  stepContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  stepMediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
    width: '100%',
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepImage: {
    width: ITEM_WIDTH, 
    height: '100%',
    borderRadius: 10,
  },
  stepVideoPlayer: {
    width: '100%',
    height: '100%',
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F0',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  discardButton: {
    backgroundColor: '#FF5C5C',
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  publishButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});