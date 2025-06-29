// En RecipeCard.tsx

import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';

import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons'; // Asegúrate de que FontAwesome6 está importado
import { useState } from 'react';
import { router } from 'expo-router';

// Interfaz de las props que el componente RecipeCard espera recibir.
// Ahora, 'imageUrl' y 'commentsCount' son campos obligatorios,
// reflejando que tu API siempre los devuelve.
interface RecipeCardProps {
    recipe: {
        id: string;
        title: string;        // Nombre de la receta
        user: string;         // Usuario
        commentsCount: number; // Cantidad de comentarios
        imageUrl: string;     // Imagen de portada
        rating: number;       // Rating
        // Si tu backend devuelve una 'description' o cualquier otro campo adicional
        // pero no lo quieres usar en la tarjeta, puedes no incluirlo aquí.
        // Si lo vas a usar, agrégalo y úsalo en el componente.
    };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {

    const [isFav, setIsFav] = useState(false);

    console.log(`Receta cargada: ${recipe.title} (ID: ${recipe.id})`);
    const handleFav = () => {
        if (isFav) {
            setIsFav(false);
            console.log(`Quitado de favoritos: Receta ID ${recipe.id}`);
            // Lógica para comunicarse con el servidor para quitar de favoritos
        } else {
            setIsFav(true);
            console.log(`Agregado a favoritos: Receta ID ${recipe.id}`);
            // Lógica para comunicarse con el servidor para añadir a favoritos
        }
    };

    const handleRecipePress = () => {
        console.log(`Receta presionada: ${recipe.title} (ID: ${recipe.id})`);
        router.push({
            pathname: '/RecipeDetail', // Asegúrate de que esta ruta esté configurada en tu app
            params: { recipeId: recipe.id } // Pasa el ID de la receta como parámetro
        }); // Navega a la página de detalles de la receta
    };

    return (
        <Pressable style={styles.container} onPress={handleRecipePress}>

            <View style={styles.imageWrapper}>
                {/* Ahora usamos directamente recipe.imageUrl ya que es un campo esperado */}
                <Image
                    source={{ uri: recipe.imageUrl }}
                    style={styles.recipeImage}
                />
            </View>

            <View style={styles.detailsContainer}>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{recipe.title}</Text> {/* Nombre de la receta */}
                    <View style={styles.ratingContainer}>
                        <Text style={styles.ratingText}>{recipe.rating}</Text> {/* Rating */}
                        <FontAwesome name='star-o' color={Colors.light.cardIcon} size={24}/>
                    </View>
                </View>

                <View style={styles.authorRow}>
                    <View style={styles.userDetails}>
                        <Text style={styles.userText}>{recipe.user}</Text> {/* Usuario */}
                    </View>

                    <View style={styles.commentsDetails}>
                        <View style={styles.commentsContainer}>
                            <Text style={styles.commentsText}>{recipe.commentsCount}</Text> {/* Cantidad de comentarios */}
                            <FontAwesome name='comment-o' style={styles.commentsIcon} size={24}/>
                        </View>
                    </View>

                    <View style={styles.favIconDetails}>
                        <TouchableOpacity onPress={handleFav}>
                            <FontAwesome name={isFav ? 'heart' : 'heart-o'} style={styles.favIcon} size={20}/>
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
    title:{
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