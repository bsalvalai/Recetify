import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import EditScreenInfo from '@/components/EditScreenInfo';
import { Text, View } from '@/components/Themed';
import RecipeCard from '@/components/RecipeCard';
import RecipeCardPublished from '@/components/RecipeCardPublished';
import RecipeCardNotPublished from '@/components/RecipeCardNotPublished';
import CommentCard from '@/components/CommentCard';
import Colors from '@/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
export default function HomeScreen() {

  //Me tengo que traer las 3 ultimas recetas si es que el buscador esta vacio.

  //HABRIA QUE PASARLE PARAMETROS A LA RECIPECARD

  const handleOnPress = () => {
    console.log("BUSQUEDA");
    //Se deberia hacer la busqueda de recetas con el filtro seleccionado
  }

  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    "Nombre",
    "Ingrediente",
    "Sin ingrediente",
    "Tipo",
    "Usuario"
  ];

  useEffect(() => {
    setSelectedFilter(filters[0]); // Inicializar el primer filtro como seleccionado
  }, []);
  
  return (
    <View style={styles.container}>
      
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>
      <View style={styles.textInputContainer}> 
        <TextInput 
          style={styles.textInput}
          placeholder="Buscar Recetas"
          placeholderTextColor={Colors.light.text}/>
        <TouchableOpacity>
          <FontAwesome6 name="magnifying-glass" size={24} onPress={handleOnPress}/>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {filters.map((filter, idx) => (
          <View
            key={filter}
            style={[
              styles.filter,
              selectedFilter === filter && styles.filterSelected,
              idx >= 3 && styles.flexWrapFilter
            ]}
          >
            <Text
              style={styles.filterText}
              onPress={() => setSelectedFilter(filter)}
            >
              {filter}
            </Text>
          </View>
        ))}

      </View >

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Las ultimas novedades!</Text>
      </View>

      <RecipeCard />
      <CommentCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    
  },
  title: {
    fontSize: 24,
    color: Colors.light.text,
    //fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    backgroundColor: Colors.light.background,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 30,
    paddingHorizontal: 20,
    height: 40,
    marginBottom: 20,
    shadowColor: "#000",
  },
  filter: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.filter,
    borderRadius: 15,
    height: 40,
    width: 100,
    marginTop: 15,
    //marginHorizontal: 16,
  },
  filterText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: "#fff",

  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    //width: '100%',
    backgroundColor: Colors.light.background,
  },
  flexWrapFilter: {
    flexDirection: 'row',
    justifyContent: 'center',
    //width: '80%', 
    alignItems: 'center',
    alignSelf: 'center',
  },
  filterSelected: {
    borderWidth: 5,
    borderColor: Colors.light.cardBorder, 
  },
});
