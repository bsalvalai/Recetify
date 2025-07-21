import React, { useState, useEffect, useRef } from 'react';
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
    Dimensions,
    FlatList
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';

import { useVideoPlayer, VideoView } from 'expo-video';

const { width } = Dimensions.get('window');

// Definir ITEM_WIDTH para el deslizador de imágenes
const HORIZONTAL_PADDING_STEP_CONTAINER = 10; // Padding del stepContainer
const CONTENT_PADDING = 12; // Padding del ScrollView
// ITEM_WIDTH se calcula para que la imagen ocupe todo el ancho del contenedor del paso.
// El contenedor del paso tiene un padding horizontal.
const ITEM_WIDTH = width - (HORIZONTAL_PADDING_STEP_CONTAINER * 2) - (CONTENT_PADDING * 2);

// Configuración de la API
const URL_PUBLICA = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
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
    mediaType: 'image' | 'mp4-video' | null;
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
    date: string; // Fecha de creación
}

// Función para formatear la fecha a DD/MM/YYYY
const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son de 0-11
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};


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
    // Inicializamos como string para un mejor control del input numérico
    const [quantityServings, setQuantityServings] = useState<string>(''); // <-- ACTUALIZADO: Cambiado a string

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
                // Si la cantidad es 0, mostrar vacío para que el usuario ingrese
                setQuantityServings(recipeData.quantity_servings > 0 ? String(recipeData.quantity_servings) : ''); // <-- ACTUALIZADO: Inicializar quantityServings como string

                // Mapear los pasos para incluir mediaType basado en los datos existentes
                const mappedSteps = recipeData.steps.map(step => {
                    let mediaType: 'image' | 'mp4-video' | null = null;
                    if (step.photos && step.photos.length > 0) {
                        mediaType = 'image';
                    } else if (step.videos && step.videos.length > 0) {
                        mediaType = 'mp4-video';
                    }
                    return {
                        ...step,
                        photos: step.photos || [],
                        videos: step.videos || [],
                        mediaType: mediaType,
                    };
                }).sort((a, b) => a.order - b.order);
                setSteps(mappedSteps);

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

        // Crear una versión "limpia" de la receta original para comparación, incluyendo mediaType
        const originalStepsCleaned = recipe.steps.map(step => {
            let mediaType: 'image' | 'mp4-video' | null = null;
            if (step.photos && step.photos.length > 0) {
                mediaType = 'image';
            } else if (step.videos && step.videos.length > 0) {
                mediaType = 'mp4-video';
            }
            return {
                ...step,
                photos: step.photos || [],
                videos: step.videos || [],
                mediaType: mediaType,
            };
        });

        // Convertir quantityServings a número para la comparación, si es una cadena vacía, tratarla como 0
        const currentQuantityServings = parseInt(quantityServings, 10) || 0; // <-- ACTUALIZADO
        const originalQuantityServings = recipe.quantity_servings;

        const hasChanges =
            recipeName !== recipe.recipe_name ||
            description !== recipe.description ||
            coverImageUrl !== (recipe.photos?.[0] || '') ||
            dishType !== recipe.type ||
            currentQuantityServings !== originalQuantityServings || // <-- ACTUALIZADO: Compara los valores numéricos
            JSON.stringify(ingredients) !== JSON.stringify(recipe.ingredients) ||
            JSON.stringify(steps) !== JSON.stringify(originalStepsCleaned);

        setHasUnsavedChanges(hasChanges);
    }, [recipeName, description, coverImageUrl, dishType, ingredients, steps, quantityServings, recipe]); // <-- Mantiene quantityServings en las dependencias

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

        // --- Validaciones ---
        if (!recipeName.trim()) {
            Alert.alert('Error', 'El título de la receta es obligatorio.');
            return;
        }

        if (!description.trim()) {
            Alert.alert('Error', 'La descripción de la receta es obligatoria.');
            return;
        }

        if (!coverImageUrl.trim()) {
            Alert.alert('Error', 'La URL de la imagen de portada es obligatoria.');
            return;
        }

        // <-- NUEVAS VALIDACIONES: quantityServings
        const parsedQuantityServings = parseInt(quantityServings, 10);

        if (isNaN(parsedQuantityServings) || parsedQuantityServings < 1 || parsedQuantityServings > 100) {
            Alert.alert('Error', 'El número de porciones debe ser un número entero entre 1 y 100.');
            return;
        }
        // <-- FIN NUEVAS VALIDACIONES: quantityServings

        if (ingredients.length === 0) {
            Alert.alert('Error', 'Debe haber al menos un ingrediente.');
            return;
        }

        // Validar que cada campo de cada ingrediente esté completo
        for (let i = 0; i < ingredients.length; i++) {
            const ing = ingredients[i];
            if (!ing.ingredient_name.trim()) {
                Alert.alert('Error', `El nombre del ingrediente ${i + 1} es obligatorio.`);
                return;
            }
            if (ing.quantity <= 0) {
                Alert.alert('Error', `La cantidad del ingrediente ${i + 1} debe ser mayor a 0.`);
                return;
            }
            if (!ing.unit.trim()) {
                Alert.alert('Error', `La unidad de medida del ingrediente ${i + 1} es obligatoria.`);
                return;
            }
        }

        if (!dishType || dishType === "") { // dishType puede ser "" si se seleccionó "Sin especificar"
            Alert.alert('Error', 'Debe seleccionar un tipo de plato válido (no "Sin especificar").');
            return;
        }

        if (steps.length === 0) {
            Alert.alert('Error', 'Debe haber al menos un paso de preparación.');
            return;
        }

        if (steps.some(step => !step.description.trim())) {
            Alert.alert('Error', 'Todos los pasos deben tener una descripción.');
            return;
        }
        // --- Fin Validaciones ---

        setIsSaving(true);
        try {
            const updatedRecipe = {
                recipe_name: recipeName.trim(),
                description: description.trim(),
                type: dishType, // Ya validado que no es ""
                preparation_time: recipe.preparation_time,
                quantity_servings: parsedQuantityServings, // <-- ACTUALIZADO: Usa el valor parseado y validado
                photos: coverImageUrl ? [coverImageUrl.trim()] : recipe.photos,
                ingredients: ingredients
                    .filter(ing => ing.ingredient_name.trim())
                    .map(ing => ({
                        ingredient_name: ing.ingredient_name.trim(),
                        quantity: ing.quantity,
                        unit: ing.unit.trim()
                    })),
                steps: steps
                    .filter(step => step.description.trim())
                    .map((step, index) => ({
                        description: step.description.trim(),
                        order: index + 1,
                        photos: step.mediaType === 'image' ? (step.photos || []) : [],
                        videos: step.mediaType === 'mp4-video' ? (step.videos || []) : []
                    })),
                date: formatDateToDDMMYYYY(new Date()), // Actualiza la fecha a la fecha actual en formato DD/MM/YYYY
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

    // --- Funciones para manejar Ingredientes ---
    const addIngredient = () => {
        setIngredients([...ingredients, { ingredient_name: '', quantity: 0, unit: '' }]);
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
        const updatedIngredients = [...ingredients];
        updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
        setIngredients(updatedIngredients);
    };
    // --- Fin Funciones para manejar Ingredientes ---

    // --- Funciones para manejar Pasos y Medios ---
    const addStep = () => {
        setSteps([...steps, { description: '', order: steps.length + 1, photos: [], videos: [], mediaType: null }]);
    };

    const removeStep = (index: number) => {
        const updatedSteps = steps.filter((_, i) => i !== index)
            .map((step, i) => ({ ...step, order: i + 1 }));
        setSteps(updatedSteps);
    };

    const updateStepDescription = (index: number, description: string) => {
        const updatedSteps = [...steps];
        updatedSteps[index] = { ...updatedSteps[index], description };
        setSteps(updatedSteps);
    };

    const handleAddMediaToStep = (stepIndex: number, url: string) => {
        const newSteps = [...steps];
        const currentStep = newSteps[stepIndex];

        const isImage = /\.(jpeg|jpg|png|gif)$/i.test(url);
        const isMp4Video = /\.mp4$/i.test(url);

        if (currentStep.mediaType && currentStep.mediaType !== null) {
            if (isImage && currentStep.mediaType !== 'image') {
                Alert.alert('Advertencia', 'Ya hay un video cargado. No puedes agregar imágenes si ya hay un video.');
                return false;
            }
            if (isMp4Video && currentStep.mediaType === 'image') {
                Alert.alert('Advertencia', 'Ya hay imágenes cargadas. No puedes agregar un video si ya hay imágenes.');
                return false;
            }
            if (isMp4Video && currentStep.mediaType === 'mp4-video') {
                Alert.alert('Advertencia', 'Ya hay un video MP4 cargado para este paso. Solo se permite uno.');
                return false;
            }
        }

        if (isImage) {
            if (currentStep.photos.length >= 5) {
                Alert.alert('Advertencia', 'Ya se han cargado 5 imágenes para este paso.');
                return false;
            }
            currentStep.mediaType = 'image';
            currentStep.photos.push(url);
        } else if (isMp4Video) {
            currentStep.mediaType = 'mp4-video';
            currentStep.videos = [url];
        } else {
            Alert.alert('Error', 'URL no válida. Por favor, ingrese una URL de imagen o de video MP4 válida.');
            return false;
        }

        setSteps(newSteps);
        return true;
    };


    const handleRemoveMediaFromStep = (stepIndex: number, mediaType: 'image' | 'mp4-video', mediaIndex?: number) => {
        // Es crucial que 'steps' sea el estado actual (ej. const [steps, setSteps] = useState(...))
        const newSteps = [...steps]; // Copia el array de pasos para no mutar el estado directamente
        const currentStep = { ...newSteps[stepIndex] }; // Copia el paso específico también

        if (mediaType === 'image') {
            if (typeof mediaIndex === 'number') {
                // Caso 1: Eliminar una imagen específica
                currentStep.photos = currentStep.photos.filter((_, i) => i !== mediaIndex);
            } else {
                // Caso 2: Eliminar TODAS las imágenes (cuando mediaIndex es undefined)
                currentStep.photos = [];
            }

            // Si después de la operación no quedan fotos, resetear mediaType
            if (currentStep.photos.length === 0) {
                currentStep.mediaType = null;
            }

        } else if (mediaType === 'mp4-video') {
            // Para videos, siempre se elimina el único video si existe
            currentStep.videos = [];
            currentStep.mediaType = null; // Reinicia el tipo de medio a null para videos
        }

        // Actualiza el paso en el array copiado
        newSteps[stepIndex] = currentStep;

        // Actualiza el estado de los pasos
        setSteps(newSteps);
    };
    // --- Fin Funciones para manejar Pasos y Medios ---

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.tint || '#0000ff'} />
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

    const handleDeleteRecipe = async () => {
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

            <View style={[{ backgroundColor: "#000" }, { width: "100%" }, { height: 1 }]}></View>

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

                    {/* ACTUALIZADO: Input para el número de porciones */}
                    <Text style={styles.label}>Número de Porciones</Text>
                    <TextInput
                        style={styles.input}
                        value={quantityServings} // <-- Usa el estado como string
                        onChangeText={(text) => {
                            // Permitir solo dígitos y asegurarse de que el primer dígito no sea 0 si hay más números
                            const cleanedText = text.replace(/[^0-9]/g, ''); // Solo números
                            if (cleanedText.startsWith('0') && cleanedText.length > 1) {
                                setQuantityServings(cleanedText.substring(1)); // Elimina ceros iniciales si hay más números
                            } else {
                                setQuantityServings(cleanedText);
                            }
                        }}
                        placeholder="Ej: 4 (entre 1 y 100)" // <-- ACTUALIZADO: Nuevo placeholder
                        placeholderTextColor={Colors.light.text}
                        keyboardType="numeric"
                        maxLength={3} // Limita a 3 dígitos (para hasta 100)
                    />
                    {/* FIN ACTUALIZADO: Input para el número de porciones */}

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
                            onUpdateDescription={(text) => updateStepDescription(stepIndex, text)}
                            onRemoveStep={() => removeStep(stepIndex)}
                            onAddMedia={(url) => handleAddMediaToStep(stepIndex, url)}
                            onRemoveMedia={(mediaType, mediaIndex) => handleRemoveMediaFromStep(stepIndex, mediaType, mediaIndex)}
                        />
                    ))}
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleDeleteRecipe}>
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
    onAddMedia: (url: string) => boolean;
    onRemoveMedia: (mediaType: 'image' | 'mp4-video', mediaIndex?: number) => void;
}

const StepEditor: React.FC<StepEditorProps> = ({
    step,
    stepIndex,
    onUpdateDescription,
    onRemoveStep,
    onAddMedia,
    onRemoveMedia,
}) => {
    const [mediaUrlInput, setMediaUrlInput] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Lógica para el reproductor de video
    const videoSource = (step.mediaType === 'mp4-video' && step.videos.length > 0)
        ? step.videos[0]
        : null;
    const player = useVideoPlayer(videoSource);

    useEffect(() => {
        if (player) {
            player.pause();
        }
    }, [stepIndex, videoSource]);

    const handleAddMedia = () => {
        if (mediaUrlInput.trim()) {
            const added = onAddMedia(mediaUrlInput.trim());
            if (added) {
                setMediaUrlInput('');
            }
        } else {
            Alert.alert('Error', 'Por favor, ingrese una URL.');
        }
    };

    // Nueva función para eliminar todos los medios de un paso
    const handleDeleteAllMedia = async () => {
        if (step.mediaType === 'mp4-video' && player) {
            await player.pause();
        }
        // Llama a onRemoveMedia sin mediaIndex para indicar que se debe limpiar todo el contenido
        onRemoveMedia(step.mediaType as 'image' | 'mp4-video'); // Pasa el mediaType actual del paso
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

            {/* Renderizado condicional de medios */}
            {step.mediaType && (step.photos.length > 0 || step.videos.length > 0) ? (
                <View>
                    <View style={styles.stepMediaContainer}>
                        {step.mediaType === 'image' && step.photos.length > 0 ? (
                            <FlatList
                                ref={flatListRef}
                                data={step.photos}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item, idx) => `step-image-${stepIndex}-${idx}`}
                                snapToInterval={ITEM_WIDTH} // Asegura que se ajuste a cada imagen
                                decelerationRate="fast"    // Desaceleración rápida para un snap claro
                                snapToAlignment="center"   // Centra la imagen al hacer snap
                                contentContainerStyle={styles.flatListContentContainer} // Ajuste para centrar la primera/última imagen
                                renderItem={({ item, index }) => (
                                    <View style={{ width: ITEM_WIDTH, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                        <Image source={{ uri: item }} style={styles.stepImage} resizeMode="cover" />
                                        <TouchableOpacity
                                            style={styles.removeSingleMediaButton}
                                            onPress={() => onRemoveMedia('image', index)}
                                        >
                                            <FontAwesome name="times-circle" size={24} color="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        ) : step.mediaType === 'mp4-video' && step.videos.length > 0 ? (
                            <View style={styles.videoPlayerWrapper}>
                                {videoSource ? (
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
                                )}
                                <TouchableOpacity
                                    style={styles.removeSingleMediaButton}
                                    onPress={() => onRemoveMedia('mp4-video')}
                                >
                                    <FontAwesome name="times-circle" size={24} color="red" />
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                    <TouchableOpacity style={styles.deleteMediaButton} onPress={handleDeleteAllMedia}>
                        <Text style={styles.deleteMediaButtonText}>Eliminar {step.mediaType === 'image' ? 'todas las imágenes' : 'video'}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.placeholderMediaContainer}>
                    <FontAwesome name="image" size={40} color="#CCC" />
                    <Text style={styles.placeholderText}>Sin contenido multimedia para este paso</Text>
                </View>
            )}

            {/* Input para añadir medios */}
            <View style={styles.addMediaInputContainer}>
                <TextInput
                    style={[styles.input, styles.mediaUrlInput]}
                    value={mediaUrlInput}
                    onChangeText={setMediaUrlInput}
                    placeholder="URL de imagen o video (.mp4)"
                    placeholderTextColor={Colors.light.text}
                    keyboardType="url"
                    autoCapitalize="none"
                />
                <TouchableOpacity style={styles.addMediaButtonSmall} onPress={handleAddMedia}>
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
        fontSize: 24,
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
        paddingHorizontal: CONTENT_PADDING, // Usar la constante CONTENT_PADDING
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
        fontSize: 20,
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
        fontSize: 18,
        marginBottom: 8,
        marginTop: 8,
        color: '#000',
        textAlign: 'center',
        fontWeight: '500',
    },
    input: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 15,
        height: 40,
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
        padding: 2,
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
        height: 48,
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
        padding: HORIZONTAL_PADDING_STEP_CONTAINER,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        paddingBottom: 40,
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
        height: 48,
        paddingVertical: 15,
        alignItems: 'center',
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
    stepMediaContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        height: 200,
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        // Se quitó el paddingHorizontal de aquí para que ITEM_WIDTH lo llene completamente
    },
    flatListContentContainer: {
        // Asegura que el contenido del FlatList tenga el padding necesario
        // para que la primera y última imagen se centren correctamente.
        // El padding debe ser la mitad del espacio restante entre el ITEM_WIDTH
        // y el ancho total del contenedor que lo envuelve (stepMediaContainer).
        // Como stepMediaContainer no tiene padding, el padding aquí es la mitad de ITEM_WIDTH
        // para centrar la primera y última imagen.
        paddingHorizontal: (width - ITEM_WIDTH) / 2 - CONTENT_PADDING,
    },
    stepImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
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
    deleteMediaButton: {
        backgroundColor: 'transparent',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: Colors.light.buttonBorder,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    deleteMediaButtonText: {
        color: Colors.light.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    addMediaInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        gap: 8,
    },
    mediaUrlInput: {
        flex: 1,
        marginRight: 8,
    },
    addMediaButtonSmall: {
        backgroundColor: Colors.light.button,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeSingleMediaButton: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 2,
    },
    mediaItemWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoPlayerWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderRadius: 10,
        overflow: 'hidden'
    },
    placeholderMediaContainer: {
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
});