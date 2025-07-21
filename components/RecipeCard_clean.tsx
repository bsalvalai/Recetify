import { Pressable, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';

// Tipos e interfaces (temporalmente usando tipos mock para el desarrollo)
interface Recipe {
    id: string;
    title: string;
    imageUrl: string;
    user: string;
    rating: number;
    commentsCount: number;
    publicationDate: string;
}

// Props del componente
interface RecipeCardProps {
    recipe?: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    // Datos mock para desarrollo si no se pasa recipe como prop
    const mockRecipe: Recipe = {
        id: "1",
        title: "Albondigas",
        imageUrl: "https://jumboalacarta.com.ar/wp-content/uploads/2019/06/shutterstock_521741356-1024x684.jpg",
        user: 'bsalvalai',
        rating: 4.5,
        commentsCount: 20,
        publicationDate: '08/04/2025'
    };

    const recipeData = recipe || mockRecipe;
    const [isFav, setIsFav] = useState(false);
    const [isLoadingFavStatus, setIsLoadingFavStatus] = useState(false);

    // Variables temporales para desarrollo (deberían venir de contexto/configuración)
    const currentUsername = 'usuario_actual';
    const URL_PUBLICA = 'https://api.ejemplo.com';
    const API_KEY = 'tu_api_key_aqui';

    // Función async para manejar favoritos
    const handleFav = async () => {
        setIsLoadingFavStatus(true);
        
        // Optimistic UI update: Cambia el estado inmediatamente para una mejor experiencia de usuario
        const previousIsFav = isFav;
        setIsFav(!previousIsFav);

        try {
            if (previousIsFav) {
                // Quitar de favoritos
                console.log(`Quitando de favoritos: Receta ID ${recipeData.id}`);
                // Simulación de llamada API - reemplazar con axios cuando esté disponible
                // const response = await axios.delete(
                //     `${URL_PUBLICA}/my-list/${currentUsername}?recetaId=${recipeData.id}`,
                //     {
                //         headers: {
                //             'x-api-key': API_KEY,
                //         },
                //     }
                // );
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Receta eliminada de favoritos exitosamente');
                
            } else {
                // Agregar a favoritos
                console.log(`Agregando a favoritos: Receta ID ${recipeData.id}`);
                // Simulación de llamada API - reemplazar con axios cuando esté disponible
                // const response = await axios.post(
                //     `${URL_PUBLICA}/my-list/${currentUsername}?recetaId=${recipeData.id}`,
                //     null,
                //     {
                //         headers: {
                //             'x-api-key': API_KEY,
                //         },
                //     }
                // );
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Receta agregada a favoritos exitosamente');
            }
        } catch (error: any) {
            console.error('Error al manejar favoritos:', error);
            // Si falla, revertir el estado de la UI
            setIsFav(previousIsFav);
        } finally {
            setIsLoadingFavStatus(false);
        }
    };

    const handleRecipePress = () => {
        console.log(`Receta presionada: ${recipeData.title} (ID: ${recipeData.id})`);
        // Navegación comentada hasta que router esté disponible
        // router.push({
        //     pathname: '/RecipeDetail',
        //     params: { recipeId: recipeData.id }
        // });
    };

    return (
        <Pressable style={styles.container} onPress={handleRecipePress}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: recipeData.imageUrl }}
                    style={styles.recipeImage}
                />
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {recipeData.title}
                    </Text>
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{recipeData.rating}</Text>
                        <FontAwesome name='star-o' color={Colors.light.cardIcon} size={24} />
                    </View>
                </View>

                <View style={styles.authorRow}>
                    <View style={styles.userDetails}>
                        <Text style={styles.userText}>{recipeData.user}</Text>
                    </View>

                    <View style={styles.commentsDetails}>
                        <View style={styles.commentsContainer}>
                            <Text style={styles.commentsText}>{recipeData.commentsCount}</Text>
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

                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>Fecha de publicación: {recipeData.publicationDate}</Text>
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
        fontSize: 20,
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
