import { Pressable, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native'; // Importar ActivityIndicator

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { router } from 'expo-router';

// --- IMPORTAR MappedRecipe desde el archivo de tipos unificado ---
// ¡ASEGÚRATE DE QUE ESTA RUTA SEA CORRECTA PARA TU PROYECTO!
import { MappedRecipe } from '../components/RecipeTypes'; // Ajusta la ruta según tu estructura de carpetas

// Interfaz de las props que el componente RecipeCardPublished espera recibir.
interface RecipeCardPublishedProps {
    // ¡Ahora el tipo 'recipe' es MappedRecipe directamente importado!
    recipe: MappedRecipe; 
}

export default function RecipeCardPublished({ recipe }: RecipeCardPublishedProps) {
    // Mantener el estado de favoritos localmente para la UI optimista
    const [isFav, setIsFav] = useState(false);
    const [isLoadingFav, setIsLoadingFav] = useState(false); // Nuevo estado para el indicador de carga

    // La función de favoritos ahora es asíncrona y simula una llamada a la API
    const handleFav = async () => {
        if (isLoadingFav) return; // Evitar múltiples clics mientras carga

        setIsLoadingFav(true); // Iniciar carga
        const previousIsFav = isFav; // Guardar el estado actual para revertir si falla
        setIsFav(!previousIsFav); // Actualización optimista de la UI

        try {
            // Aquí iría tu lógica real para interactuar con el backend
            // Por ejemplo, una llamada a axios.post o axios.delete
            console.log(`Simulando ${previousIsFav ? 'quitar de' : 'agregar a'} favoritos para receta ID: ${recipe.id}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simular retardo de red

            // Si la llamada al backend falla, podrías hacer:
            // throw new Error("Fallo la operación de favoritos");

            console.log(`Operación de favoritos exitosa para receta ID: ${recipe.id}`);
        } catch (error) {
            console.error("Error en la operación de favoritos:", error);
            setIsFav(previousIsFav); // Revertir la UI si falla
            // Opcional: mostrar un Alert al usuario
            // Alert.alert("Error", "No se pudo actualizar el estado de favoritos.");
        } finally {
            setIsLoadingFav(false); // Finalizar carga
        }
    };

    const handleEdit = () => {
        console.log("Editando receta con ID:", recipe.id);
        router.push({
            pathname: '/EditRecipe', // Asegúrate de que esta ruta sea correcta
            params: { recipeId: recipe.id }
        });
    }

    const handleCardPress = () => {
        console.log("Navegando a detalle de receta con ID:", recipe.id);
        router.push({
            pathname: '/RecipeDetail',
            params: { recipeId: recipe.id }
        });
    }

    return (
        <Pressable style={styles.container} onPress={handleCardPress}>

            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: recipe.imageUrl || 'https://via.placeholder.com/150' }} // Fallback
                    style={styles.recipeImage}
                />
            </View>

            <View style={styles.detailsContainer}>

                <View style={styles.titleDetails}>
                    <View style={styles.titleContainer}>
                        <Text
                            style={styles.title}
                            numberOfLines={1} // Limita el título a una línea
                            ellipsizeMode="tail" // Añade "..." si el título es muy largo
                        >
                            {recipe.title}
                        </Text>
                    </View>
                    <View style={styles.editIcon}>
                        <TouchableOpacity onPress={handleEdit}>
                            <FontAwesome name="edit" size={24} color={Colors.light.cardIcon || '#000'} /> {/* Fallback */}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.metricsRow}>

                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{recipe.rating.toFixed(1)}</Text> {/* Mostrar con un decimal */}
                        <FontAwesome name='star-o' color={Colors.light.cardIcon || '#FFD700'} size={24} /> {/* Fallback */}
                    </View>

                    <View style={styles.commentsDetails}>
                        <View style={styles.commentsContainer}>
                            <Text style={styles.commentsText}>{recipe.commentsCount}</Text>
                            <FontAwesome name='comment-o' style={styles.commentsIcon} size={24} />
                        </View>
                    </View>

                    <View style={styles.favIconDetails}>
                        <TouchableOpacity onPress={handleFav} disabled={isLoadingFav}>
                            {isLoadingFav ? (
                                <ActivityIndicator size="small" color={Colors.light.cardIcon || '#000'} />
                            ) : (
                                <FontAwesome name={isFav ? 'heart' : 'heart-o'} style={styles.favIcon} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* --- ¡AQUÍ ES DONDE AGREGAMOS LA FECHA DE PUBLICACIÓN! --- */}
                <View style={styles.dateContainer}>
                    {/* Añadido operador de encadenamiento opcional y fallback para manejar `null` */}
                    <Text style={styles.dateText}>Publicada el: {recipe.date ?? 'Fecha desconocida'}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.cardBackground || '#FFF',
        borderWidth: 1,
        borderColor: Colors.light.cardBorder || '#E0E0E0',
        borderRadius: 10,
        height: 120,
        marginHorizontal: 16,
        marginVertical: 15,
        flexDirection: 'row',
        alignSelf: 'stretch',
    },
    imageWrapper: {
        width: 78,
        height: 78,
        borderRadius: 10,
        overflow: 'hidden',
        marginVertical: 10,
        marginHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recipeImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    detailsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        height: '100%',
        marginRight: 10,
        backgroundColor: Colors.light.cardBackground || '#FFF',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        width: "80%", // Ajustado para dejar espacio al ícono de edición
        backgroundColor: Colors.light.background || 'transparent',
    },
    titleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.cardBackground || '#FFF',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
        color: Colors.light.cardTitle || '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        width: 65,
        height: 27,
        justifyContent: 'center',
        backgroundColor: Colors.light.background || 'transparent',
    },
    ratingText: {
        fontSize: 10,
        color: Colors.light.cardIcon || '#FFD700',
        marginRight: 5,
    },
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.cardBackground || '#FFF',
    },
    commentsDetails: {
        width: 65,
        height: 27,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.light.background || 'transparent',
    },
    commentsContainer: {
        flexDirection: "row",
        alignItems: 'center',
        height: 27,
        backgroundColor: Colors.light.background || 'transparent',
    },
    commentsText: {
        color: Colors.light.cardText || '#666',
        marginTop: 3,
        marginRight: 5,
        fontSize: 10, // Ajustado para que sea más pequeño
    },
    commentsIcon: {
        color: Colors.light.cardIcon || '#666',
        marginBottom: 4,
    },
    favIconDetails: {
        width: 50,
        height: 27,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background || 'transparent',
    },
    favIcon: {
        color: Colors.light.cardIcon || '#FF6347',
        marginTop: 2,
    },
    dateContainer: {
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: Colors.light.background || 'transparent',
        marginTop: 5, // Un pequeño margen para separarlo de la fila de métricas
    },
    dateText: {
        color: Colors.light.cardText || '#666',
        fontSize: 7,
    },
    editIcon: {
        color: Colors.light.cardIcon || '#000',
        width: 40,
        height: 30,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background || 'transparent',
    }
});