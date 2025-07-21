import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

// Configuración de la API
const URL_PUBLICA = "http://10.0.2.2:8080" // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

// Tipos de plato predeterminados
const DISH_TYPES = [
  { label: "Sin especificar", value: "" },
  { label: "Carne", value: "Carne" },
  { label: "Pasta", value: "Pasta" },
  { label: "Guiso", value: "Guiso" },
  { label: "Sopa", value: "Sopa" },
];

// Interfaces
interface Ingredient {
  ingredient_id?: number;
  ingredient_name: string;
  quantity: number;
  unit: string;
}

interface Step {
  step_id?: number;
  description: string;
  order: number;
  photos: string[];
  videos: string[];
}

interface RecipeData {
  recipe_id: number;
  recipe_name: string;
  description: string;
  preparation_time: string;
  quantity_servings: number;
  type: string;
  photos: string[];
  ingredients: Ingredient[];
  steps: Step[];
  author: string;
  rating: number;
  reviews: any[];
}

export default function EditRecipeScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const recipeId = params.recipeId as string;

  // Estados
  const [recipe, setRecipe] = useState<RecipeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Estados de edición
  const [recipeName, setRecipeName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [dishType, setDishType] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  // Cargar datos de la receta
  useEffect(() => {
    const fetchRecipeData = async () => {
      if (!recipeId) {
        setError("ID de receta no proporcionado");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get<RecipeData>(
          `${URL_PUBLICA}/recipe?ID=${recipeId}`,
          {
            headers: { 'x-api-key': API_KEY },
          }
        );

        const recipeData = response.data;
        setRecipe(recipeData);
        
        // Inicializar estados de edición
        setRecipeName(recipeData.recipe_name);
        setDescription(recipeData.description);
        setCoverImageUrl(recipeData.photos?.[0] || '');
        setDishType(recipeData.type);
        setIngredients(recipeData.ingredients);
        setSteps(recipeData.steps.sort((a, b) => a.order - b.order));

      } catch (error) {
        console.error('Error cargando receta:', error);
        setError('No se pudo cargar la receta');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipeData();
  }, [recipeId]);

  // Detectar cambios
  useEffect(() => {
    if (!recipe) return;
    
    const hasChanges = 
      recipeName !== recipe.recipe_name ||
      description !== recipe.description ||
      coverImageUrl !== (recipe.photos?.[0] || '') ||
      dishType !== recipe.type ||
      JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients) ||
      JSON.stringify(steps) !== JSON.stringify(recipe.steps);

    setHasUnsavedChanges(hasChanges);
  }, [recipeName, description, coverImageUrl, dishType, ingredients, steps, recipe]);

  // Manejar navegación hacia atrás
  const handleBackPress = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Cambios sin guardar',
        'Si sales, se eliminarán los cambios. ¿Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Salir sin guardar', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!recipe) return;

    // Validaciones
    if (!recipeName.trim()) {
      Alert.alert('Error', 'El nombre de la receta es obligatorio');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }

    if (ingredients.length === 0 || ingredients.some(ing => !ing.ingredient_name.trim())) {
      Alert.alert('Error', 'Debe tener al menos un ingrediente válido');
      return;
    }

    if (steps.length === 0 || steps.some(step => !step.description.trim())) {
      Alert.alert('Error', 'Debe tener al menos un paso con descripción');
      return;
    }

    setIsSaving(true);
    try {
      const updatedRecipe = {
        recipe_name: recipeName.trim(),
        description: description.trim(),
        type: dishType || 'Sin especificar',
        preparation_time: recipe.preparation_time, // Mantener el valor actual sin cambios
        quantity_servings: recipe.quantity_servings, // Mantener el valor actual sin cambios
        photos: coverImageUrl ? [coverImageUrl.trim()] : recipe.photos,
        ingredients: ingredients
          .filter(ing => ing.ingredient_name.trim()) // Filtrar ingredientes vacíos
          .map(ing => ({
            ingredient_name: ing.ingredient_name.trim(),
            quantity: ing.quantity,
            unit: ing.unit.trim()
          })),
        steps: steps
          .filter(step => step.description.trim()) // Filtrar pasos vacíos
          .map((step, index) => ({
            description: step.description.trim(),
            order: index + 1,
            photos: step.photos || [],
            videos: step.videos || []
          }))
      };

      await axios.put(
        `${URL_PUBLICA}/recipe/${recipeId}`,
        updatedRecipe,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      Alert.alert(
        'Éxito',
        'Receta actualizada correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );

    } catch (error) {
      console.error('Error guardando receta:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message || 'Error del servidor';
        Alert.alert('Error', `No se pudo guardar la receta: ${message}`);
      } else {
        Alert.alert('Error', 'No se pudo guardar la receta. Inténtalo de nuevo.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar ingrediente
  const addIngredient = () => {
    setIngredients([...ingredients, { ingredient_name: '', quantity: 0, unit: '' }]);
  };

  // Eliminar ingrediente
  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Actualizar ingrediente
  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setIngredients(updatedIngredients);
  };

  // Agregar paso
  const addStep = () => {
    setSteps([...steps, { description: '', order: steps.length + 1, photos: [], videos: [] }]);
  };

  // Eliminar paso
  const removeStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, order: i + 1 }));
    setSteps(updatedSteps);
  };

  // Actualizar paso
  const updateStep = (index: number, description: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], description };
    setSteps(updatedSteps);
  };

  // Agregar foto a paso
  const addPhotoToStep = (stepIndex: number, photoUrl: string) => {
    if (!photoUrl.trim()) return;
    
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      photos: [...(updatedSteps[stepIndex].photos || []), photoUrl]
    };
    setSteps(updatedSteps);
  };

  // Eliminar foto de paso
  const removePhotoFromStep = (stepIndex: number, photoIndex: number) => {
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      photos: updatedSteps[stepIndex].photos?.filter((_, i) => i !== photoIndex) || []
    };
    setSteps(updatedSteps);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Cargando receta...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleDelete = async() => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que deseas eliminar esta receta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${URL_PUBLICA}/recipe/${recipeId}`, {
                headers: { 'x-api-key': API_KEY },
              });
              Alert.alert('Éxito', 'Receta eliminada correctamente');
              router.back();
            } catch (error) {
              console.error('Error eliminando receta:', error);
              Alert.alert('Error', 'No se pudo eliminar la receta. Inténtalo de nuevo.');
            }
          }
        }
      ]
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={handleBackPress}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Receta</Text>
        <TouchableOpacity 
          style={[styles.saveButton, !hasUnsavedChanges && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.label}>Nombre de la receta</Text>
          <TextInput
            style={styles.input}
            value={recipeName}
            onChangeText={setRecipeName}
            placeholder="Ingrese el nombre de la receta..."
            placeholderTextColor={Colors.light.text}
          />

          <Text style={styles.label}>URL de la imagen de portada</Text>
          <TextInput
            style={styles.input}
            value={coverImageUrl}
            onChangeText={setCoverImageUrl}
            placeholder="Coloque la URL de la imagen..."
            placeholderTextColor={Colors.light.text}
            keyboardType="url"
            autoCapitalize="none"
          />

          {/* Mostrar imagen de portada si existe */}
          {coverImageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: coverImageUrl }}
                style={styles.coverImagePreview}
                resizeMode="cover"
                onError={() => {
                  Alert.alert('Error', 'No se pudo cargar la imagen de portada. Verifica la URL.');
                }}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setCoverImageUrl('')}
              >
                <FontAwesome name="times-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholderImageContainer}>
              <FontAwesome name="image" size={40} color="#CCC" />
              <Text style={styles.placeholderText}>Sin imagen de portada</Text>
            </View>
          )}

          <Text style={styles.label}>Breve descripción de la receta</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Haga una breve descripción de su receta..."
            placeholderTextColor={Colors.light.text}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Tipo de plato</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={dishType}
              onValueChange={setDishType}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : null}
            >
              {DISH_TYPES.map((type) => (
                <Picker.Item key={type.value} label={type.label} value={type.value} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Ingredientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <FontAwesome name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientRow}>
              <TextInput
                style={[styles.input, styles.ingredientName]}
                value={ingredient.ingredient_name}
                onChangeText={(text) => updateIngredient(index, 'ingredient_name', text)}
                placeholder="Ingrediente"
                placeholderTextColor={Colors.light.text}
              />
              <TextInput
                style={[styles.input, styles.ingredientQuantity]}
                value={ingredient.quantity.toString()}
                onChangeText={(text) => updateIngredient(index, 'quantity', parseFloat(text) || 0)}
                placeholder="Cantidad"
                placeholderTextColor={Colors.light.text}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.ingredientUnit]}
                value={ingredient.unit}
                onChangeText={(text) => updateIngredient(index, 'unit', text)}
                placeholder="Medida"
                placeholderTextColor={Colors.light.text}
              />
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => removeIngredient(index)}
              >
                <FontAwesome name="trash" size={16} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Pasos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pasos de preparación</Text>
            <TouchableOpacity style={styles.addButton} onPress={addStep}>
              <FontAwesome name="plus" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {steps.map((step, stepIndex) => (
            <StepEditor
              key={stepIndex}
              step={step}
              stepIndex={stepIndex}
              onUpdateDescription={(text) => updateStep(stepIndex, text)}
              onRemoveStep={() => removeStep(stepIndex)}
              onAddPhoto={(photoUrl) => addPhotoToStep(stepIndex, photoUrl)}
              onRemovePhoto={(photoIndex) => removePhotoFromStep(stepIndex, photoIndex)}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleDelete}>
          <Text style={styles.submitButtonText}>Eliminar receta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Componente para editar un paso individual
interface StepEditorProps {
  step: Step;
  stepIndex: number;
  onUpdateDescription: (text: string) => void;
  onRemoveStep: () => void;
  onAddPhoto: (photoUrl: string) => void;
  onRemovePhoto: (photoIndex: number) => void;
}

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  stepIndex,
  onUpdateDescription,
  onRemoveStep,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const handleAddPhoto = () => {
    if (photoUrlInput.trim()) {
      // Validar que la URL parece ser de una imagen
      const imageUrlPattern = /\.(jpeg|jpg|gif|png|bmp|webp)$/i;
      const url = photoUrlInput.trim();
      
      if (!imageUrlPattern.test(url) && !url.includes('imgur') && !url.includes('cloudinary')) {
        Alert.alert(
          'URL no válida', 
          'La URL debe terminar en una extensión de imagen (.jpg, .png, .gif, etc.) o ser de un servicio de imágenes conocido.'
        );
        return;
      }
      
      onAddPhoto(url);
      setPhotoUrlInput('');
    }
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>Paso {stepIndex + 1}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={onRemoveStep}>
          <FontAwesome name="trash" size={16} color="red" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.input, styles.stepDescriptionInput]}
        value={step.description}
        onChangeText={onUpdateDescription}
        placeholder="Descripción del paso"
        placeholderTextColor={Colors.light.text}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Fotos del paso */}
      {step.photos && step.photos.length > 0 && (
        <View style={styles.stepPhotosContainer}>
          <Text style={styles.photosSectionTitle}>Fotos:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {step.photos.map((photo, photoIndex) => (
              <View key={photoIndex} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.stepPhoto} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => onRemovePhoto(photoIndex)}
                >
                  <FontAwesome name="times-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Agregar nueva foto */}
      <View style={styles.addPhotoContainer}>
        <TextInput
          style={[styles.input, styles.photoUrlInput]}
          value={photoUrlInput}
          onChangeText={setPhotoUrlInput}
          placeholder="URL de la foto del paso"
          placeholderTextColor={Colors.light.text}
          keyboardType="url"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
          <FontAwesome name="plus" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 5,
    backgroundColor: '#F0F0F0',
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  saveButton: {
    backgroundColor: Colors.light.button,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: Colors.light.button,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: Colors.light.button,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 15,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  coverImagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 15,
    marginBottom: 15,
    marginTop: 10,
    backgroundColor: '#E0E0E0',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  placeholderImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: Colors.light.background,
    overflow: 'hidden',
    borderRadius: 15,
    marginBottom: 12,
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
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ingredientName: {
    flex: 2,
    marginRight: 4,
  },
  ingredientQuantity: {
    flex: 1,
    textAlign: 'center',
    marginRight: 4,
  },
  ingredientUnit: {
    flex: 1,
    textAlign: 'center',
    marginRight: 4,
  },
  removeButton: {
    padding: 8,
  },
  stepContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButton: {
      backgroundColor: Colors.light.button,
      borderRadius: 15,
      height: 52,
      paddingVertical: 17,
      alignItems: 'center',
      //marginHorizontal: 16,
      marginBottom: 20,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.button,
  },
  stepDescriptionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stepPhotosContainer: {
    marginTop: 15,
  },
  photosSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 10,
  },
  stepPhoto: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  addPhotoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
    gap: 8,
  },
  photoUrlInput: {
    flex: 1,
    marginRight: 8,
    
  },
  addPhotoButton: {
    backgroundColor: Colors.light.button,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  stepDescription: {
    flex: 1,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
