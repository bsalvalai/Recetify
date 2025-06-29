import { StyleSheet, TextInput, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import RecipeCard from '@/components/RecipeCard';
import Colors from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';
// No necesitamos importar 'router' aquí si RecipeCard lo maneja internamente

// --- INTERFACES ---
// Estas interfaces deben coincidir exactamente con lo que RecipeCard espera
interface Recipe {
  id: string;
  title: string;
  user: string;
  commentsCount: number;
  imageUrl: string;
  rating: number;
}

// Esta interfaz debe coincidir exactamente con lo que tu API devuelve
interface RawRecipeData {
  recipe_id: number;
  recipe_name: string;
  ingredients: any[];
  steps: any[];
  preparation_time: string;
  description: string;
  quantity_servings: number;
  type: string;
  reviews: any[];
  author: string;
  rating: number;
  photos: string[];
}

// --- FUNCIÓN DE TRANSFORMACIÓN ---
function transformRecipeData(rawRecipe: RawRecipeData): Recipe {
  const imageUrl = (rawRecipe.photos && rawRecipe.photos.length > 0)
    ? rawRecipe.photos[0]
    : 'https://via.placeholder.com/150'; // Fallback por si acaso

  const commentsCount = rawRecipe.reviews ? rawRecipe.reviews.length : 0;

  const transformed = {
    id: String(rawRecipe.recipe_id),
    title: rawRecipe.recipe_name || 'Receta sin Título',
    user: rawRecipe.author || 'Autor Desconocido',
    commentsCount: commentsCount,
    imageUrl: imageUrl,
    rating: rawRecipe.rating || 0,
  };
  return transformed;
}

// --- CONFIGURACIÓN GLOBAL ---
const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const filters = ["Nombre", "Ingrediente", "Sin ingrediente", "Tipo", "Usuario"];

  useEffect(() => {
    setSelectedFilter(filters[0]);

    const fetchLatestRecipes = async () => {
      try {
        const API_ENDPOINT = `${URL_PUBLICA}/search/home`;
        console.log(`LOG AXIOS: Intentando buscar las últimas recetas con Axios en: ${API_ENDPOINT}`);

        const response = await axios.get<RawRecipeData[]>(API_ENDPOINT, {
          headers: {
            'x-api-key': API_KEY,
          },
        });

        const rawDataArray: RawRecipeData[] = response.data;
        console.log("LOG AXIOS: Datos crudos de las últimas recetas recibidos:", JSON.stringify(rawDataArray, null, 2));

        const transformedRecipes: Recipe[] = rawDataArray.map(transformRecipeData);
        console.log("LOG AXIOS: Recetas transformadas finales:", JSON.stringify(transformedRecipes, null, 2));

        setRecipes(transformedRecipes);

      } catch (e: any) {
        console.error("LOG ERROR: Error al cargar las últimas recetas con Axios:", e);
        if (axios.isAxiosError(e)) {
          console.error("LOG ERROR: Detalles del error de Axios:", e.response?.data);
          setError(e.response?.data?.message || e.message || "Error de red o del servidor.");
        } else {
          setError(e.message || "Error desconocido al cargar las recetas.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestRecipes();
  }, []);

  const handleOnPressSearch = () => {
    console.log("LOG UI: BÚSQUEDA activada con filtro:", selectedFilter);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Buscar Recetas"
          placeholderTextColor={Colors.light.text}
        />
        <TouchableOpacity onPress={handleOnPressSearch}>
          <FontAwesome6 name="magnifying-glass" size={24}/>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter, idx) => (
          <View
            key={filter}
            style={[
              styles.filter,
              selectedFilter === filter && styles.filterSelected,
              idx >= 3 && styles.flexWrapFilter
            ]}
          >
            <Text
              style={styles.filterText}
              onPress={() => setSelectedFilter(filter)}
            >
              {filter}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Últimas Recetas Cargadas</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>Error al cargar las recetas: {error}</Text>
      ) : recipes.length > 0 ? (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} />
          )}
          contentContainerStyle={styles.recipeListContent}
          showsVerticalScrollIndicator={false}
          style={styles.flatListFullWidth} // Asegúrate de que FlatList ocupe el 100% del ancho
        />
      ) : (
        <Text style={styles.noRecipesText}>No se encontraron recetas.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  topBorder: {
    backgroundColor: "#000",
    width: "100%",
    height: 1,
  },
  title: {
    fontSize: 24,
    color: Colors.light.text,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 15,
    backgroundColor: Colors.light.background,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 30,
    paddingHorizontal: 20,
    height: 40,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.filter,
    borderRadius: 15,
    height: 40,
    width: 100,
    marginTop: 15,
  },
  filterText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: "#fff",
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    backgroundColor: Colors.light.background,
  },
  flexWrapFilter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  filterSelected: {
    borderWidth: 5,
    borderColor: Colors.light.cardBorder,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  errorText: {
    color: 'red',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  noRecipesText: {
    color: Colors.light.text,
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  flatListFullWidth: {
    width: '100%', // <-- ¡Haz que la FlatList ocupe el 100% del ancho disponible!
  },
  recipeListContent: {
    paddingBottom: 20,
    // Mantén esto comentado si RecipeCard ya maneja sus marginHorizontal:
    // paddingHorizontal: 16,
  },
});