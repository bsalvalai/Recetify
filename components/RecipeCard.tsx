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
                    // Si no hay username, no podemos verificar favoritos, pero la UI debe seguir cargando.
                    // Podrías deshabilitar el botón de favorito o redirigir.
                }
            } catch (error) {
                console.error('Error fetching username from AsyncStorage:', error);
            }
            // No establecemos isLoadingFavStatus a false aquí, porque la verificación de favoritos
            // depende de currentUsername y se hará en el siguiente useEffect.
        };
        fetchAndSetUsername();
    }, []); // Dependencia vacía: se ejecuta una vez al montar

    // useEffect 2: Verifica si la receta actual está en la lista de favoritos del usuario
    useEffect(() => {
        const checkRecipeFavoriteStatus = async () => {
            setIsLoadingFavStatus(true); // Empezar a cargar el estado de favorito
            console.log(`Verificando favoritos para el usuario: ${currentUsername}`);

            // === SECCIÓN DE DEPURACIÓN CLAVE ===
            if (!currentUsername || !URL_PUBLICA || !API_KEY) {
                //console.log("DEBUG: La verificación de favoritos se detuvo temprano.");
                //console.log("DEBUG: currentUsername:", currentUsername);
                //console.log("DEBUG: URL_PUBLICA:", URL_PUBLICA);
                //console.log("DEBUG: API_KEY:", API_KEY);
                setIsLoadingFavStatus(false);
                setIsFav(false);
                return; // Importante: Salir si alguna de estas es falsa/nula
            }
            // =====================================

            try {
                // *** AÑADE ESTE CONSOLE.LOG Y LA VARIABLE DE URL ***
                const getFavsUrl = `${URL_PUBLICA}/my-list/${currentUsername}`;
                //console.log(`HOLA (intentando GET) Recipe ID: ${recipe.id} for user: ${currentUsername}`);
                //console.log('DEBUG_GET_FAVS_URL:', getFavsUrl);
                // *************************************************

                const response = await axios.get(
                    getFavsUrl, // Usa la URL construida
                    {
                        headers: {
                            'x-api-key': API_KEY,
                        },
                    }
                );
                //console.log('Response from favorite check:', response.data);

                if (response.status === 200 && Array.isArray(response.data)) {
                    const isRecipeInFavorites = response.data.some((favRecipe: any) => {
                  // *** ¡CAMBIO CLAVE AQUÍ: favRecipe.recipe_id en lugar de favRecipe.id! ***
                  //console.log(`Comparando favRecipe.recipe_id: ${favRecipe.recipe_id} (type: ${typeof favRecipe.recipe_id}) con recipe.id: ${recipe.id} (type: ${typeof recipe.id})`);
                  return String(favRecipe.recipe_id) === String(recipe.id);
              });
                    setIsFav(isRecipeInFavorites);
                    //console.log(`Recipe ID ${recipe.id} is favorite: ${isRecipeInFavorites}`);
                } else {
                    console.warn('Unexpected response when checking favorites:', response.data);
                    setIsFav(false); // Por defecto, si la respuesta no es la esperada
                }
            } catch (error: any) {
                console.error('Error checking favorite status:', error);
                if (axios.isAxiosError(error)) {
                    // Depuración adicional del error de Axios
                    console.error('Axios error config (GET):', error.config);
                    console.error('Axios error request (GET):', error.request);
                    console.error('Axios error response (GET):', error.response); // Este será 'undefined' para 'Network Error'

                    if (error.response?.status === 404) {
                        console.log('User has no favorite list yet, assuming not favorite.');
                        setIsFav(false);
                    } else {
                        // Captura el mensaje del error si existe, de lo contrario, el mensaje genérico de Axios
                        const errorMessage = error.response?.data?.message || error.message;
                        console.error(`Axios Error (Status: ${error.response?.status || 'undefined'}): ${errorMessage}`);
                        setIsFav(false); // Si hay un error, asumimos que no es favorito o no se pudo verificar
                    }
                } else {
                    console.error(`Error inesperado (GET): ${error.message}`);
                    setIsFav(false);
                }
            } finally {
                setIsLoadingFavStatus(false); // Finalizar la carga del estado de favorito
            }
        };

        // Solo ejecutar esta verificación si currentUsername ya está disponible
        // y si la URL y la API_KEY están definidas (aunque el if de arriba también lo comprueba)
        if (currentUsername && URL_PUBLICA && API_KEY) {
            checkRecipeFavoriteStatus();
        }
    }, [currentUsername, recipe.id, URL_PUBLICA, API_KEY]);
    //console.log(`Receta cargada: ${recipe.title} (ID: ${recipe.id})`);

    const handleFav = async () => {
        if (!currentUsername) {
            console.warn('Usuario no cargado para agregar/quitar de favoritos.');
            // Aquí podrías mostrar una alerta al usuario para que inicie sesión
            // Alert.alert("Error", "Debes iniciar sesión para gestionar tus favoritos.");
            return;
        }

        // Optimistic UI update: Cambia el estado inmediatamente para una mejor experiencia de usuario
        // y reviértelo si la petición falla.
        const previousIsFav = isFav; // Guarda el estado actual
        setIsFav(!previousIsFav); // Cambia el estado inmediatamente en la UI

        if (previousIsFav) { // Si antes era favorito, el clic significa que se quiere QUITAR
            //console.log(`Intentando quitar de favoritos: Receta ID ${recipe.id}`);
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
                    // El setIsFav(false) ya se hizo al inicio si previousIsFav era true
                } else {
                    throw new Error(`Error al quitar de favoritos: ${response.status} ${response.statusText}`);
                }

            } catch (error: any) {
                console.error('Error al quitar de favoritos:', error);
                // Si falla, revertir el estado de la UI
                setIsFav(previousIsFav);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        console.log('La receta no estaba en favoritos (código 404), pero el UI se actualiza.');
                        // Si el backend dice 404, significa que ya no estaba, así que el estado false es correcto.
                        setIsFav(false);
                    } else {
                        const errorMessage = error.response?.data?.message || 'Error desconocido al quitar de favoritos.';
                        console.error(`Axios Error (Status: ${error.response?.status}): ${errorMessage}`);
                        // Alert.alert("Error", `No se pudo quitar de favoritos: ${errorMessage}`);
                    }
                } else {
                    console.error(`Error inesperado: ${error.message}`);
                    // Alert.alert("Error", `Ocurrió un error inesperado al quitar de favoritos.`);
                }
            }
        } else { // Si antes NO era favorito, el clic significa que se quiere AÑADIR
            //console.log(`Intentando agregar a favoritos: Receta ID ${recipe.id}`);
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
                    // El setIsFav(true) ya se hizo al inicio si previousIsFav era false
                } else {
                    throw new Error(`Error al agregar a favoritos: ${response.status} ${response.statusText}`);
                }

            } catch (error: any) {
                console.error('Error al agregar a favoritos:', error);
                // Si falla, revertir el estado de la UI
                setIsFav(previousIsFav);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 409) {
                        //console.log('La receta ya está en favoritos (código 409).');
                        // Aunque el backend dio 409, el objetivo es que sea favorito, así que el estado true es correcto.
                        setIsFav(true);
                        // Opcional: Alert.alert("Información", "Esta receta ya está en tus favoritos.");
                    } else {
                        const errorMessage = error.response?.data?.message || 'Error desconocido del servidor.';
                        console.error(`Axios Error (Status: ${error.response?.status}): ${errorMessage}`);
                        // Alert.alert("Error", `No se pudo agregar a favoritos: ${errorMessage}`);
                    }
                } else {
                    console.error(`Error inesperado: ${error.message}`);
                    // Alert.alert("Error", `Ocurrió un error inesperado.`);
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
                        numberOfLines={1}    // <--- ¡Esto es clave para acortar a 2 líneas!
                        ellipsizeMode="tail" // <--- Añade "..." al final si se corta
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
                                // Muestra un spinner mientras se carga el estado de favorito
                                <ActivityIndicator size="small" color={Colors.light.cardIcon} />
                            ) : (
                                <FontAwesome name={isFav ? 'heart' : 'heart-o'} style={styles.favIcon} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

// ... Tus estilos (styles) se mantienen igual
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
        //flex: 1,
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
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: Colors.light.background,
    },
    dateText: {
        color: Colors.light.cardText,
        fontSize: 12,
    }
});