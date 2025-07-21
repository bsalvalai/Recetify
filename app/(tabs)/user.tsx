import { useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Constants from 'expo-constants';

import { useColorScheme } from '@/components/useColorScheme';
import RecipeCard from '@/components/RecipeCard'; // Componente para recetas PUBLICADAS (ej. favoritas)
import RecipeCardNotPublished from '@/components/RecipeCardNotPublished'; // Componente para tus recetas NO PUBLICADAS
import RecipeCardPublished from '@/components/RecipeCardPublished'; // Componente para tus recetas PUBLICADAS

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/components/AuthContext';

// --- IMPORTAR INTERFACES DESDE EL NUEVO ARCHIVO ---
import { UserProfile, BackendRecipe, MappedRecipe } from '../../components/RecipeTypes'; // ¡Asegúrate que esta ruta sea correcta!

// --- FUNCIÓN DE TRANSFORMACIÓN (MODIFICADO) ---
function transformBackendRecipeToMappedRecipe(backendRecipe: BackendRecipe): MappedRecipe {
    const imageUrl = (backendRecipe.photos && backendRecipe.photos.length > 0)
        ? backendRecipe.photos[0]
        : 'https://via.placeholder.com/150';

    const commentsCount = backendRecipe.reviews ? backendRecipe.reviews.length : 0;

    let formattedDate: string | null = null;
    if (backendRecipe.date) {
        const parts = backendRecipe.date.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);

            const dateObj = new Date(year, month, day);

            if (!isNaN(dateObj.getTime())) {
                formattedDate = backendRecipe.date; // Mantener el formato original DD/MM/YYYY
            } else {
                console.warn("UserScreen (transform): Fecha inválida parseada. Original:", backendRecipe.date, "Parsed Date Object:", dateObj);
                formattedDate = null; // Si es inválida, mejor null para identificar como no publicada
            }
        } else {
            console.warn("UserScreen (transform): Formato de fecha inesperado. Original:", backendRecipe.date);
            formattedDate = null; // Si el formato es inesperado, mejor null
        }
    } else {
        // Si backendRecipe.date es null o undefined, significa que no está publicada.
        console.warn("UserScreen (transform): La propiedad 'date' está vacía o indefinida en la receta del backend. Asumiendo no publicada.", backendRecipe);
        formattedDate = null; // Si es null, es no publicada
    }

    const transformed: MappedRecipe = {
        id: String(backendRecipe.recipe_id),
        title: backendRecipe.recipe_name || 'Receta sin Título',
        user: backendRecipe.author || 'Autor Desconocido',
        commentsCount: commentsCount,
        imageUrl: imageUrl,
        rating: backendRecipe.rating || 0,
        // Si formattedDate es null, significa que no tiene fecha de publicación,
        // por lo tanto, es una receta no publicada/borrador.
        date: formattedDate, // Usamos null para indicar "no publicada"
        briefDescription: backendRecipe.description || '',
        dishType: backendRecipe.type || null,
        // --- AJUSTES EN INGREDIENTES Y PASOS PARA MANEJAR NULOS/UNDEFINED ---
        ingredients: (backendRecipe.ingredients ?? []).map(ing => ({
            name: ing.ingredient_name,
            quantity: ing.quantity,
            unit: ing.unit,
        })),
        steps: (backendRecipe.steps ?? []).map(step => ({
            description: step.description,
            // Usamos encadenamiento opcional para mayor seguridad si photos/videos son nulos/undefined
            mediaUrlInput: (step.photos?.[0] || step.videos?.[0] || ''),
            mediaType: (step.photos?.length > 0 ? 'image' : (step.videos?.length > 0 ? 'mp4-video' : null)),
            displayMediaUrls: (step.photos?.length > 0 ? step.photos : (step.videos?.length > 0 ? step.videos : [])),
        })),
    };
    return transformed;
}

const URL_PUBLICA = process.env.EXPO_PUBLIC_BACKEND_URL;
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

    const [showLikedRecipes, setShowLikedRecipes] = useState(true);
    const [showUnpublishedRecipes, setShowUnpublishedRecipes] = useState(false);

    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [likedRecipes, setLikedRecipes] = useState<MappedRecipe[]>([]);
    const [isLoadingLikedRecipes, setIsLoadingLikedRecipes] = useState(false);
    const [likedRecipesError, setLikedRecipesError] = useState<string | null>(null);

    const [unpublishedRecipes, setUnpublishedRecipes] = useState<MappedRecipe[]>([]);
    const [isLoadingUnpublishedRecipes, setIsLoadingUnpublishedRecipes] = useState(false);
    const [unpublishedRecipesError, setUnpublishedRecipesError] = useState<string | null>(null);

    const styles = styling(colorScheme || 'light', showLikedRecipes, showUnpublishedRecipes);
    const router = useRouter();

    // useEffect para obtener el nombre de usuario de AsyncStorage
    useEffect(() => {
        const fetchAndSetUsername = async () => {
            try {
                const usernameFromStorage = await AsyncStorage.getItem('username');
                if (usernameFromStorage) {
                    setCurrentUsername(usernameFromStorage);
                    console.log('UserScreen: Username loaded from AsyncStorage:', usernameFromStorage);
                } else {
                    console.log('UserScreen: No username found in AsyncStorage. User might not be logged in.');
                    setIsProfileLoading(false);
                }
            } catch (error) {
                console.error('UserScreen: Error fetching username from AsyncStorage:', error);
                setIsProfileLoading(false);
            }
        };
        fetchAndSetUsername();
    }, []);

    // --- Función para obtener la información del perfil desde el backend (Ahora en useCallback) ---
    const fetchUserProfile = useCallback(async () => {
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

            console.log(`UserScreen: Fetching profile for: ${currentUsername} from ${URL_PUBLICA}/user/profile/${currentUsername}`);

            const response = await axios.get<UserProfile>(
                `${URL_PUBLICA}/user/profile/${currentUsername}`,
                {
                    headers: {
                        'x-api-key': API_KEY,
                    },
                }
            );

            console.log("UserScreen: Response from user profile API:", response.data);
            if (response.data) {
                setUserProfile(response.data);
                console.log("UserScreen: User profile fetched successfully:", response.data);
            } else {
                console.log("UserScreen: No user profile data received from API.");
                setUserProfile(null);
                setProfileError("No se encontraron datos de perfil.");
            }
        } catch (error) {
            console.error("UserScreen: Error fetching user profile:", error);
            setUserProfile(null);
            if (axios.isAxiosError(error)) {
                setProfileError(error.response?.data?.message || error.message || "Error al cargar el perfil.");
            } else {
                setProfileError("Error desconocido al cargar el perfil.");
            }
        } finally {
            setIsProfileLoading(false);
        }
    }, [currentUsername, URL_PUBLICA, API_KEY]); // Dependencias para useCallback

    // --- useFocusEffect para cargar el perfil del usuario cada vez que la pantalla entra en foco ---
    useFocusEffect(
        useCallback(() => {
            if (currentUsername) {
                fetchUserProfile();
            }
            return () => {
                // Opcional: limpiar estados o cancelar peticiones si la pantalla sale de foco
                // y la petición aún está en curso.
            };
        }, [currentUsername, fetchUserProfile])
    );

    // Función para obtener las recetas guardadas en favoritos (encapsulada en useCallback)
    const fetchLikedRecipes = useCallback(async () => {
        if (!currentUsername || !showLikedRecipes) {
            setLikedRecipes([]);
            setIsLoadingLikedRecipes(false);
            return;
        }

        setIsLoadingLikedRecipes(true);
        setLikedRecipesError(null);
        console.log(`UserScreen: Fetching liked recipes for: ${currentUsername}`);

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

            console.log("LOG USER SCREEN (LIKED): Datos crudos de recetas recibidos:", JSON.stringify(response.data, null, 2));

            if (response.status === 200 && Array.isArray(response.data)) {
                const mappedRecipes: MappedRecipe[] = response.data.map(transformBackendRecipeToMappedRecipe);
                console.log("LOG USER SCREEN (LIKED): Recetas transformadas (con fecha):", JSON.stringify(mappedRecipes, null, 2));
                setLikedRecipes(mappedRecipes);
            } else {
                console.warn("UserScreen: Unexpected response when fetching liked recipes:", response.data);
                setLikedRecipes([]);
                setLikedRecipesError("No se pudieron cargar las recetas favoritas.");
            }
        } catch (error) {
            console.error("UserScreen: Error fetching liked recipes:", error);
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

    // Función para cargar recetas no publicadas del usuario desde my-list
    const fetchUnpublishedRecipes = useCallback(async () => {
        if (!currentUsername) {
            console.warn("UserScreen: No username available for fetching unpublished recipes");
            return;
        }

        setIsLoadingUnpublishedRecipes(true);
        setUnpublishedRecipesError(null);
        console.log(`UserScreen: Fetching unpublished recipes for: ${currentUsername}`);

        try {
            if (!URL_PUBLICA) {
                throw new Error("EXPO_PUBLIC_BACKEND_URL not defined for unpublished recipes.");
            }

            const response = await axios.get<BackendRecipe[]>(
                `${URL_PUBLICA}/user/recipes/${currentUsername}`,
                {
                    headers: {
                        'x-api-key': API_KEY,
                    },
                }
            );

            console.log("LOG USER SCREEN (UNPUBLISHED): Datos crudos de recetas recibidos:", JSON.stringify(response.data, null, 2));

            if (response.status === 200 && Array.isArray(response.data)) {
                const allMappedRecipes: MappedRecipe[] = response.data.map(transformBackendRecipeToMappedRecipe);
                
                // --- DEBUGGING: Revisa el contenido de una receta mapeada aquí ---
                if (allMappedRecipes.length > 0) {
                    console.log("DEBUG: Mapped unpublished recipe (singular example):", JSON.stringify(allMappedRecipes[0], null, 2));
                }

                // setUnpublishedRecipes contendrá todas las recetas del usuario (publicadas y no publicadas)
                // la renderización condicional en el JSX las separará.
                setUnpublishedRecipes(allMappedRecipes); 

                console.log("LOG USER SCREEN (UNPUBLISHED): Recetas transformadas y procesadas:", JSON.stringify(allMappedRecipes, null, 2));

            } else {
                console.warn("UserScreen: Unexpected response when fetching unpublished recipes:", response.data);
                setUnpublishedRecipes([]);
                setUnpublishedRecipesError("No se pudieron cargar las recetas.");
            }
        } catch (error) {
            console.error("UserScreen: Error fetching unpublished recipes:", error);
            setUnpublishedRecipes([]);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    setUnpublishedRecipesError("Este usuario aún no ha creado recetas.");
                } else {
                    setUnpublishedRecipesError(error.response?.data?.message || error.message || "Error al cargar las recetas creadas.");
                }
            } else {
                setUnpublishedRecipesError("Error desconocido al cargar las recetas creadas.");
            }
        } finally {
            setIsLoadingUnpublishedRecipes(false);
        }
    }, [currentUsername, URL_PUBLICA, API_KEY]);

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

    // useFocusEffect para cargar recetas no publicadas cada vez que la pantalla entra en foco
    useFocusEffect(
        useCallback(() => {
            if (showUnpublishedRecipes && currentUsername) {
                fetchUnpublishedRecipes();
            } else if (!showUnpublishedRecipes) {
                setUnpublishedRecipes([]);
                setUnpublishedRecipesError(null);
            }
            return () => {};
        }, [currentUsername, showUnpublishedRecipes, fetchUnpublishedRecipes])
    );

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
                                <RecipeCard key={recipe.id} recipe={recipe} />
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
                        <Text style={styles.sectionTitle}>Mis Recetas</Text>
                        {isLoadingUnpublishedRecipes ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#ff6b6b" />
                                <Text style={styles.loadingText}>Cargando recetas...</Text>
                            </View>
                        ) : unpublishedRecipesError ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.errorText}>{unpublishedRecipesError}</Text>
                            </View>
                        ) : unpublishedRecipes.length > 0 ? (
                            unpublishedRecipes.map((recipe) => (
                                // RENDERIZACIÓN CONDICIONAL PARA MIS RECETAS
                                // Usa `recipe.date === null` para verificar si está no publicada
                                recipe.date === null ? (
                                    <RecipeCardNotPublished key={recipe.id} recipe={recipe} />
                                ) : (
                                    <RecipeCardPublished key={recipe.id} recipe={recipe} />
                                )
                            ))
                        ) : (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.messageText}>Aún no has creado recetas.</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}