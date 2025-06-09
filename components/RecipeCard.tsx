import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
export default function RecipeCard() {

    const imageUrl = "https://jumboalacarta.com.ar/wp-content/uploads/2019/06/shutterstock_521741356-1024x684.jpg"
    const user = 'bsalvalai'
    const rating = 4.5
    const comments = 20
    const publicationDate = '08/04/2025'
    const title = "Albondigas"

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
    
  return (
    <Pressable style={styles.container}>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
        </View>

        <View style={styles.detailsContainer}>

            <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{rating}</Text>
                    <FontAwesome name='star-o' color={Colors.light.cardIcon} size={24}/>
                </View>
            </View>

            <View style={styles.authorRow}>

                <View style={styles.userDetails}> 
                  <Text style={styles.userText}>{user}</Text>
                </View>
                
                <View style={styles.commentsDetails}> 
                  <View style={styles.commentsContainer}>
                    <Text style={styles.commentsText}>{comments}</Text>
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
                <Text style={styles.dateText}>Fecha de publicacion: {publicationDate}</Text>
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
    backgroundColor: Colors.light.background,
    // No marginBottom aquí, ya lo maneja justifyContent en detailsContainer
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
    marginRight: 10,
    backgroundColor: Colors.light.background, // Fondo del contenedor de rating
  },
  ratingText: {
    fontSize: 16, // Ajuste de tamaño
    color: Colors.light.cardIcon, // Color rojo para el número de rating
    marginRight: 5,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Autor a la izquierda, iconos a la derecha
    alignItems: 'center',
    //borderRadius: 10,
    backgroundColor: Colors.light.cardBackground
    // No marginBottom aquí, ya lo maneja justifyContent en detailsContainer
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