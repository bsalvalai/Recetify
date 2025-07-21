import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { Stack } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/components/AuthContext';

export default function CreateScreen() {
  const [recipeName, setRecipeName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPlateType, setSelectedPlateType] = useState('');
  const [ingredients, setIngredients] = useState([
    { name: '', quantity: '', unit: '' }
  ]);

  const { isLoggedIn } = useAuth();
  const user = 'bsalvalai'
  const router = useRouter();

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const handleIngredientChange = (text: string, index: number, field: 'name' | 'quantity' | 'unit') => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: text };
    setIngredients(newIngredients);
  };

  const handleSubmit = () => {
    if (!recipeName || !imageUrl || !description || !selectedPlateType || ingredients.some(ing => !ing.name || !ing.quantity || !ing.unit)) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const validIngredients = ingredients.filter(ing => ing.name && ing.quantity);
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Por favor, agregue al menos un ingrediente.');
      return;
    }

    router.push({
      pathname: '/Step',
      params: {
        recipeName: recipeName,
        coverImageUrl: imageUrl,
        description: description,
        dishType: selectedPlateType,
        ingredients: JSON.stringify(ingredients),
        createdByUsername: user,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0} 
    >
      
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <Stack.Screen options={{ title: '', headerTitleAlign: 'center',}} />

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
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Indique el tipo de plato</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPlateType}
              onValueChange={(itemValue, itemIndex) => setSelectedPlateType(itemValue)}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : null}
            >
              <Picker.Item label="Sin especificar" value="" />
              <Picker.Item label="Carne" value="Carne" />
              <Picker.Item label="Pasta" value="Pasta" />
              <Picker.Item label="Guiso" value="Guiso" />
              <Picker.Item label="Sopa" value="Sopa" />
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

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Siguiente</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 20,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
    textAlign: 'center'
  },
  input: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 20,
    height: 46,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
  },
  picker: {
    height: 52,
    width: '100%',
    color: '#000',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: Colors.light.background,
  },
  pickerItem: {
    color: '#000',
    fontSize: 14,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ingredientNameInput: {
    width: 175
  },
  ingredientQuantityInput: {
    textAlign: 'center',
    width: 90,
  },
  ingredientUnitInput: {
    textAlign: 'center',
    width: 80,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 10,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    height: 54,
  },
  addIngredientButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 56,
    paddingVertical: 18,
    alignItems: 'center',
    //marginHorizontal: 16,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});