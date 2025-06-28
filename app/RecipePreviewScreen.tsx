// app/recipe-preview.tsx (o la ruta que definas)
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions, // Asegúrate de que Dimensions esté importado
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useVideoPlayer, VideoView } from 'expo-video';

import Colors from '@/constants/Colors';

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
  createdByUsername?: string;
}


const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 16 * 2 - 15 * 2; 

export default function RecipePreviewScreen() {
  const params = useLocalSearchParams();
  const recipeDataString = params.recipeData as string;

  let recipe: FullRecipeData | null = null;
  try {
    if (recipeDataString) {
      recipe = JSON.parse(recipeDataString);
    }
  } catch (e) {
    console.error("Error parsing recipeData param:", e);
    Alert.alert("Error", "No se pudo cargar la previsualización de la receta.");
    router.back();
    return null;
  }

  if (!recipe) {
    return (
      <View style={styles.fullScreenContainer}>
        <Text style={styles.loadingText}>Cargando previsualización...</Text>
      </View>
    );
  }

  // --- Funciones para manejar los botones de acción ---
  const handleDiscard = () => {
    Alert.alert(
      "Descartar Receta",
      "¿Estás seguro de que quieres descartar esta receta? Se perderá toda la información.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          onPress: () => {
            router.replace('/');
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleSave = () => {
    Alert.alert("Guardar Receta", "Lógica para guardar la receta en el dispositivo/servidor.");
  };

  const handlePublish = () => {
    Alert.alert("Publicar Receta", "Lógica para publicar la receta.");
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

        <Text style={styles.recipeName}>{recipe.recipeName}</Text>
        <Image
          source={{ uri: recipe.coverImageUrl || 'https://via.placeholder.com/150' }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <Text style={styles.detailText}>Tipo: {recipe.dishType || 'No especificado'}</Text>
        <Text style={styles.detailText}>Creada por: {recipe.createdByUsername || 'Anónimo'}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{recipe.briefDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {recipe.ingredients.length > 0 ? (
            recipe.ingredients.map((ing, index) => (
              <Text key={index} style={styles.ingredientText}>
                • {ing.name}: {ing.quantity} {ing.unit}
              </Text>
            ))
          ) : (
            <Text style={styles.noDataText}>No se han agregado ingredientes.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pasos</Text>
          {recipe.steps.length > 0 ? (
            recipe.steps.map((step, index) => (
              <View key={index} style={styles.stepContainer}>
                <Text style={styles.stepNumber}>Paso {index + 1}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>

                {step.mediaType && step.displayMediaUrls.length > 0 && (
                  <View style={styles.stepMediaContainer}>
                    {step.mediaType === 'image' ? (
                      <FlatList
                        data={step.displayMediaUrls}
                        horizontal
                        
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item, idx) => `step-image-${index}-${idx}`}
                        snapToInterval={ITEM_WIDTH} 
                        decelerationRate="fast" 
                        snapToAlignment="center" 
                        // ------------------------------
                        renderItem={({ item }) => (
                          
                          <View style={{ width: ITEM_WIDTH, height: '100%' }}>
                            <Image source={{ uri: item }} style={styles.stepImage} resizeMode="cover" />
                          </View>
                        )}
                      />
                    ) : ( // mp4-video
                      <VideoPreviewPlayer url={step.displayMediaUrls[0]} />
                    )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No se han agregado pasos.</Text>
          )}
        </View>

      </ScrollView>

      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <Text style={styles.buttonText}>Descartar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.buttonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const VideoPreviewPlayer = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url);
  React.useEffect(() => {
    return () => {
      if (player) {
        player.pause();
      }
    };
  }, [player, url]);

  return (
    <VideoView
      player={player}
      controls={true}
      style={styles.stepVideoPlayer}
      contentFit="cover"
      loop={false}
      muted={false}
      volume={1.0}
      rate={1.0}
    />
  );
};


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
    paddingBottom: 100, 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'regular',
    color: '#111',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  loadingText: {
    flex: 1,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#555',
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#E0E0E0',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 5,
  },
  section: {
    marginTop: 25,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  ingredientText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 5,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  stepContainer: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
    marginBottom: 10,
  },
  stepMediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    height: 180,
    width: '100%',
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepImage: {
    width: ITEM_WIDTH, 
    height: '100%',
    borderRadius: 10,
  },
  stepVideoPlayer: {
    width: '100%',
    height: '100%',
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
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  discardButton: {
    backgroundColor: '#FF5C5C',
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  publishButton: {
    backgroundColor: Colors.light.button,
    borderRadius: 15,
    height: 48,
    paddingVertical: 14,
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});