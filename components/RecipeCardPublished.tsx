import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import { router } from 'expo-router';

// Interfaz de las props que el componente RecipeCardPublished espera recibir.
interface RecipeCardPublishedProps {
    recipe: {
        id: string;
        title: string;
        user: string;
        commentsCount: number;
        imageUrl: string;
        rating: number;
    };
}

export default function RecipeCardPublished({ recipe }: RecipeCardPublishedProps) {
    const [isFav, setIsFav] = useState(false)

    //LA FUNCION DE ABAJO TENDRIA QUE SER ASINCRONA Y COMUNICARSE CON EL SERVIDOR PARA HACER EL CAMBIO
    //TAMBIEN SE PUEDE USAR UN INDICADOR DE CARGA
    const handleFav = () => {
        if(isFav){
            setIsFav(false)
            console.log("Quitado de favoritos")
        }
        else {
            setIsFav(true)
            console.log("Agregado a favoritos")
        }
    }
    
    const handleEdit = () => {
        console.log("Editando receta con ID:", recipe.id);
        router.push({
            pathname: '/EditRecipe',
            params: { recipeId: recipe.id }
        });
    }

    const handleCardPress = () => {
        console.log("Navegando a detalle de receta con ID:", recipe.id);
        router.push({
            pathname: '/RecipeDetail',
            params: { ID: recipe.id }
        });
    }

  return (
    <Pressable style={styles.container} onPress={handleCardPress}>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
        </View>

        <View style={styles.detailsContainer}>

            <View style={styles.titleDetails}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{recipe.title}</Text>
                </View>
                <View style={styles.editIcon}>
                    <TouchableOpacity onPress={handleEdit}> 
                        <FontAwesome name="edit" size={24} color={Colors.light.cardIcon}/>
                    </TouchableOpacity>
                </View>
            </View>
            

            <View style={styles.metricsRow}>

                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{recipe.rating}</Text>
                    <FontAwesome name='star-o' color={Colors.light.cardIcon} size={24}/>
                </View>

                <View style={styles.commentsDetails}> 
                  <View style={styles.commentsContainer}>
                    <Text style={styles.commentsText}>{recipe.commentsCount}</Text>
                    <FontAwesome name='comment-o' style={styles.commentsIcon} size={24}/> 
                  </View>
                </View>

                <View style={styles.favIconDetails}>
                  <TouchableOpacity onPress={handleFav}>
                    <FontAwesome name={isFav ? 'heart' : 'heart-o'} style={styles.favIcon} size={20}/>
                  </TouchableOpacity>
                </View>
            </View>

            <View style={styles.dateContainer}>
                <Text style={styles.dateText}>Autor: {recipe.user}</Text>
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
    height: 120, //13% por si se necesita usar otras medidas
    marginHorizontal: 16,
    marginVertical: 15,
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  imageWrapper: {
    width: 78, // Ancho fijo para el contenedor de la imagen
    height: 78, // Altura fija para el contenedor de la imagen
    borderRadius: 10, // Hace el contenedor circular
    overflow: 'hidden', // Recorta la imagen a la forma circular
    marginVertical: 10,
    marginHorizontal: 10,
    justifyContent: 'center', // Centra la imagen dentro del círculo
    alignItems: 'center',
  },
  recipeImage: {
    width: '100%', // La imagen ocupa el 100% de su contenedor (circular)
    height: '100%',
    resizeMode: 'cover', // Asegura que la imagen cubra el círculo
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column', // Los elementos dentro de detailsContainer se apilan verticalmente
    justifyContent: 'space-evenly', // *** CLAVE: Distribuye el espacio entre las 3 secciones (arriba, medio, abajo)
    height: '100%', // Asegura que detailsContainer ocupe toda la altura disponible en la fila
    marginRight: 10,
    backgroundColor: Colors.light.cardBackground,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Título a la izquierda, rating a la derecha
    alignItems: 'center',
    borderRadius: 10,
    width: "80%",
    backgroundColor: Colors.light.background, // Fondo del contenedor del título
    // No marginBottom aquí, ya lo maneja justifyContent en detailsContainer
  },
  titleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',   
    backgroundColor: Colors.light.cardBackground,
  },
  title:{
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
    color: Colors.light.cardTitle, // Color del título
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginRight: 10,
    borderRadius: 10,
    width: 65, 
    height: 27,
    justifyContent: 'center',
    backgroundColor: Colors.light.background, // Fondo del contenedor de rating
  },
  ratingText: {
    fontSize: 16, // Ajuste de tamaño
    color: Colors.light.cardIcon, // Color rojo para el número de rating
    marginRight: 5,
  },
  metricsRow: {
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
    height: 1,
  },
  commentsText: {
    color: Colors.light.cardText,
    marginTop: 3,
    marginRight: 5,
  },
  commentsIcon: {
    color: Colors.light.cardIcon,
    marginBottom: 4,
  },
  favIconDetails: {
    width: 50,
    height: 27,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background
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
  },
  editIcon: {
    color: Colors.light.cardIcon,
    width: 40,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  }
});