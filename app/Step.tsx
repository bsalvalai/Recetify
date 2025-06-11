import React, { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Stack, router } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// ----- SOLO IMPORTAMOS YoutubeIframe, NO expo-video -----
import YoutubeIframe from 'react-native-youtube-iframe';

import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

// --- Interfaz para los datos de cada paso ---
interface StepData {
  description: string;
  mediaUrlInput: string; // URL que se escribe en el input
  mediaType: 'image' | 'youtube-video' | null; // Tipos de media actualizados (sin 'direct-video')
  displayMediaUrls: string[]; // Array de URLs de imágenes, o 1 ID de YouTube
}

export default function RecipeStepsScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([
    { description: '', mediaUrlInput: '', mediaType: null, displayMediaUrls: [] }
  ]);
  // ----- Eliminamos la referencia a videoPlayerRef (de expo-video) -----
  const youtubePlayerRef = useRef<any>(null); // Ref para YoutubeIframe
  const flatListRef = useRef<FlatList>(null); // Ref para el FlatList del carrusel

  // Estado para controlar la reproducción de YouTube (si el video está listo)
  const [playingYoutube, setPlayingYoutube] = useState(false);

  // Función para obtener el ID de YouTube de una URL
  const getYoutubeVideoId = (url: string) => {
    // Regex para capturar IDs de YouTube de varios formatos de URL
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  // Función para manejar cambios en la descripción del paso actual
  const handleDescriptionChange = (text: string) => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].description = text;
    setSteps(newSteps);
  };

  // Función para manejar cambios en la URL de contenido multimedia del paso actual
  const handleMediaUrlInputChange = (text: string) => {
    const newSteps = [...steps];
    newSteps[currentStepIndex].mediaUrlInput = text;
    setSteps(newSteps);
  };

  // Función para detectar tipo de URL y agregar/mostrar contenido
  const handleAddMedia = () => {
    const url = steps[currentStepIndex].mediaUrlInput.trim();
    if (!url) {
      Alert.alert('Error', 'Por favor, ingrese una URL.');
      return;
    }

    const newSteps = [...steps];
    const currentStep = newSteps[currentStepIndex];

    const isImage = /\.(jpeg|jpg|png|gif)$/i.test(url);
    // ----- Eliminamos la detección de isDirectVideo -----
    const youtubeId = getYoutubeVideoId(url); // Intenta obtener el ID de YouTube

    // Lógica de validación para evitar mezclar tipos de contenido
    if (currentStep.mediaType && currentStep.mediaType !== null) {
      if (isImage && currentStep.mediaType !== 'image') {
        Alert.alert('Advertencia', 'Ya hay un video cargado. No puedes agregar imágenes si ya hay un video.');
        return;
      }
      // ----- Cambiamos la validación para solo YouTube si ya hay imágenes -----
      if (youtubeId && currentStep.mediaType === 'image') {
        Alert.alert('Advertencia', 'Ya hay imágenes cargadas. No puedes agregar un video si ya hay imágenes.');
        return;
      }
      // ----- Cambiamos la validación para solo YouTube si ya hay otro video -----
      if (youtubeId && currentStep.mediaType === 'youtube-video') {
        Alert.alert('Advertencia', 'Ya hay un video de YouTube cargado para este paso. Solo se permite uno.');
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
    } else if (youtubeId) { // Solo si es un video de YouTube
      currentStep.mediaType = 'youtube-video';
      currentStep.displayMediaUrls = [youtubeId]; // Almacenamos el ID de YouTube
      currentStep.mediaUrlInput = '';
    } else {
      // ----- Mensaje de error ajustado para no mencionar videos directos -----
      Alert.alert('Error', 'URL no válida. Por favor, ingrese una URL de imagen o de YouTube válida.');
      return;
    }

    setSteps(newSteps);
  };

  // Función para eliminar todo el contenido multimedia del paso actual
  const handleDeleteMedia = () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar el contenido multimedia de este paso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: () => {
            const newSteps = [...steps];
            newSteps[currentStepIndex].mediaUrlInput = '';
            newSteps[currentStepIndex].mediaType = null; // <--- Aquí cambias el tipo de media
            newSteps[currentStepIndex].displayMediaUrls = [];
            setSteps(newSteps); // <--- Esto fuerza un re-renderizado y, si mediaType es null, DESMONTA el YoutubeIframe

            // Luego intentas pausar el video, pero el iframe ya fue desmontado
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.pauseVideo(); // <--- youtubePlayerRef.current ya es undefined o null
            }
            },
          style: 'destructive',
        },
      ]
    );
  };

  // Callback para el estado del reproductor de YouTube
  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setPlayingYoutube(false);
      Alert.alert('Video terminado', '¡El video ha finalizado!');
    }
  }, []);

  // Función para avanzar al siguiente paso
  const handleNextStep = () => {
    if (!steps[currentStepIndex].description.trim()) {
        Alert.alert('Error', 'Por favor, ingrese la descripción del paso actual.');
        return;
    }
    // Pausar cualquier video de YouTube al cambiar de paso
    if (youtubePlayerRef.current) {
        youtubePlayerRef.current.pauseVideo();
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

  // Función para finalizar la receta (último paso)
  const handleFinishRecipe = () => {
    Alert.alert('Receta Finalizada', '¡Felicidades! Tu receta está lista.');
    console.log('Receta completa:', steps);
    // router.replace('/(tabs)/index'); // Volver a la pantalla principal o de recetas
  };

  const currentStepData = steps[currentStepIndex];

  return (
    <View style={styles.fullScreenContainer}>
      <Stack.Screen options={{ title: '', headerTitleAlign: 'center', headerShown: false}} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="chevron-left" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuracion</Text>
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
                  onScrollBeginDrag={() => {
                    // Solo pausamos el video de YouTube si existe
                    if (youtubePlayerRef.current) {
                      youtubePlayerRef.current.pauseVideo();
                    }
                  }}
                />
              ) : ( // Este else ahora solo maneja 'youtube-video'
                <YoutubeIframe
                  ref={youtubePlayerRef}
                  height={styles.videoPlayer.height}
                  play={playingYoutube}
                  videoId={currentStepData.displayMediaUrls[0]}
                  onChangeState={onStateChange}
                  webViewProps={{
                    allowsFullscreenVideo: true,
                    'allowsInlineMediaPlayback': true,
                    'mediaPlaybackRequiresUserAction': false,
                  }}
                  style={styles.videoPlayer}
                />
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
            placeholder="Ingrese la URL de la imagen o video de YouTube..."
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
    paddingBottom: 120, // Espacio para los botones inferiores fijos
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
    backgroundColor: Colors.light.textInput, // Color del input de texto
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
    height: 40, // Altura del input de texto
    backgroundColor: Colors.light.textInput, // Color del input de texto
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  addMediaButton: {
    height: 48, // Altura del botón
    backgroundColor: 'transparent',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder, // Rojo del botón principal
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
    backgroundColor: 'transparent', // Fondo transparente
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.light.buttonBorder, // Rojo para el botón de eliminar
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15, // Espacio por encima del botón
    marginBottom: 20, // Espacio por debajo
  },
  deleteMediaButtonText: {
    color: Colors.light.text, // Rojo para el texto del botón de eliminar
    fontSize: 14,
    fontWeight: 'bold',
  },
  mediaContainer: {
    borderRadius: 20,
    overflow: 'hidden', // Importante para que la imagen/video respete el borderRadius
    backgroundColor: '#000', // Un fondo gris claro para cuando no hay contenido
    //alignItems: 'center',
    height: width * 0.6, // Altura para el contenedor de media
    marginBottom: 10,
    //height: 220
  },
  carouselImage: {
    width: width - 32, // Ancho de la pantalla menos el padding horizontal de la scrollView (16*2)
    height: '100%',
    borderRadius: 10,
  },
  videoPlayer: { // Este estilo ahora solo aplica a YoutubeIframe
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
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