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
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useVideoPlayer, VideoView } from 'expo-video';

import Colors from '@/constants/Colors';


interface Ingredient {
  name: string;
  quantity: string; // Asegúrate que sea string si el input lo maneja así
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
  quantityServings: string; // Asegúrate que sea string
  steps: StepData[];
  createdByUsername?: string;
}

const { width } = Dimensions.get('window');

export default function RecipeStepsScreen() {
  const params = useLocalSearchParams();
  const initialRecipeName = (params.recipeName as string) || '';
  const initialCoverImageUrl = (params.coverImageUrl as string) || '';
  const initialBriefDescription = (params.description as string) || '';
  const initialDishType = (params.dishType as string) || null;
  const initialIngredients: Ingredient[] = params.ingredients
    ? JSON.parse(params.ingredients as string)
    : [];
  const createdByUsername = (params.createdByUsername as string) || 'Usuario Anónimo';
  const initialQuantityServings = (params.quantityServings as string) || '0';

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([
    { description: '', mediaUrlInput: '', mediaType: null, displayMediaUrls: [] }
  ]);
  const flatListRef = useRef<FlatList>(null);

  // Mueve el useEffect *después* de la declaración de 'steps'
  useEffect(()=>{
    console.log("Pasos totales: ",steps)
    console.log("Cantidad de porciones recibida en Step:", initialQuantityServings); // Para verificar
  },[steps, initialQuantityServings])

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

  const handleFinishRecipe = () => {
    // Validar el último paso antes de finalizar
    if (!steps[currentStepIndex].description.trim()) {
      Alert.alert('Error', 'Por favor, ingrese la descripción del paso actual antes de finalizar la receta.');
      return;
    }

    const completeRecipe: FullRecipeData = {
      recipeName: initialRecipeName,
      coverImageUrl: initialCoverImageUrl,
      briefDescription: initialBriefDescription,
      dishType: initialDishType,
      ingredients: initialIngredients,
      quantityServings: initialQuantityServings, // PASANDO quantityServings
      steps: steps,
      createdByUsername: createdByUsername,
    };
    console.log('Receta completa para previsualizar:', completeRecipe);

    router.push({
      pathname: '/RecipePreviewScreen',
      params: { recipeData: JSON.stringify(completeRecipe) },
    });
  };


  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 1 : 0}
    >
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
              ) : (
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

      </ScrollView>

    </KeyboardAvoidingView>
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
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: 16,
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
    fontSize: 12,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: 'regular',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.light.textInput,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 12,
    marginBottom: 40,
    width: '100%',
    height: 46,
    color: '#111',
  },
  addMediaButton: {
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 16,
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
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder,
    paddingVertical: 16,
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
    paddingVertical: 15,
    backgroundColor: '#F0F0F0',
  },
  finishButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 56,
    paddingVertical: 18,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  nextStepButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 56,
    paddingVertical: 18,
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
    fontSize: 20,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  }
});