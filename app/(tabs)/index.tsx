import { StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import RecipeCard from '@/components/RecipeCard';
import Colors from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';

// --- INTERFACES ---
interface Recipe {
  id: string;
  title: string;
  user: string;
  commentsCount: number;
  imageUrl: string;
  rating: number;
}

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
  // LOG 1: Verificar el input de la función de transformación
  console.log('LOG TRANSFORM: Input rawRecipe =', JSON.stringify(rawRecipe, null, 2));

  // Aseguramos que 'photos' sea un array y no esté vacío antes de intentar acceder a [0]
  const imageUrl = (rawRecipe.photos && rawRecipe.photos.length > 0)
    ? rawRecipe.photos[0]
    : 'https://via.placeholder.com/150';

  // Aseguramos que 'reviews' sea un array antes de intentar acceder a .length
  const commentsCount = rawRecipe.reviews ? rawRecipe.reviews.length : 0;

  const transformed = {
    id: String(rawRecipe.recipe_id),
    title: rawRecipe.recipe_name || 'Receta sin Título (Fallback)', // Añadimos "Fallback" para distinguirlo
    user: rawRecipe.author || 'Autor Desconocido (Fallback)',
    commentsCount: commentsCount,
    imageUrl: imageUrl,
    rating: rawRecipe.rating || 0,
  };

  // LOG 2: Verificar el output de la función de transformación
  console.log('LOG TRANSFORM: Output transformedRecipe =', JSON.stringify(transformed, null, 2));
  return transformed;
}

// --- CONFIGURACIÓN GLOBAL ---
const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

// LOG 3: Verificar si el componente HomeScreen se está renderizando
console.log('LOG COMPONENT: HomeScreen re-render');

export default function HomeScreen() {
  const [singleRecipe, setSingleRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const filters = [ "Nombre", "Ingrediente", "Sin ingrediente", "Tipo", "Usuario" ];

  useEffect(() => {
    // LOG 4: Verificar si useEffect se ejecuta
    console.log('LOG EFFECT: useEffect running');
    setSelectedFilter(filters[0]);

    const fetchSpecificRecipe = async () => {
      // LOG 5: Verificar si la función de fetch se invoca
      console.log('LOG FETCH FUNCTION: fetchSpecificRecipe invoked');
      try {
        const RECIPE_ID_TO_FETCH = '4';
        const API_ENDPOINT = `${URL_PUBLICA}/recipe?ID=${RECIPE_ID_TO_FETCH}`;

        // LOG 6: Verificar la URL final antes de la petición
        console.log(`LOG AXIOS: Intentando buscar con Axios en: ${API_ENDPOINT}`);

        const response = await axios.get<RawRecipeData>(API_ENDPOINT, {
          headers: {
            'x-api-key': API_KEY,
          },
        });

        const rawData: RawRecipeData = response.data;
        // LOG 7: Verificar los datos crudos exactamente como los devuelve Axios
        console.log("LOG AXIOS: Datos crudos recibidos (response.data) =", JSON.stringify(rawData, null, 2));

        const transformedRecipe: Recipe = transformRecipeData(rawData);
        // LOG 8: Verificar la receta transformada final
        console.log("LOG AXIOS: Receta transformada final =", JSON.stringify(transformedRecipe, null, 2));

        setSingleRecipe(transformedRecipe);

      } catch (e: any) {
        // LOG 9: Captura de errores de Axios
        console.error("LOG ERROR: Error al cargar la receta con Axios:", e);
        if (axios.isAxiosError(e)) {
          console.error("LOG ERROR: Detalles del error de Axios:", e.response?.data);
          setError(e.response?.data?.message || e.message || "Error de red o del servidor.");
        } else {
          setError(e.message || "Error desconocido al cargar la receta.");
        }
      } finally {
        // LOG 10: Fin de la carga
        console.log('LOG FETCH FUNCTION: Loading finished');
        setIsLoading(false);
      }
    };

    fetchSpecificRecipe();
  }, []);

  const handleOnPress = () => {
    console.log("LOG UI: BÚSQUEDA activada con filtro:", selectedFilter);
  };

  // LOG 11: Verificar el estado de singleRecipe antes de renderizar RecipeCard
  console.log('LOG RENDER: singleRecipe state =', JSON.stringify(singleRecipe, null, 2));

  return (
    <View style={styles.container}>
      <View style={[{ backgroundColor: "#000" }, { width: "100%" }, { height: 1 }]}></View>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Buscar Recetas"
          placeholderTextColor={Colors.light.text}
        />
        <TouchableOpacity onPress={handleOnPress}>
          <FontAwesome6 name="magnifying-glass" size={24} />
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
        {/* Usamos singleRecipe?.id para que no falle si singleRecipe es null */}
        <Text style={styles.title}>Receta de Prueba (ID: {singleRecipe?.id || 'Cargando...'})</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.light.tint} style={styles.loadingIndicator} />
      ) : error ? (
        <Text style={styles.errorText}>Error al cargar la receta: {error}</Text>
      ) : singleRecipe ? (
        <RecipeCard key={singleRecipe.id} recipe={singleRecipe} />
      ) : (
        <Text style={styles.noRecipesText}>No se encontró la receta de prueba.</Text>
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
});