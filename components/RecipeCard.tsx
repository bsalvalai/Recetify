// En RecipeCard.tsx

import { Pressable, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants'; // Asegúrate de importar Constants

// Interfaz de las props que el componente RecipeCard espera recibir.
interface RecipeCardProps {
    recipe: {
        id: string;
        title: string;
        user: string;
        commentsCount: number;
        imageUrl: string;
        rating: number;
        date: string | null; // Asegúrate de que la fecha sea opcional
    };
}

// Asegúrate de usar Constants.expoConfig?.extra para obtener las variables de entorno
const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_KEY || process.env.EXPO_PUBLIC_API_KEY; // Tu API Key

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const [isFav, setIsFav] = useState(false); // Estado inicial: no favorito (se actualizará)
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [isLoadingFavStatus, setIsLoadingFavStatus] = useState(true); // Nuevo estado para indicar carga

    // useEffect 1: Carga el nombre de usuario de AsyncStorage (se ejecuta una vez)
    useEffect(() => {
        const fetchAndSetUsername = async () => {
            try {
                const usernameFromStorage = await AsyncStorage.getItem('username');
                if (usernameFromStorage) {
                    console.log('Username fetched from AsyncStorage:', usernameFromStorage);
                    setCurrentUsername(usernameFromStorage);
                } else {
                    console.log('No username found in AsyncStorage. User might not be logged in.');
                }
            } catch (error) {
                console.error('Error fetching username from AsyncStorage:', error);
            }
        };
        fetchAndSetUsername();
        console.log(recipe.date)
    }, []);

    // useEffect 2: Verifica si la receta actual está en la lista de favoritos del usuario
    useEffect(() => {
        const checkRecipeFavoriteStatus = async () => {
            setIsLoadingFavStatus(true);
            console.log(`Verificando favoritos para el usuario: ${currentUsername}`);

            if (!currentUsername || !URL_PUBLICA || !API_KEY) {
                setIsLoadingFavStatus(false);
                setIsFav(false);
                return;
            }

            try {
                const getFavsUrl = `${URL_PUBLICA}/my-list/${currentUsername}`;
                const response = await axios.get(
                    getFavsUrl,
                    {
                        headers: {
                            'x-api-key': API_KEY,
                        },
                    }
                );

                if (response.status === 200 && Array.isArray(response.data)) {
                    const isRecipeInFavorites = response.data.some((favRecipe: any) => {
                        return String(favRecipe.recipe_id) === String(recipe.id);
                    });
                    setIsFav(isRecipeInFavorites);
                } else {
                    console.warn('Unexpected response when checking favorites:', response.data);
                    setIsFav(false);
                }
            } catch (error: any) {
                console.error('Error checking favorite status:', error);
                if (axios.isAxiosError(error)) {
                    console.error('Axios error config (GET):', error.config);
                    console.error('Axios error request (GET):', error.request);
                    console.error('Axios error response (GET):', error.response);

                    if (error.response?.status === 404) {
                        console.log('User has no favorite list yet, assuming not favorite.');
                        setIsFav(false);
                    } else {
                        const errorMessage = error.response?.data?.message || error.message;
                        console.error(`Axios Error (Status: ${error.response?.status || 'undefined'}): ${errorMessage}`);
                        setIsFav(false);
                    }
                } else {
                    console.error(`Error inesperado (GET): ${error.message}`);
                    setIsFav(false);
                }
            } finally {
                setIsLoadingFavStatus(false);
            }
        };

        if (currentUsername && URL_PUBLICA && API_KEY) {
            checkRecipeFavoriteStatus();
        }
    }, [currentUsername, recipe.id, URL_PUBLICA, API_KEY]);

    const handleFav = async () => {
        if (!currentUsername) {
            console.warn('Usuario no cargado para agregar/quitar de favoritos.');
            return;
        }

        const previousIsFav = isFav;
        setIsFav(!previousIsFav);

        if (previousIsFav) {
            try {
                const response = await axios.delete(
                    `${URL_PUBLICA}/my-list/${currentUsername}?recetaId=${recipe.id}`,
                    {
                        headers: {
                            'x-api-key': API_KEY,
                        },
                    }
                );

                if (response.status === 200 || response.status === 204) {
                    console.log('Receta eliminada de favoritos exitosamente');
                } else {
                    throw new Error(`Error al quitar de favoritos: ${response.status} ${response.statusText}`);
                }

            } catch (error: any) {
                console.error('Error al quitar de favoritos:', error);
                setIsFav(previousIsFav);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        console.log('La receta no estaba en favoritos (código 404), pero el UI se actualiza.');
                        setIsFav(false);
                    } else {
                        const errorMessage = error.response?.data?.message || 'Error desconocido al quitar de favoritos.';
                        console.error(`Axios Error (Status: ${error.response?.status}): ${errorMessage}`);
                    }
                } else {
                    console.error(`Error inesperado: ${error.message}`);
                }
            }
        } else {
            try {
                const response = await axios.post(
                    `${URL_PUBLICA}/my-list/${currentUsername}?recetaId=${recipe.id}`,
                    null,
                    {
                        headers: {
                            'x-api-key': API_KEY,
                        },
                    }
                );

                if (response.status === 200 || response.status === 201) {
                    console.log('Receta agregada a favoritos exitosamente');
                } else {
                    throw new Error(`Error al agregar a favoritos: ${response.status} ${response.statusText}`);
                }

            } catch (error: any) {
                console.error('Error al agregar a favoritos:', error);
                setIsFav(previousIsFav);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 409) {
                        setIsFav(true);
                    } else {
                        const errorMessage = error.response?.data?.message || 'Error desconocido del servidor.';
                        console.error(`Axios Error (Status: ${error.response?.status}): ${errorMessage}`);
                    }
                } else {
                    console.error(`Error inesperado: ${error.message}`);
                }
            }
        }
    };

    const handleRecipePress = () => {
        console.log(`Receta presionada: ${recipe.title} (ID: ${recipe.id})`);
        router.push({
            pathname: '/RecipeDetail',
            params: { recipeId: recipe.id }
        });
    };

    
    return (
        <Pressable style={styles.container} onPress={handleRecipePress}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.recipeImage}
                />
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {recipe.title}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{recipe.rating}</Text>
                        <FontAwesome name='star-o' color={Colors.light.cardIcon} size={24} />
                    </View>
                </View>

                <View style={styles.authorRow}>
                    <View style={styles.userDetails}>
                        <Text style={styles.userText}>{recipe.user}</Text>
                    </View>

                    <View style={styles.commentsDetails}>
                        <View style={styles.commentsContainer}>
                            <Text style={styles.commentsText}>{recipe.commentsCount}</Text>
                            <FontAwesome name='comment-o' style={styles.commentsIcon} size={24} />
                        </View>
                    </View>

                    <View style={styles.favIconDetails}>
                        <TouchableOpacity onPress={handleFav} disabled={isLoadingFavStatus}>
                            {isLoadingFavStatus ? (
                                <ActivityIndicator size="small" color={Colors.light.cardIcon} />
                            ) : (
                                <FontAwesome name={isFav ? 'heart' : 'heart-o'} style={styles.favIcon} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* *** AQUI: Mostrar la fecha de publicación *** */}
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>Publicada el: {recipe.date}</Text>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.cardBackground,
        borderWidth: 1,
        borderColor: Colors.light.cardBorder,
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
        backgroundColor: Colors.light.cardBackground,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: Colors.light.background,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
        color: Colors.light.cardTitle,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: Colors.light.background,

    },
    ratingText: {
        fontSize: 16,
        color: Colors.light.cardIcon,
        marginRight: 5,
    },
    authorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.cardBackground
    },
    userDetails: {
        width: 113,
        height: 27,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    userText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.light.cardText,
    },
    commentsDetails: {
        width: 65,
        height: 27,
        justifyContent: 'center',
        borderRadius: 10,
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    commentsContainer: {
        flexDirection: "row",
        alignItems: 'center',
        height: 27,
        backgroundColor: Colors.light.background,
    },
    commentsText: {
        color: Colors.light.cardText,
        marginTop: 3,
        marginRight: 5,
    },
    commentsIcon: {
        color: Colors.light.cardIcon,
        paddingBottom: 4,
    },
    favIconDetails: {
        width: 50,
        height: 27,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    favIcon: {
        color: Colors.light.cardIcon,
        marginTop: 2,
    },
    dateContainer: {
        alignItems: 'center', // Centra el texto horizontalmente
        borderRadius: 10,
        backgroundColor: Colors.light.background,
        // Agrega un poco de margen superior para separarlo del row anterior
        marginTop: 5,
        paddingHorizontal: 10, // Un poco de padding horizontal
    },
    dateText: {
        color: Colors.light.cardText,
        fontSize: 12,
        textAlign: 'center', // Asegura que el texto esté centrado si la fecha es corta
    }
});