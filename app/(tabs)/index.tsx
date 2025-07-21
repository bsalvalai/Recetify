import { StyleSheet, TextInput, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import RecipeCard from '@/components/RecipeCard';
import Colors from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';

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
  date: string; // Correcto: Este es el campo que RecipeCard espera
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
  date: string; // Correcto: El backend te lo devuelve como 'date'
}

// --- FUNCIÓN DE TRANSFORMACIÓN ---
function transformRecipeData(rawRecipe: RawRecipeData): Recipe {
  const imageUrl = (rawRecipe.photos && rawRecipe.photos.length > 0)
    ? rawRecipe.photos[0]
    : 'https://via.placeholder.com/150'; // Fallback por si acaso

  const commentsCount = rawRecipe.reviews ? rawRecipe.reviews.length : 0;

  let formattedDate = 'Fecha desconocida';
  if (rawRecipe.date) {
    // --- CAMBIO CLAVE: Parsear manualmente el formato "DD/MM/YYYY" ---
    const parts = rawRecipe.date.split('/');
    if (parts.length === 3) {
      // Date constructor expects (year, monthIndex, day)
      // Month index is 0-based (0 for Jan, 11 for Dec)
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Restamos 1 porque los meses son de 0 a 11
      const year = parseInt(parts[2], 10);

      const dateObj = new Date(year, month, day);

      // Verify if the parsed date is valid before formatting
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      } else {
        console.warn("Fecha de publicación inválida después de parsear:", rawRecipe.date);
      }
    } else {
      console.warn("Formato de fecha de publicación inesperado:", rawRecipe.date);
    }
  }

  const transformed = {
    id: String(rawRecipe.recipe_id),
    title: rawRecipe.recipe_name || 'Receta sin Título',
    user: rawRecipe.author || 'Autor Desconocido',
    commentsCount: commentsCount,
    imageUrl: imageUrl,
    rating: rawRecipe.rating || 0,
    date: formattedDate, // Mapeo de la fecha formateada
  };
  return transformed;
}

// --- CONFIGURACIÓN GLOBAL ---
const URL_BASE_BACKEND = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

// Definir filterMapping y displayFilters fuera del componente para que no se recreen en cada render
const filterMapping: { [key: string]: string } = {
    "Nombre": "nombre",
    "Ingrediente": "ingredienteIncluir",
    "Sin ingrediente": "ingredienteExcluir",
    "Tipo": "tipoPlato",
    "Usuario": "autor"
};

const displayFilters = ["Nombre", "Ingrediente", "Sin ingrediente", "Tipo", "Usuario"];


export default function HomeScreen() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedFilter, setSelectedFilter] = useState<string>(displayFilters[0]);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastSearchedTerm, setLastSearchedTerm] = useState<string>('');
    const [lastSearchedFilter, setLastSearchedFilter] = useState<string>(displayFilters[0]);


    // --- Función centralizada para realizar la búsqueda de recetas ---
    const performSearch = useCallback(async (term: string, filter: string, isInitialLoad: boolean = false) => {
        setIsLoading(true);
        setError(null);

        if (!isInitialLoad) {
            setLastSearchedTerm(term);
            setLastSearchedFilter(filter);
        }

        let url = '';
        const apiFilterParam = filterMapping[filter];

        if (!apiFilterParam) {
            setError("Error: Filtro no válido seleccionado.");
            setIsLoading(false);
            return;
        }

        if (term.trim() === '') {
            url = `${URL_BASE_BACKEND}/search/home`;
        } else {
            url = `${URL_BASE_BACKEND}/search?${apiFilterParam}=${encodeURIComponent(term.trim())}`;
        }

        try {
            if (!URL_BASE_BACKEND) {
                throw new Error("EXPO_PUBLIC_BACKEND_URL not defined. Check your .env file and app.config.js.");
            }

            const response = await axios.get<RawRecipeData[]>(url, {
                headers: { 'x-api-key': API_KEY },
            });

            const rawDataArray: RawRecipeData[] = response.data;
            // console.log("LOG AXIOS: Datos crudos de recetas recibidos:", JSON.stringify(rawDataArray, null, 2)); // Para depuración

            const transformedRecipes: Recipe[] = rawDataArray.map(transformRecipeData);
            // console.log("LOG AXIOS: Recetas transformadas finales:", JSON.stringify(transformedRecipes, null, 2)); // Para depuración

            setRecipes(transformedRecipes);
            if (!isInitialLoad) {
                setHasSearched(true);
            }

        } catch (e: any) {
            console.error("LOG ERROR: Error al buscar recetas con Axios:", e);
            if (axios.isAxiosError(e)) {
                console.error("LOG ERROR: Detalles del error de Axios:", e.response?.status, e.response?.data);
                setError(e.response?.data?.message || e.message || "Error de red o del servidor.");
            } else {
                setError(e.message || "Error desconocido al cargar las recetas.");
            }
            setRecipes([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- useEffect para la carga inicial (SOLO EN EL PRIMER RENDERIZADO) ---
    useEffect(() => {
        setSelectedFilter(displayFilters[0]);
        performSearch('', displayFilters[0], true);
    }, [performSearch]);

    // Función que se llama UNICAMENTE cuando se presiona la lupa
    const handleOnPressSearch = () => {
        setHasSearched(true);
        performSearch(searchTerm, selectedFilter);
    };

    // Función para manejar el cambio de filtro al presionar los botones
    const handleFilterPress = (filterName: string) => {
        setSelectedFilter(filterName);
    };

    // Determina el título a mostrar
    const getDisplayTitle = () => {
      if (isLoading) {
        return "Cargando Recetas...";
      }
      if (hasSearched && lastSearchedTerm.trim() !== '') {
        return `Resultados para "${lastSearchedTerm}" (por ${lastSearchedFilter})`;
      }
      return "Últimas Recetas Cargadas";
    };

    return (
        <View style={styles.container}>
            <View style={styles.topBorder} />
            <View style={styles.textInputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Buscar Recetas"
                    placeholderTextColor={Colors.light.text}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={handleOnPressSearch}>
                    <FontAwesome6 name="magnifying-glass" size={24} color={Colors.light.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {displayFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        onPress={() => handleFilterPress(filter)}
                        style={[
                            styles.filter,
                            selectedFilter === filter && styles.filterSelected,
                        ]}
                    >
                        <Text style={styles.filterText}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{getDisplayTitle()}</Text>
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
                    style={styles.flatListFullWidth}
                />
            ) : (
                <Text style={styles.noRecipesText}>
                    {hasSearched && lastSearchedTerm.trim() !== '' ?
                        `No se encontraron resultados para "${lastSearchedTerm}" con el filtro de "${lastSearchedFilter}".` :
                        'No se encontraron recetas o presiona la lupa para buscar.'}
                </Text>
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
        fontSize: 22,
        color: Colors.light.text,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    textInput: {
        flex: 1,
        fontSize: 12,
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
        //paddingHorizontal: 10,
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
        marginHorizontal: 5,
    },
    filterText: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        color: "#fff",
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginHorizontal: 16,
        backgroundColor: Colors.light.background,
    },
    filterSelected: {
        borderWidth: 3,
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
        marginHorizontal: 16,
    },
    flatListFullWidth: {
        width: '100%',
    },
    recipeListContent: {
        paddingBottom: 20,
    },
});