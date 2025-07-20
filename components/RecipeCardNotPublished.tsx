import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

import { MappedRecipe } from '../components/RecipeTypes'; // Ajusta la ruta si es necesario

interface RecipeCardNotPublishedProps {
    recipe: MappedRecipe;
    onPress?: (recipeId: string) => void;
    onEditPress?: (recipeId: string) => void;
}

export default function RecipeCardNotPublished({ recipe, onPress, onEditPress }: RecipeCardNotPublishedProps) {
    const router = useRouter();

    const { id, title, imageUrl } = recipe; // Desestructuramos para la visualización de la tarjeta

    const handleCardPress = () => {
        console.log(`LOG: RecipeCardNotPublished - Tarjeta presionada. ID: ${id}, Título: ${title}`);
        if (onPress) {
            onPress(id);
        } else {
            // --- CAMBIO CLAVE AQUÍ ---
            router.push({
                pathname: '/RecipeNotPublishedDetail',
                params: {
                    // ¡Envía la receta completa, serializada como JSON!
                    // El nombre del parámetro DEBE coincidir con el esperado en el destino.
                    unpublishedRecipeData: JSON.stringify(recipe)
                }
            });
            console.log(`LOG: RecipeCardNotPublished - Navegando a /RecipeNotPublishedDetail con datos de receta. Data size: ${JSON.stringify(recipe).length} bytes`);
        }
    };

    const handleEdit = () => {
    console.log(`LOG: RecipeCardNotPublished - Botón de editar presionado. ID: ${id}, Título: ${title}`);
    if (onEditPress) {
        onEditPress(id); // Si tienes una prop onEditPress, úsala como fallback
    } else {
        // La forma correcta de navegar a EditRecipeNotPublished
        // y pasar el ID de la receta es así:
        router.push({
            pathname: '/EditRecipeNotPublished', // Asegúrate de que esta sea la ruta correcta
            params: { recipeId: id } // Aquí pasamos el 'id' como 'recipeId'
        });
        console.log(`LOG: RecipeCardNotPublished - Navegando a /EditRecipeNotPublished con ID de receta: ${id}`);
    }
};

    return (
        <Pressable style={styles.container} onPress={handleCardPress}>
            <View style={styles.imageWrapper}>
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.recipeImage}
                />
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.titleDetails}>
                    <View style={styles.titleContainer}>
                        <Text
                            style={styles.title}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {title}
                        </Text>
                    </View>
                    <View style={styles.editIcon}>
                        <TouchableOpacity onPress={handleEdit}>
                            <FontAwesome name="edit" size={24} color={Colors.light.cardIcon || '#000'} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>Receta aún sin publicar</Text>
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
        flexDirection: 'row', // Esto podría ser 'column' si el título es largo y necesitas espacio
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 10,
        width: "80%", // Ajustar según el espacio disponible
        backgroundColor: Colors.light.background || 'transparent',
    },
    titleDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.light.cardBackground || '#FFF',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginLeft: 10,
        color: Colors.light.cardTitle || '#333',
    },
    dateContainer: {
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: Colors.light.background || 'transparent',
    },
    dateText: {
        color: Colors.light.cardText || '#666',
        fontSize: 12,
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