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
import { MappedRecipe } from '../components/RecipeTypes'; // Asegúrate de que esta ruta sea correcta

const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 16 * 2 - 15 * 2;

// --- INTERFACES DE DATOS ---
interface DisplayRecipeData {
    id: string;
    recipeName: string;
    coverImageUrl: string;
    briefDescription: string;
    dishType: string | null;
    authorUsername: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    steps: {
        order: number;
        description: string;
        media: { url: string; type: 'image' | 'video' }[];
    }[];
    publishedDate: string | null;
}

// --- FUNCIÓN DE TRANSFORMACIÓN ---
function transformMappedRecipeToDisplay(mappedRecipe: MappedRecipe): DisplayRecipeData {
    console.log("LOG: transformMappedRecipeToDisplay - Receta MappedRecipe de entrada:", JSON.stringify(mappedRecipe, null, 2));

    const transformedData = {
        id: mappedRecipe.id,
        recipeName: mappedRecipe.title || 'Receta sin Nombre',
        coverImageUrl: mappedRecipe.imageUrl || 'https://via.placeholder.com/200',
        briefDescription: mappedRecipe.briefDescription || 'Sin descripción detallada.',
        dishType: mappedRecipe.dishType || 'Tipo no especificado',
        // --- CAMBIO CLAVE AQUÍ: Usar mappedRecipe.user ---
        authorUsername: mappedRecipe.user || 'Autor desconocido',
        ingredients: mappedRecipe.ingredients || [],
        steps: mappedRecipe.steps?.map((step, index) => { // Agregamos 'index' como fallback para 'order'
            // Si 'step.order' no existe en los datos, usamos 'index + 1' como un orden numérico.
            const stepOrder = step.order ?? (index + 1); // Usamos el operador nullish coalescing (??)
            console.log(`LOG: transformMappedRecipeToDisplay - Mapeando paso ${stepOrder}:`, JSON.stringify(step, null, 2));
            return {
                order: stepOrder, // Usamos la orden corregida/generada
                description: step.description,
                media: (step.displayMediaUrls || []).map(url => ({
                    url,
                    type: (step.mediaType === 'mp4-video' ? 'video' : 'image') as 'image' | 'video'
                })),
            };
        }).sort((a, b) => a.order - b.order) || [],
        publishedDate: mappedRecipe.date,
    };

    //console.log("LOG: transformMappedRecipeToDisplay - Receta transformada (DisplayRecipeData):", JSON.stringify(transformedData, null, 2));
    return transformedData;
}


export default function RecipeDetailNotPublishedScreen() {
    const params = useLocalSearchParams();
    const { unpublishedRecipeData } = params;

    const [recipe, setRecipe] = useState<DisplayRecipeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        //console.log("LOG: useEffect - Iniciando carga de detalles de receta no publicada.");
        setIsLoading(true);
        setError(null);

        if (!unpublishedRecipeData || typeof unpublishedRecipeData !== 'string') {
            console.error("LOG: useEffect - Error: 'unpublishedRecipeData' no proporcionado o no es un string.", { unpublishedRecipeData });
            setError("Error: Datos de receta no publicados no proporcionados o formato incorrecto. Vuelve a la pantalla anterior.");
            setIsLoading(false);
            return;
        }

        try {
            console.log("LOG: useEffect - Intentando parsear unpublishedRecipeData:", unpublishedRecipeData.substring(0, 150) + '...'); // Log solo una parte si es muy largo
            const parsedRecipe: MappedRecipe = JSON.parse(unpublishedRecipeData as string);
            console.log("LOG: useEffect - Datos parseados a MappedRecipe con éxito.", JSON.stringify(parsedRecipe, null, 2));

            const transformedRecipe = transformMappedRecipeToDisplay(parsedRecipe);
            setRecipe(transformedRecipe);
            console.log("LOG: useEffect - Receta transformada y establecida en el estado.");

        } catch (e: any) {
            console.error("LOG: useEffect - Error al parsear o transformar los datos de la receta:", e);
            setError("Error al procesar los datos de la receta: " + (e.message || "Desconocido"));
        } finally {
            setIsLoading(false);
            console.log("LOG: useEffect - Carga de detalles de receta no publicada finalizada.");
        }
    }, [unpublishedRecipeData]);

    // --- Renderizado Condicional ---
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

    const handleEditRecipe = () => {
        console.log(`LOG: handleEditRecipe - Navegando a edición de receta: ${recipe?.recipeName} (ID: ${recipe?.id})`);
        router.push({
            pathname: '/EditRecipeNotPublished',
            params: { recipeId: recipe?.id }
        });
    }

    return (
        <View style={styles.fullScreenContainer}>
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

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.descriptionText}>{recipe?.briefDescription}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ingredientes</Text>
                    {recipe?.ingredients && recipe.ingredients.length > 0 ? (
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

                <TouchableOpacity onPress={handleEditRecipe} style={styles.editRecipeButton}>
                    <FontAwesome name="pencil" size={20} color="#fff" style={styles.editButtonIcon} />
                    <Text style={styles.buttonText}>Editar Receta</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

// VideoDetailPlayer (sin cambios, excepto para el prop url, si puede ser vacío)
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
    }
});