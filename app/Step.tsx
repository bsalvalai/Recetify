import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  FlatList,
  Platform
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router'; // ¡Importar useLocalSearchParams!
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useVideoPlayer, VideoView } from 'expo-video';

import Colors from '@/constants/Colors';

// Importa las interfaces si están en un archivo separado, ej:
// import { StepData, FullRecipeData, Ingredient } from '@/types';

// O define las interfaces aquí si no las tienes en un archivo separado
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface StepData {
  description: string;
  mediaUrlInput: string;
  mediaType: 'image' | 'mp4-video' | null;
  displayMediaUrls: string[];
}

interface FullRecipeData {
  recipeName: string;
  coverImageUrl: string;
  briefDescription: string;
  dishType: string | null;
  ingredients: Ingredient[];
  steps: StepData[];
  // Si tienes el nombre de usuario que crea la receta, también lo añadirías aquí
  createdByUsername?: string; // Asumo que el usuario se trae de algún contexto o auth
}


const { width } = Dimensions.get('window');

export default function RecipeStepsScreen() {
  const params = useLocalSearchParams(); // Obtener los parámetros de la ruta
  // Asumo que la pantalla anterior pasa estos parámetros.
  // Es importante que los nombres de los parámetros coincidan.
  const initialRecipeName = (params.recipeName as string) || '';
  const initialCoverImageUrl = (params.coverImageUrl as string) || '';
  const initialBriefDescription = (params.description as string) || '';
  const initialDishType = (params.dishType as string) || null;
  // Los ingredientes pueden venir como un string JSON si son complejos
  const initialIngredients: Ingredient[] = params.ingredients
    ? JSON.parse(params.ingredients as string)
    : [];
  // También podrías pasar el username del usuario logueado
  const createdByUsername = (params.createdByUsername as string) || 'Usuario Anónimo'; // Ejemplo

  useEffect(()=>{
    console.log("Parametros de la vista inicial: ",params)
    console.log("Pasos totales: ",steps)
  },[])

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([
    { description: '', mediaUrlInput: '', mediaType: null, displayMediaUrls: [] }
  ]);
  const flatListRef = useRef<FlatList>(null);

  const currentStepData = steps[currentStepIndex];

  const videoSource = (currentStepData.mediaType === 'mp4-video' && currentStepData.displayMediaUrls.length > 0)
    ? currentStepData.displayMediaUrls[0]
    : null;

  const player = useVideoPlayer(videoSource);


  const handleDescriptionChange = (text: string) => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].description = text;
    setSteps(newSteps);
  };

  const handleMediaUrlInputChange = (text: string) => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].mediaUrlInput = text;
    setSteps(newSteps);
  };

  const handleAddMedia = () => {
    const url = steps[currentStepIndex].mediaUrlInput.trim();
    if (!url) {
      Alert.alert('Error', 'Por favor, ingrese una URL.');
      return;
    }

    const newSteps = [...steps];
    const currentStep = newSteps[currentStepIndex];

    const isImage = /\.(jpeg|jpg|png|gif)$/i.test(url);
    const isMp4Video = /\.mp4$/i.test(url);

    if (currentStep.mediaType && currentStep.mediaType !== null) {
      if (isImage && currentStep.mediaType !== 'image') {
        Alert.alert('Advertencia', 'Ya hay un video cargado. No puedes agregar imágenes si ya hay un video.');
        return;
      }
      if (isMp4Video && currentStep.mediaType === 'image') {
        Alert.alert('Advertencia', 'Ya hay imágenes cargadas. No puedes agregar un video si ya hay imágenes.');
        return;
      }
      if (isMp4Video && currentStep.mediaType === 'mp4-video') {
        Alert.alert('Advertencia', 'Ya hay un video MP4 cargado para este paso. Solo se permite uno.');
        return;
      }
    }

    if (isImage) {
      if (currentStep.displayMediaUrls.length >= 5) {
        Alert.alert('Advertencia', 'Ya se han cargado 5 imágenes para este paso.');
        return;
      }
      currentStep.mediaType = 'image';
      currentStep.displayMediaUrls.push(url);
      currentStep.mediaUrlInput = '';
    } else if (isMp4Video) {
      currentStep.mediaType = 'mp4-video';
      currentStep.displayMediaUrls = [url];
      currentStep.mediaUrlInput = '';
    } else {
      Alert.alert('Error', 'URL no válida. Por favor, ingrese una URL de imagen o de video MP4 válida.');
      return;
    }

    setSteps(newSteps);
  };

  const handleDeleteMedia = async () => {
    if (steps[currentStepIndex].mediaType === 'mp4-video' && player) {
        await player.pause();
    }

    const newSteps = [...steps];
    newSteps[currentStepIndex].mediaUrlInput = '';
    newSteps[currentStepIndex].mediaType = null;
    newSteps[currentStepIndex].displayMediaUrls = [];
    setSteps(newSteps);
  };

  const handleNextStep = async () => {
    //console.log("Pasos totales: ",steps)
    if (!steps[currentStepIndex].description.trim()) {
        Alert.alert('Error', 'Por favor, ingrese la descripción del paso actual.');
        return;
    }
    if (steps[currentStepIndex].mediaType === 'mp4-video' && player) {
        await player.pause();
    }

    if (currentStepIndex === steps.length - 1) {
      setSteps([
        ...steps,
        { description: '', mediaUrlInput: '', mediaType: null, displayMediaUrls: [] },
      ]);
    }
    setCurrentStepIndex(prev => prev + 1);
    if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  };

  // --- CAMBIO CLAVE AQUÍ: handleFinishRecipe ahora navega y pasa todos los datos ---
  const handleFinishRecipe = () => {
    // Aquí combinamos todos los datos de la receta
    const completeRecipe: FullRecipeData = {
      recipeName: initialRecipeName,
      coverImageUrl: initialCoverImageUrl,
      briefDescription: initialBriefDescription,
      dishType: initialDishType,
      ingredients: initialIngredients,
      steps: steps, // Los pasos recolectados en esta pantalla
      createdByUsername: createdByUsername,
    };
    console.log('Receta completa para previsualizar:', completeRecipe);

    // Navegar a la pantalla de previsualización, pasando el objeto completo
    // Nota: Los objetos complejos deben ser serializables a JSON para pasarlos como parámetros.
    router.push({
      pathname: '/RecipePreviewScreen', // Asegúrate de que esta ruta exista en tu app/
      params: { recipeData: JSON.stringify(completeRecipe) }, // Convertir a string JSON
    });
  };


  return (
    <View style={styles.fullScreenContainer}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Receta</Text>
        <View style={styles.placeholder} />
      </View>
        <View style={[{backgroundColor: "#000"},{width:"100%"},{height: 1}]}></View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.stepTitle}>Paso {currentStepIndex + 1}</Text>

        <View style={styles.section}>
          <TextInput
            style={styles.textArea}
            placeholder="Descripción del paso..."
            placeholderTextColor={Colors.light.text}
            value={currentStepData.description}
            onChangeText={handleDescriptionChange}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Sección de Contenido Multimedia */}
        {currentStepData.mediaType && currentStepData.displayMediaUrls.length > 0 ? (
          <View>
            <View style={styles.mediaContainer}>
              {currentStepData.mediaType === 'image' ? (
                <FlatList
                  ref={flatListRef}
                  data={currentStepData.displayMediaUrls}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, idx) => `image-${idx}`}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
                  )}
                  onScrollBeginDrag={async () => {
                    if (steps[currentStepIndex].mediaType === 'mp4-video' && player) {
                      await player.pause();
                    }
                  }}
                />
              ) : ( // Este else ahora maneja 'mp4-video'
                videoSource ? (
                    <VideoView
                        player={player}
                        controls={true}
                        autoplay={false}
                        loop={false}
                        muted={false}
                        volume={1.0}
                        rate={1.0}
                        contentFit="cover"
                        style={styles.videoPlayer}
                    />
                ) : (
                    <View style={styles.videoPlayerPlaceholder}>
                        <Text style={styles.videoPlayerPlaceholderText}>Cargando video...</Text>
                    </View>
                )
              )}
            </View>
            <TouchableOpacity style={styles.deleteMediaButton} onPress={handleDeleteMedia}>
              <Text style={styles.deleteMediaButtonText}>Eliminar contenido multimedia</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Cargar imagen/video</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingrese la URL de la imagen o video MP4..."
            placeholderTextColor={Colors.light.text}
            value={currentStepData.mediaUrlInput}
            onChangeText={handleMediaUrlInputChange}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
          <Text style={styles.addMediaButtonText}>Agregar contenido multimedia</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Botones de navegación al final de la pantalla */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishRecipe}>
          <Text style={styles.buttonText}>Terminar receta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextStepButton} onPress={handleNextStep}>
          <Text style={styles.buttonText}>
            {currentStepIndex === steps.length -1 ? 'Agregar próximo paso' : 'Siguiente paso'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 120,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'regular',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 22,
    fontWeight: 'regular',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    height: 40,
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  addMediaButton: {
    height: 48,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  placeholder: {
    width: 24,
  },
  addMediaButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: 'bold',
    
  },
  deleteMediaButton: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  deleteMediaButtonText: {
    color: Colors.light.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    marginBottom: 10,
  },
  carouselImage: {
    width: width - 32,
    height: '100%',
    borderRadius: 10,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoPlayerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderRadius: 10,
  },
  videoPlayerPlaceholderText: {
    color: '#666',
    fontSize: 16,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F0F0F0',
  },
  finishButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  nextStepButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  }
});