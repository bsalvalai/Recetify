import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
export default function CommentCard() {

    const imageUrl = "https://jumboalacarta.com.ar/wp-content/uploads/2019/06/shutterstock_521741356-1024x684.jpg"
    const user = 'bsalvalai'
    const rating = 4
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    //PARA TRUNCAR EL TEXTO SE PUEDE USAR JAVASCRIPT SLICE
    const MAX_CHARACTERS = 100; // Define tu límite de caracteres
  const displayedText = text.length > MAX_CHARACTERS
    ? text.slice(0, MAX_CHARACTERS) // Trunca
    : text; // Si no excede, muestra el texto completo
  return (
    <View style={styles.container}>

        <View style={styles.userRowDetails}>
            <View style={styles.userDetails}>
                <View style={styles.imageWrapper}>
                    <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
                </View>

                <Text style={styles.userText}>{user}</Text>
            </View>
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{rating}</Text>
                <FontAwesome name='star-o' color={"#000"} size={24}/>
            </View>
        </View>


        <View style={styles.detailsContainer}>

            <View style={styles.textDetails}>
                <View style={styles.titleContainer}>
                    <Text style={styles.text}
                    numberOfLines={3}>
                      {displayedText}
                    </Text>
                </View>
            </View>
            
    
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: Colors.light.cardBackground,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    borderRadius: 10,
    height: 120, //13% por si se necesita usar otras medidas
    marginHorizontal: 16,
    marginVertical: 15,
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingHorizontal: 10,
  },
  imageWrapper: {
    width: 30, // Ancho fijo para el contenedor de la imagen
    height: 30, // Altura fija para el contenedor de la imagen
    borderRadius: 15, // Hace el contenedor circular
    overflow: 'hidden', // Recorta la imagen a la forma circular
    marginVertical: 10,
    //marginHorizontal: 10,
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
    //flexDirection: 'column', // Los elementos dentro de detailsContainer se apilan verticalmente
    //justifyContent: 'space-evenly', // *** CLAVE: Distribuye el espacio entre las 3 secciones (arriba, medio, abajo)
    height: '100%', // Asegura que detailsContainer ocupe toda la altura disponible en la fila
    //marginRight: 10,
    backgroundColor: Colors.light.cardBackground,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Título a la izquierda, rating a la derecha
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10, // Espacio entre el título y la fecha
    width: "100%",
    //height: "100%",
    height: 58,
    backgroundColor: Colors.light.background,
    // No marginBottom aquí, ya lo maneja justifyContent en detailsContainer
  },
  textDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'center',   
    backgroundColor: Colors.light.cardBackground,
  },
  userDetails: {
    backgroundColor: Colors.light.cardBackground,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text, // Color del texto del usuario
  },
  text: {
    fontSize: 14,
    marginHorizontal: 10,
    color: Colors.light.text, // Color del texto
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    //marginRight: 10,
    //borderRadius: 10,
    width: 65, 
    height: 27,
    backgroundColor: Colors.light.cardBackground, // Fondo del contenedor de rating
    marginVertical: 10,
  },
    ratingText: {
      fontSize: 22, // Ajuste de tamaño
      //color: Colors.light.cardIcon, // Color rojo para el número de rating
      marginRight: 5,
      color: Colors.light.text, // Color del texto del rating
    },
    userRowDetails: {
        flexDirection: 'row',
        backgroundColor: Colors.light.cardBackground,
        justifyContent: 'space-between', // Autor a la izquierda, iconos a la derecha
        //paddingHorizontal: 100,
    }
});