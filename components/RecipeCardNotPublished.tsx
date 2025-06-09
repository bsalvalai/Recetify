import { Pressable, StyleSheet, Image, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
export default function RecipeCardNotPublished() {

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
    
    const handleEdit = () => {
        console.log("Editando receta");
    }
  return (
    <Pressable style={styles.container}>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUrl }} style={styles.recipeImage} />
        </View>

        <View style={styles.detailsContainer}>

            <View style={styles.titleDetails}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <View style={styles.editIcon}>
                    <TouchableOpacity onPress={handleEdit}> 
                        <FontAwesome name="edit" size={24} color={Colors.light.cardIcon}/>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.dateContainer}>
                <Text style={styles.dateText}>Receta aun sin publicar</Text>
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
    backgroundColor: Colors.light.background,
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
  dateContainer: {
    alignItems: 'center',   
    borderRadius: 10,
    backgroundColor: Colors.light.background, // Fondo del contenedor de la fecha
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
    backgroundColor: Colors.light.background, // Fondo del contenedor del icono de edición
  }
});