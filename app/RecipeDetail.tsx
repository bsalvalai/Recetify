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
import axios from 'axios';

const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

const { width } = Dimensions.get('window');
// ITEM_WIDTH para las imágenes/videos de los pasos. Ajusta según tus estilos.
const ITEM_WIDTH = width - 16 * 2 - 15 * 2; 

// --- INTERFACES DE DATOS (deben coincidir con la API para una receta completa) ---
// Estas interfaces están basadas en el JSON de datos crudos que me proporcionaste antes.
interface RawIngredient {
  ingredient_id: number; // Puede ser null si es una nueva receta, pero aquí esperamos un valor
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface RawStep {
  step_id: number; // Puede ser null si es una nueva receta
  description: string;
  order: number;
  photos: string[]; // Array de URLs de imágenes
  videos: string[]; // Array de URLs de videos (asumimos solo un video por paso por ahora)
}

interface RawFullRecipeFromAPI {
  recipe_id: number;
  recipe_name: string;
  author: string; // El nombre de usuario que creó la receta
  description: string; // Tu 'briefDescription'
  ingredients: RawIngredient[];
  photos: string[]; // Array de URLs de la imagen de portada/principal
  preparation_time: string; // Si quieres mostrarlo
  quantity_servings: number; // Si quieres mostrarlo
  rating: number;
  reviews: any[]; // Usaremos para commentsCount, aunque no los mostremos detalladamente
  steps: RawStep[];
  type: string; // Tu 'dishType'
  // Si tu API devuelve más campos relevantes, añádelos aquí.
}

// Interfaz para la receta tal como la consumirá esta pantalla (transformada de RawFullRecipeFromAPI)
interface DisplayRecipeData {
  id: string; // Del recipe_id
  recipeName: string;
  coverImageUrl: string;
  briefDescription: string;
  dishType: string | null;
  authorUsername: string; // Para mostrar quién la creó
  rating: number;
  commentsCount: number;
  ingredients: { name: string; quantity: number; unit: string }[];
  steps: {
    order: number;
    description: string;
    media: { url: string; type: 'image' | 'video' }[]; // Un array de media para cada paso
  }[];
}


// --- FUNCIÓN DE TRANSFORMACIÓN ---
// Adapta los datos crudos de la API a la estructura que DisplayRecipeData espera
function transformAPIRecipeToDisplay(rawRecipe: RawFullRecipeFromAPI): DisplayRecipeData {
  return {
    id: String(rawRecipe.recipe_id),
    recipeName: rawRecipe.recipe_name || 'Receta sin Nombre',
    coverImageUrl: (rawRecipe.photos && rawRecipe.photos.length > 0)
      ? rawRecipe.photos[0]
      : 'https://via.placeholder.com/200', // Placeholder si no hay fotos
    briefDescription: rawRecipe.description || 'Sin descripción detallada.',
    dishType: rawRecipe.type || 'Tipo no especificado',
    authorUsername: rawRecipe.author || 'Autor desconocido',
    rating: rawRecipe.rating || 0,
    commentsCount: rawRecipe.reviews ? rawRecipe.reviews.length : 0,
    ingredients: rawRecipe.ingredients.map(ing => ({
      name: ing.ingredient_name,
      quantity: ing.quantity,
      unit: ing.unit,
    })),
    steps: rawRecipe.steps
      .map(step => ({
        order: step.order,
        description: step.description,
        media: [
          ...step.photos.map(url => ({ url, type: 'image' as 'image' })), // Mapea fotos a objetos de media
          ...step.videos.map(url => ({ url, type: 'video' as 'video' })), // Mapea videos a objetos de media
        ],
      }))
      .sort((a, b) => a.order - b.order), // Asegura que los pasos estén ordenados
  };
}

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const { recipeId } = params; // Aquí recibimos el ID desde HomeScreen
  
  const [recipe, setRecipe] = useState<DisplayRecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!recipeId) {
        // Manejar el caso donde no se proporciona un ID
        setError("Error: ID de receta no proporcionado. Vuelve a la pantalla anterior.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null); // Limpiar errores anteriores

      try {
        if (!URL_PUBLICA) {
          throw new Error("EXPO_PUBLIC_BACKEND_URL no definida. Revisa tu .env y app.config.js.");
        }
        
        const API_ENDPOINT = `${URL_PUBLICA}/recipe?ID=${recipeId}`;
        console.log(`LOG RECIPE_DETAIL: Intentando fetch de detalles de receta: ${API_ENDPOINT}`);

        // Petición a la API para obtener los datos completos de la receta
        const response = await axios.get<RawFullRecipeFromAPI>(API_ENDPOINT, {
          headers: { 'x-api-key': API_KEY },
        });

        const rawData: RawFullRecipeFromAPI = response.data;
        console.log("LOG RECIPE_DETAIL: Datos crudos recibidos:", JSON.stringify(rawData, null, 2));

        if (rawData) {
          const transformedRecipe = transformAPIRecipeToDisplay(rawData);
          setRecipe(transformedRecipe);
          console.log("LOG RECIPE_DETAIL: Receta transformada para mostrar:", JSON.stringify(transformedRecipe, null, 2));
        } else {
          setError("No se encontraron datos para la receta con ID: " + recipeId);
        }
      } catch (e: any) {
        console.error("LOG RECIPE_DETAIL: Error al cargar detalles de la receta:", e);
        if (axios.isAxiosError(e)) {
          setError(e.response?.data?.message || e.message || "Error de red o del servidor.");
        } else {
          setError(e.message || "Error desconocido al cargar la receta.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [recipeId]); // El efecto se vuelve a ejecutar si el recipeId cambia

  // --- Renderizado Condicional ---
  if (isLoading) {
    return (
      <View style={styles.fullScreenContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Cargando detalles de la receta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.fullScreenContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.fullScreenContainer}>
        <Text style={styles.noDataText}>No se pudo cargar la receta.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCommentPress = () => {
    router.push({
      pathname: '/CommentView',
        params: { recipeId: recipe.id } // Pasa el ID de la receta para cargar los comentarios
    });
  }
  // Si llegamos aquí, 'recipe' tiene datos y podemos renderizarlos
  return (
    <View style={styles.fullScreenContainer}>
      {/* Opciones de la cabecera de Expo Router */}
      <Stack.Screen options={{ title: recipe.recipeName, headerTitleAlign: 'center', headerShown: false}} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{recipe.recipeName}</Text>
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
        <Text style={styles.detailText}>Creada por: {recipe.authorUsername}</Text>
        <Text style={styles.detailText}>Calificación: {recipe.rating.toFixed(1)} ({recipe.commentsCount} comentarios)</Text>


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
                <Text style={styles.stepNumber}>Paso {step.order}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {step.media.length > 0 && (
                  <View style={styles.stepMediaContainer}>
                    {/* Renderiza el primer elemento multimedia (imagen o video) */}
                    {step.media[0].type === 'image' ? (
                      <FlatList
                        data={step.media.filter(m => m.type === 'image')} // Solo imágenes
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, idx) => `step-image-${step.order}-${idx}`}
                        snapToInterval={ITEM_WIDTH}
                        decelerationRate="fast"
                        snapToAlignment="center"
                        renderItem={({ item }) => (
                          <View style={{ width: ITEM_WIDTH, height: '100%' }}>
                            <Image source={{ uri: item.url }} style={styles.stepImage} resizeMode="cover" />
                          </View>
                        )}
                      />
                    ) : (
                      // Asume que si hay un video, solo hay uno y es el primero en la lista de media de ese paso
                      <VideoDetailPlayer url={step.media.filter(m => m.type === 'video')[0]?.url} />
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No se han agregado pasos.</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleCommentPress} style={styles.submitButton}>
          <Text style={styles.buttonText}>Comentarios</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// Componente para reproducir video
const VideoDetailPlayer = ({ url }: { url: string }) => {
  // Solo renderiza si hay una URL válida
  if (!url) {
    return null;
  }
  const player = useVideoPlayer(url);
  const videoRef = useRef(null);

  // Puedes añadir más lógica aquí si necesitas controlar la reproducción, errores, etc.

  return (
    <VideoView
      ref={videoRef}
      player={player}
      controls={true}
      style={styles.stepVideoPlayer}
      contentFit="cover"
      loop={false}
      muted={false} // Ajusta si quieres que el video empiece sin sonido
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
    marginTop: 5, // Para evitar solapamiento con la barra de estado
    backgroundColor: '#F0F0F0',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20, // Asegura espacio para que no se corte el contenido final
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24, // Para que el título esté centrado
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
    paddingHorizontal: 1,
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
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: Colors.light.button,
    borderRadius: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 15,
    alignItems: 'center',
    //marginHorizontal: 16,
    marginBottom: 20,
  }
});