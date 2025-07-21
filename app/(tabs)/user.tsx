import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios'; // Importa axios para las llamadas HTTP
import Constants from 'expo-constants'; // Importa Constants para acceder a las variables de entorno

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard';
import RecipeCardNotPublished from '@/components/RecipeCardNotPublished';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/components/AuthContext';

// Define la interfaz para la estructura de los datos del perfil de usuario
interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  photo: string; 
  phone: string;
  birthdate: string;
  role: string;
}

interface BackendRecipe {
    recipe_id: number;
    recipe_name: string;
    ingredients: any[];
    steps: any[];
    preparation_time: string;
    description: string;
    quantity_servings: number;
    type: string;
    reviews: any[];
    author: string;
    rating: number;
    photos: string[];
    videos?: string[];
}

interface MappedRecipe {
    id: string;
    title: string;
    user: string;
    commentsCount: number;
    imageUrl: string;
    rating: number;
}

const URL_PUBLICA = "http://10.0.2.2:8080" // Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

const styling = (colorScheme: string, showLikedRecipes: boolean, showUnpublishedRecipes: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F0F0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111',
    },
    settingsButton: {
        paddingTop: 15,
        paddingRight: 16,
    },
    settingsIcon: {
        color: '#111',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: '500',
        color: '#222',
        marginBottom: 5,
    },
    profileDetails: {
        alignItems: 'center',
        marginBottom: 10,
    },
    profileDetailText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        width: '50%',
        justifyContent: 'space-around',
    },
    actionButton: {
        padding: 10,
        borderRadius: 20,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    actionButtonIcon: {
        color: '#111',
    },
    recipesSection: {
        // paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#333',
        paddingHorizontal: 16,
        textAlign: 'center',
    },
    underline: {
        backgroundColor: '#111',
        height: 3,
        width: '100%',
        marginTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    messageText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
        paddingHorizontal: 20,
    }
});

export default function UserScreen() {
    const colorScheme = useColorScheme();
    const defaultProfileImageSource = require('../../assets/images/profile.jpg');
    const { isLoggedIn } = useAuth();

  const [showLikedRecipes, setShowLikedRecipes] = useState(true);
  const [showUnpublishedRecipes, setShowUnpublishedRecipes] = useState(false);
  
  const [currentUsername, setCurrentUsername] = useState<string | null>(null); 
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Estado para los datos del perfil
  const [isProfileLoading, setIsProfileLoading] = useState(true); // Estado para el indicador de carga
  const [profileError, setProfileError] = useState<string | null>(null); // Estado para errores de carga del perfil

  const styles = styling(colorScheme || 'light', showLikedRecipes, showUnpublishedRecipes);
  const router = useRouter();

  // useEffect para obtener el nombre de usuario de AsyncStorage (se ejecuta una vez)
  useEffect(() => {
    const fetchAndSetUsername = async () => {
      try {
        const usernameFromStorage = await AsyncStorage.getItem('username');
        if (usernameFromStorage) {
          console.log('Username fetched from AsyncStorage:', usernameFromStorage);
          setCurrentUsername(usernameFromStorage);
        } else {
          console.log('No username found in AsyncStorage. User might not be logged in.');
          // Si no hay username, podrías redirigir al login o mostrar un mensaje.
          // setCurrentUsername(null); // Ya es null por defecto
          setIsProfileLoading(false); // No hay perfil que cargar si no hay usuario
        }
      } catch (error) {
        console.error('Error fetching username from AsyncStorage:', error);
        // setCurrentUsername(null);
        setIsProfileLoading(false); // Maneja el error
      }
    };

    fetchAndSetUsername();
  }, []);

  // useEffect para obtener la información del perfil desde el backend
  // Se ejecuta cuando currentUsername cambia (es decir, cuando se obtiene de AsyncStorage)
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUsername) {
        setIsProfileLoading(false); // No hay usuario para buscar
        return;
      }

      setIsProfileLoading(true); // Empieza a cargar el perfil
      setProfileError(null); // Limpia errores anteriores

      try {
        if (!URL_PUBLICA) {
          throw new Error("EXPO_PUBLIC_BACKEND_URL not defined. Check your .env file and app.config.js.");
        }

        console.log(`Fetching profile for: ${currentUsername} from ${URL_PUBLICA}/user/profile/${currentUsername}`);
        
        const response = await axios.get<UserProfile>( 
          `${URL_PUBLICA}/user/profile/${currentUsername}`,
          {
            headers: {
              'x-api-key': API_KEY, 
            },
          }
        );

        if (response.data) {
          setUserProfile(response.data);
          console.log("User profile fetched successfully:", response.data);
        } else {
          console.log("No user profile data received from API.");
          setUserProfile(null);
          setProfileError("No se encontraron datos de perfil.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(null);
        if (axios.isAxiosError(error)) {
          setProfileError(error.response?.data?.message || error.message || "Error al cargar el perfil.");
        } else {
          setProfileError("Error desconocido al cargar el perfil.");
        }
      } finally {
        setIsProfileLoading(false); // Finaliza la carga
      }
    };

    fetchUserProfile();
  }, [currentUsername, URL_PUBLICA, API_KEY]); // Depende de currentUsername, URL_PUBLICA y API_KEY

  const toggleLikedRecipes = () => {
    if (!showLikedRecipes) {
      setShowLikedRecipes(true);
      setShowUnpublishedRecipes(false);
    }
  };

  const toggleUnpublishedRecipes = () => {
    if (!showUnpublishedRecipes) {
      setShowUnpublishedRecipes(true);
      setShowLikedRecipes(false);
    }
  };

  // Determina la fuente de la imagen de perfil
  const profileImageSource = userProfile?.photo 
    ? { uri: userProfile.photo } 
    : defaultProfileImageSource;

  return (
    <View style={styles.container}>
      <View style={[{ backgroundColor: "#000" }, { width: "100%" }, { height: 1 }]}></View>
      
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}></Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <FontAwesome name="gear" size={24} color={styles.settingsIcon.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image 
            source={profileImageSource} 
            style={styles.profileImage} 
          />
          
          {isProfileLoading ? (
            // Muestra un indicador de carga mientras se carga el perfil
            <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />
          ) : profileError ? (
            // Muestra un mensaje de error si la carga falla
            <Text style={styles.profileDetailText}>Error: {profileError}</Text>
          ) : userProfile ? (
          <Text style={styles.username}>{userProfile.username}</Text>
          ) : (
            // Mensaje si no se encontró perfil (ej. usuario no logueado o error silencioso)
            <Text style={styles.username}>No se pudo cargar el perfil.</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={toggleLikedRecipes}>
              <FontAwesome name="heart" size={24} color={styles.actionButtonIcon.color} />
              {showLikedRecipes && <View style={styles.underline} />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={toggleUnpublishedRecipes}>
              <FontAwesome name="pencil" size={24} color={styles.actionButtonIcon.color} />
              {showUnpublishedRecipes && <View style={styles.underline} />}
            </TouchableOpacity>
          </View>
        </View>

        {showLikedRecipes && (
          <View style={styles.recipesSection}>
            <RecipeCard />
            <RecipeCard />
          </View>
        )}

        {showUnpublishedRecipes && (
          <View style={styles.recipesSection}>
            <RecipeCardNotPublished />
            <RecipeCardNotPublished />
          </View>
        )}
      </ScrollView>
    </View>
  );
}