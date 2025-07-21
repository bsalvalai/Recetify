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
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import axios from 'axios'; // Importar axios
import { useVideoPlayer, VideoView } from 'expo-video';
import Constants from 'expo-constants';

import Colors from '@/constants/Colors';
// Asegúrate de que RecipeData y MappedRecipe estén disponibles
// Es posible que necesites ajustar la importación si RecipeData no está en RecipeTypes
import { MappedRecipe } from '../components/RecipeTypes'; 

// Importa la interfaz RecipeData desde donde la tengas definida
// Si no la tienes, aquí una versión simplificada basada en tu uso
interface RecipeData {
    ID: string;
    recipe_name: string;
    description: string;
    type: string;
    preparation_time: number;
    quantity_servings: number; // Asegúrate de que este campo existe y es numérico en tu API
    photos: string[];
    ingredients: { ingredient_name: string; quantity: number; unit: string }[];
    steps: { description: string; order: number; photos?: string[]; videos?: string[] }[];
    date?: string; // Podría ser opcional si no siempre está presente
    user?: string; // Para el autor
}


const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 16 * 2 - 15 * 2;

// --- INTERFACES DE DATOS (Mantener DisplayRecipeData como está) ---
interface DisplayRecipeData {
    id: string;
    recipeName: string;
    coverImageUrl: string;
    briefDescription: string;
    dishType: string | null;
    authorUsername: string;
    originalServings: number; 
    ingredients: { name: string; quantity: number; unit: string }[];
    steps: {
        order: number;
        description: string;
        media: { url: string; type: 'image' | 'video' }[];
    }[];
    publishedDate: string | null;
}

// --- FUNCIÓN DE TRANSFORMACIÓN (Modificar para aceptar RecipeData del backend) ---
// Ahora transformará RecipeData (del backend) a DisplayRecipeData
function transformBackendRecipeToDisplay(backendRecipe: RecipeData): DisplayRecipeData {
    console.log("LOG: transformBackendRecipeToDisplay - Receta de backend de entrada:", JSON.stringify(backendRecipe, null, 2));

    const transformedData = {
        id: backendRecipe.ID,
        recipeName: backendRecipe.recipe_name || 'Receta sin Nombre',
        coverImageUrl: backendRecipe.photos?.[0] || 'https://via.placeholder.com/200',
        briefDescription: backendRecipe.description || 'Sin descripción detallada.',
        dishType: backendRecipe.type || 'Tipo no especificado',
        authorUsername: backendRecipe.user || 'Autor desconocido', // Asegúrate que 'user' viene en RecipeData
        originalServings: backendRecipe.quantity_servings || 1, // *** AHORA TOMA DE quantity_servings ***
        ingredients: backendRecipe.ingredients?.map(ing => ({
            name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit
        })) || [],
        steps: backendRecipe.steps?.map((step, index) => {
            const stepOrder = step.order ?? (index + 1);
            let mediaUrls: { url: string; type: 'image' | 'video' }[] = [];
            if (step.photos && step.photos.length > 0) {
                mediaUrls = step.photos.map(url => ({ url, type: 'image' }));
            } else if (step.videos && step.videos.length > 0) {
                mediaUrls = step.videos.map(url => ({ url, type: 'video' }));
            }

            return {
                order: stepOrder,
                description: step.description,
                media: mediaUrls,
            };
        }).sort((a, b) => a.order - b.order) || [],
        publishedDate: backendRecipe.date || null,
    };

    return transformedData;
}


export default function RecipeDetailNotPublishedScreen() {
    const params = useLocalSearchParams();
    // Ahora esperamos 'recipeId' directamente en los params
    const { recipeId } = params; 

    const [recipe, setRecipe] = useState<DisplayRecipeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adjustedServings, setAdjustedServings] = useState<string>('');

    useEffect(() => {
        const fetchRecipeData = async () => {
            console.log("LOG: useEffect - Iniciando carga de detalles de receta no publicada por ID.");
            setIsLoading(true);
            setError(null);

            if (!recipeId || typeof recipeId !== 'string') {
                console.error("LOG: useEffect - Error: 'recipeId' no proporcionado o no es un string.", { recipeId });
                setError("Error: ID de receta no proporcionado o formato incorrecto. Vuelve a la pantalla anterior.");
                setIsLoading(false);
                return;
            }

            try {
                // Hacer la llamada a la API para obtener la receta por su ID
                const response = await axios.get<RecipeData>(
                    `${URL_PUBLICA}/recipe?ID=${recipeId}`,
                    {
                        headers: { 'x-api-key': API_KEY },
                    }
                );
                const backendRecipe = response.data;
                console.log("LOG: useEffect - Datos de backend obtenidos con éxito.", JSON.stringify(backendRecipe, null, 2));

                const transformedRecipe = transformBackendRecipeToDisplay(backendRecipe);
                setRecipe(transformedRecipe);
                setAdjustedServings(String(transformedRecipe.originalServings)); // Inicializar con el valor real de la BD
                console.log("LOG: useEffect - Receta transformada y establecida en el estado.");

            } catch (e: any) {
                console.error("LOG: useEffect - Error al cargar o transformar los datos de la receta:", e);
                setError("Error al cargar los datos de la receta: " + (e.message || "Desconocido"));
            } finally {
                setIsLoading(false);
                console.log("LOG: useEffect - Carga de detalles de receta no publicada finalizada.");
            }
        };

        fetchRecipeData(); // Llama a la función de carga al montar el componente o cuando recipeId cambie
    }, [recipeId]); // El efecto se ejecuta cuando recipeId cambia

    // Función para calcular la cantidad ajustada de un ingrediente
    const calculateAdjustedQuantity = (originalQuantity: number): number => {
        if (!recipe || !recipe.originalServings) {
            return originalQuantity;
        }

        const desiredServings = parseInt(adjustedServings, 10);
        if (isNaN(desiredServings) || desiredServings <= 0) {
            return originalQuantity;
        }

        const adjustmentFactor = desiredServings / recipe.originalServings;
        return originalQuantity * adjustmentFactor;
    };


    // --- Renderizado Condicional (sin cambios significativos) ---
    if (isLoading) {
        console.log("LOG: Render - Mostrando indicador de carga.");
        return (
            <View style={styles.fullScreenContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint || '#0000ff'} style={styles.loadingIndicator} />
                <Text style={styles.loadingText}>Cargando detalles de la receta...</Text>
            </View>
        );
    }

    if (error) {
        console.log("LOG: Render - Mostrando mensaje de error:", error);
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
        console.log("LOG: Render - No se pudo cargar la receta (estado 'recipe' es null).");
        return (
            <View style={styles.fullScreenContainer}>
                <Text style={styles.noDataText}>No se pudo cargar la receta.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.buttonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    console.log("LOG: Render - Mostrando detalles de la receta:", JSON.stringify(recipe, null, 2));

    return (
        <KeyboardAvoidingView
            style={styles.fullScreenContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <Stack.Screen options={{ title: "Mis Recetas", headerTitleAlign: 'center', headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => {
                    console.log("LOG: Header - Botón de volver presionado.");
                    router.back();
                }}>
                    <FontAwesome name="chevron-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{recipe?.recipeName}</Text>
                <View style={styles.placeholder} />
            </View>
            <View style={[{ backgroundColor: "#000" }, { width: "100%" }, { height: 1 }]}></View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>

                <Text style={styles.recipeName}>{recipe?.recipeName}</Text>
                <Image
                    source={{ uri: recipe?.coverImageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.coverImage}
                    resizeMode="cover"
                />

                <Text style={styles.notPublishedStatus}>Esta receta aún no está publicada.</Text>

                <Text style={styles.detailText}>Tipo: {recipe?.dishType || 'No especificado'}</Text>
                <Text style={styles.detailText}>Creada por: {recipe?.authorUsername}</Text>

                {/* Campo para ajustar porciones */}
                <View style={styles.servingsAdjustmentContainer}>
                    <Text style={styles.sectionTitle}>Porciones</Text>
                    <View style={styles.servingsInputRow}>
                        <Text style={styles.currentServingsText}>Para: </Text>
                        <TextInput
                            style={styles.servingsInput}
                            onChangeText={(text) => {
                                const cleanedText = text.replace(/[^0-9]/g, '');
                                if (cleanedText.startsWith('0') && cleanedText.length > 1) {
                                    setAdjustedServings(cleanedText.substring(1));
                                } else {
                                    setAdjustedServings(cleanedText);
                                }
                            }}
                            value={adjustedServings}
                            keyboardType="numeric"
                            placeholder={String(recipe.originalServings)} 
                            placeholderTextColor={Colors.light.text}
                            returnKeyType="done"
                            maxLength={3}
                        />
                        <Text style={styles.currentServingsText}> porción(es)</Text>
                    </View>
                    <Text style={styles.infoText}>Cantidad original: {recipe.originalServings} porción(es)</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{recipe?.briefDescription}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    {recipe?.ingredients && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ing, index) => (
                            <Text key={index} style={styles.ingredientText}>
                                • {ing.name}: {
                                    Number.isInteger(calculateAdjustedQuantity(ing.quantity)) 
                                    ? calculateAdjustedQuantity(ing.quantity) 
                                    : calculateAdjustedQuantity(ing.quantity).toFixed(1)
                                } {ing.unit}
                            </Text>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No se han agregado ingredientes.</Text>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pasos</Text>
                    {recipe?.steps && recipe.steps.length > 0 ? (
                        recipe.steps.map((step, index) => (
                            <View key={index} style={styles.stepContainer}>
                                <Text style={styles.stepNumber}>Paso {step.order}</Text>
                                <Text style={styles.stepDescription}>{step.description}</Text>

                                {step.media.length > 0 ? (
                                    <View style={styles.stepMediaContainer}>
                                        {step.media[0]?.type === 'image' ? (
                                            <FlatList
                                                data={step.media.filter(m => m.type === 'image')}
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
                                            <VideoDetailPlayer url={step.media.filter(m => m.type === 'video')[0]?.url || ''} />
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.noDataText}>No hay medios para este paso.</Text>
                                )}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No se han agregado pasos.</Text>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

// VideoDetailPlayer (sin cambios)
const VideoDetailPlayer = ({ url }: { url: string }) => {
    if (!url) {
        return <Text style={styles.noDataText}>No hay video disponible.</Text>;
    }
    const player = useVideoPlayer(url);
    const videoRef = useRef(null);

    return (
        <VideoView
            ref={videoRef}
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
        marginTop: 5,
        backgroundColor: '#F0F0F0',
    },
    scrollViewContent: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 20,
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
    notPublishedStatus: {
        fontSize: 16,
        color: '#D9534F',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
        paddingVertical: 5,
        backgroundColor: '#F2DEDE',
        borderRadius: 5,
    },
    section: {
        marginTop: 25,
        marginBottom: 15,
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
        marginHorizontal: 0,
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
        backgroundColor: Colors.light.button || '#007BFF',
        borderRadius: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    editRecipeButton: {
        backgroundColor: Colors.light.button,
        borderRadius: 15,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 20,
    },
    editButtonIcon: {
        marginRight: 10,
    },
    // Nuevos estilos para el ajuste de porciones
    servingsAdjustmentContainer: {
        marginTop: 25,
        marginBottom: 15,
        backgroundColor: Colors.light.background,
        borderColor: Colors.light.buttonBorder,
        borderWidth: 1,
        borderRadius: 15,
        padding: 15,
    },
    servingsInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    currentServingsText: {
        fontSize: 16,
        color: Colors.light.text, // O un color de texto apropiado
        marginRight: 5,
    },
    servingsInput: {
        borderWidth: 1,
        borderColor: Colors.light.buttonBorder, // O un color de borde apropiado
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: 80, // Ancho fijo para el input
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
    infoText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 5,
    }
});