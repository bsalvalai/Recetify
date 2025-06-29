// UserScreen.tsx

import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard';
import RecipeCardNotPublished from '@/components/RecipeCardNotPublished';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... (Las interfaces UserProfile, BackendRecipe, MappedRecipe deben estar definidas como antes) ...
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


const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_KEY = 'dapps1-2025';

// ... (styling function) ...
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
        fontSize: 24,
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
        fontSize: 20,
        fontWeight: '500',
        color: '#222',
        marginBottom: 5,
    },
    profileDetails: {
        alignItems: 'center',
        marginBottom: 10,
    },
    profileDetailText: {
        fontSize: 16,
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
    }
});


export default function UserScreen() {
    const colorScheme = useColorScheme();
    const defaultProfileImageSource = require('../../assets/images/profile.jpg');

    const [showLikedRecipes, setShowLikedRecipes] = useState(true);
    const [showUnpublishedRecipes, setShowUnpublishedRecipes] = useState(false);

    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [likedRecipes, setLikedRecipes] = useState<MappedRecipe[]>([]);
    const [isLoadingLikedRecipes, setIsLoadingLikedRecipes] = useState(false);
    const [likedRecipesError, setLikedRecipesError] = useState<string | null>(null);

    const styles = styling(colorScheme || 'light', showLikedRecipes, showUnpublishedRecipes);
    const router = useRouter();

    // useEffect para obtener el nombre de usuario de AsyncStorage
    useEffect(() => {
        const fetchAndSetUsername = async () => {
            try {
                const usernameFromStorage = await AsyncStorage.getItem('username');
                if (usernameFromStorage) {
                    setCurrentUsername(usernameFromStorage);
                } else {
                    console.log('No username found in AsyncStorage. User might not be logged in.');
                    setIsProfileLoading(false);
                }
            } catch (error) {
                console.error('Error fetching username from AsyncStorage:', error);
                setIsProfileLoading(false);
            }
        };
        fetchAndSetUsername();
    }, []);

    // useEffect para obtener la información del perfil desde el backend
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUsername) {
                setIsProfileLoading(false);
                return;
            }

            setIsProfileLoading(true);
            setProfileError(null);

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

                console.log("Response from user profile API:", response.data);
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
                setIsProfileLoading(false);
            }
        };

        fetchUserProfile();
    }, [currentUsername, URL_PUBLICA, API_KEY]);

    // Función para obtener las recetas guardadas en favoritos (encapsulada en useCallback)
    const fetchLikedRecipes = useCallback(async () => {
        if (!currentUsername || !showLikedRecipes) {
            setLikedRecipes([]);
            setIsLoadingLikedRecipes(false);
            return;
        }

        setIsLoadingLikedRecipes(true);
        setLikedRecipesError(null);
        console.log(`Fetching liked recipes for: ${currentUsername}`);

        try {
            if (!URL_PUBLICA) {
                throw new Error("EXPO_PUBLIC_BACKEND_URL not defined for liked recipes.");
            }

            const response = await axios.get<BackendRecipe[]>(
                `${URL_PUBLICA}/my-list/${currentUsername}`,
                {
                    headers: {
                        'x-api-key': API_KEY,
                    },
                }
            );

            console.log("Response from liked recipes API (RAW):", JSON.stringify(response.data, null, 2));

            if (response.status === 200 && Array.isArray(response.data)) {
                const mappedRecipes: MappedRecipe[] = response.data.map(backendRecipe => ({
                    id: String(backendRecipe.recipe_id),
                    title: backendRecipe.recipe_name,
                    user: backendRecipe.author,
                    commentsCount: backendRecipe.reviews ? backendRecipe.reviews.length : 0,
                    imageUrl: backendRecipe.photos && backendRecipe.photos.length > 0
                              ? backendRecipe.photos[0]
                              : 'https://via.placeholder.com/150',
                    rating: backendRecipe.rating || 0,
                }));
                setLikedRecipes(mappedRecipes);
            } else {
                console.warn("Unexpected response when fetching liked recipes:", response.data);
                setLikedRecipes([]);
                setLikedRecipesError("No se pudieron cargar las recetas favoritas.");
            }
        } catch (error) {
            console.error("Error fetching liked recipes:", error);
            setLikedRecipes([]);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setLikedRecipesError("Este usuario aún no tiene recetas favoritas.");
                } else {
                    setLikedRecipesError(error.response?.data?.message || error.message || "Error al cargar recetas favoritas.");
                }
            } else {
                setLikedRecipesError("Error desconocido al cargar recetas favoritas.");
            }
        } finally {
            setIsLoadingLikedRecipes(false);
        }
    }, [currentUsername, showLikedRecipes, URL_PUBLICA, API_KEY]);

    // useFocusEffect para cargar recetas favoritas cada vez que la pantalla entra en foco
    useFocusEffect(
        useCallback(() => {
            if (showLikedRecipes && currentUsername) {
                fetchLikedRecipes();
            } else if (!showLikedRecipes) {
                setLikedRecipes([]);
                setLikedRecipesError(null);
            }
            return () => {};
        }, [currentUsername, showLikedRecipes, fetchLikedRecipes])
    );

    // NOTA: La función handleDeleteFavoriteRecipe que añadí previamente NO es necesaria
    // si el botón de corazón ya maneja la eliminación.
    // La eliminación ocurrirá en RecipeCard, y el 'onFavoriteToggleSuccess'
    // junto con el 'useFocusEffect' se encargarán de actualizar la lista.


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
                        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 10 }} />
                    ) : profileError ? (
                        <Text style={styles.profileDetailText}>Error: {profileError}</Text>
                    ) : userProfile ? (
                        <Text style={styles.username}>{userProfile.username}</Text>
                    ) : (
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
                        <Text style={styles.sectionTitle}>Recetas Favoritas</Text>
                        {isLoadingLikedRecipes ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#0000ff" />
                                <Text style={styles.messageText}>Cargando favoritos...</Text>
                            </View>
                        ) : likedRecipesError ? (
                            <View style={styles.loadingContainer}>
                                <Text style={[styles.messageText, { color: 'red' }]}>{likedRecipesError}</Text>
                            </View>
                        ) : likedRecipes.length > 0 ? (
                            likedRecipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    recipe={recipe}
                                />
                            ))
                        ) : (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.messageText}>Aún no tienes recetas favoritas.</Text>
                            </View>
                        )}
                    </View>
                )}

                {showUnpublishedRecipes && (
                    <View style={styles.recipesSection}>
                        <Text style={styles.sectionTitle}>Mis Recetas (No Publicadas)</Text>
                        <RecipeCardNotPublished />
                        <RecipeCardNotPublished />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}