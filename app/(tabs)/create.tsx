import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView, // Usamos ScrollView para que la pantalla sea desplazable
  Platform, // Para adaptar el Picker
  Alert, // Para mostrar mensajes de éxito/error
} from 'react-native';
import { Stack } from 'expo-router'; // Si necesitas configurar el header
import { Picker } from '@react-native-picker/picker'; // Para el selector de tipo de plato
import FontAwesome from '@expo/vector-icons/FontAwesome';

import Colors from '@/constants/Colors'; // Asegúrate de tener tus colores definidos aquí
import {Video} from 'expo-av';
export default function CreateScreen() {
  const [recipeName, setRecipeName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlateType, setSelectedPlateType] = useState(''); // Estado para el tipo de plato
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '' } // Estado inicial para un ingrediente vacío
  ]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleIngredientChange = (text: string, index: number, field: 'name' | 'quantity' | 'unit') => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: text };
    setIngredients(newIngredients);
  };

  const handleSubmit = () => {
    // Aquí puedes manejar el envío de la receta
    if (!recipeName || !imageUrl || !description || !selectedPlateType || ingredients.some(ing => !ing.name || !ing.quantity || !ing.unit)) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    // Validar al menos un ingrediente con nombre y cantidad
    const validIngredients = ingredients.filter(ing => ing.name && ing.quantity);
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Por favor, agregue al menos un ingrediente.');
      return;
    }

    const newRecipe = {
      name: recipeName,
      imageUrl: imageUrl,
      description: description,
      plateType: selectedPlateType,
      ingredients: validIngredients,
    };

    // Aquí podrías enviar los datos a tu backend o hacer lo que necesites
    // LLAMAR A LA API
    Alert.alert('Éxito', 'Receta creada correctamente.');
  };

  return (
    <View style={styles.fullScreenContainer}>
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>
      <Stack.Screen options={{ title: 'Crear receta', headerTitleAlign: 'center' }} /> {/* Configura el header aquí */}

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.section}>
          <Text style={styles.label}>Ingrese el nombre de la receta</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese el nombre de la receta..."
            placeholderTextColor={Colors.light.text}
            value={recipeName}
            onChangeText={setRecipeName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ingrese URL de la imagen de la portada</Text>
          <TextInput
            style={styles.input}
            placeholder="Coloque la URL de la imagen..."
            placeholderTextColor={Colors.light.text}
            value={imageUrl}
            onChangeText={setImageUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Breve descripción de su receta</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Haga una breve descripción de su receta..."
            placeholderTextColor={Colors.light.text}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4} // Puedes ajustar el número de líneas visible
            textAlignVertical="top" // Para alinear el placeholder en la parte superior en Android
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Indique el tipo de plato</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPlateType}
              onValueChange={(itemValue, itemIndex) => setSelectedPlateType(itemValue)}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : null} // iOS necesita esto para estilos
            >
              <Picker.Item label="Sin especificar" value="" />
              <Picker.Item label="Carne" value="meat" />
              <Picker.Item label="Pasta" value="pasta" />
              <Picker.Item label="Guiso" value="stew" />
              <Picker.Item label="Sopa" value="soup" />
              {/* Puedes añadir más tipos de plato aquí */}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ingredientes</Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientNameInput]}
                placeholder="Ingrese el ingrediente..."
                placeholderTextColor={Colors.light.text}
                value={ingredient.name}
                onChangeText={(text) => handleIngredientChange(text, index, 'name')}
              />
              <TextInput
                style={[styles.input, styles.ingredientQuantityInput]}
                placeholder="Cantidad"
                placeholderTextColor={Colors.light.text}
                value={ingredient.quantity}
                onChangeText={(text) => handleIngredientChange(text, index, 'quantity')}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.ingredientUnitInput]}
                placeholder="Medida"
                placeholderTextColor={Colors.light.text}
                value={ingredient.unit}
                onChangeText={(text) => handleIngredientChange(text, index, 'unit')}
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addIngredientButton} onPress={handleAddIngredient}>
            <Text style={styles.addIngredientButtonText}>Agregar ingrediente</Text>
            <FontAwesome name="plus-circle" size={24} color={Colors.light.text}/>
          </TouchableOpacity>
        </View>

      </ScrollView> {/* Fin de ScrollView */}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Siguiente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Color de fondo general de la pantalla
  },
  scrollViewContent: {
    
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100, // Espacio para el botón "Siguiente" que está fijo abajo
  },
  section: {
    marginBottom: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    //fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.light.cardBackground, // Rosa claro de la imagen
    borderRadius: 20,
    height: 40,
    //width: 175,
    paddingHorizontal: 15,
    //paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    // borderWidth: 1, // Puedes añadir un borde si el color de fondo no es suficiente
    // borderColor: '#DC3545',
  },
  textArea: {
    backgroundColor: Colors.light.cardBackground, // Rosa claro de la imagen
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100, // Altura mínima para el área de texto
    textAlignVertical: 'top', // Asegura que el texto empiece arriba en Android
  },
  pickerContainer: {
    backgroundColor: Colors.light.background,
    //borderRadius: 10,
    overflow: 'hidden', // Asegura que el picker respete el borderRadius
    //borderWidth: 3, // Borde para el picker
    //borderColor: Colors.light.cardBorder, // Color de borde del input
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#000',
    textAlign: 'center', // Asegura que el texto esté centrado
    fontSize: 14,
    fontWeight: 'bold',
    borderWidth: 2, // Borde para el picker
    borderColor: Colors.light.cardBorder, // Color de borde del input
    justifyContent: 'center', // Asegura que el texto esté centrado
    borderRadius: 15, // Asegura que el picker tenga bordes redondeados
    backgroundColor: Colors.light.background, // Rosa claro de la imagen
    //borderRadius: 15, // Asegura que el picker tenga bordes redondeados
  },
  pickerItem: { // Solo para iOS para asegurar que el color se aplique correctamente
    color: '#000',
    fontSize: 14,
    //fontWeight: 'bold',
    //alignItems: 'center', // Asegura que el texto esté centrado
    //justifyContent: 'center', // Asegura que el texto esté centrado
    //textAlign: 'center', // Asegura que el texto esté centrado
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ingredientNameInput: {
    //flex: 3, // Ocupa más espacio
    //marginRight: 10,
    width: 175
  },
  ingredientQuantityInput: {
    //flex: 1, // Cantidad más pequeña
    //marginRight: 10,
    textAlign: 'center',
    width: 90, // Ancho fijo para la cantidad
  },
  ingredientUnitInput: {
    //flex: 1, // Unidad más pequeña
    textAlign: 'center',
    width: 80, // Ancho fijo para la unidad
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background, // Color de fondo del input
    borderRadius: 15,
    paddingVertical: 12,
    marginTop: 10,
    borderWidth: 2, // Borde para el botón
    borderColor: Colors.light.cardBorder, // Color de borde del botón
  },
  addIngredientButtonText: {
    color: Colors.light.text, // Color del texto del botón
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: Colors.light.button, // Rojo fuerte del botón principal
    borderRadius: 15,
    height: 48,
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20, // Margen lateral para que no toque los bordes
    marginBottom: 20, // Espacio desde abajo
    position: 'absolute', // Fija el botón en la parte inferior
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});