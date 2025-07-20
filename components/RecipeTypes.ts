export interface BackendIngredient {
    ingredient_id: number | null;
    ingredient_name: string;
    quantity: number;
    unit: string;
}

export interface BackendStep {
    step_id: number | null;
    description: string;
    order: number;
    photos: string[]; // URLs de fotos
    videos: string[]; // URLs de videos
}

export interface BackendRecipe {
    recipe_id: number;
    recipe_name: string;
    ingredients: BackendIngredient[]; // Ahora tipado
    steps: BackendStep[]; // Ahora tipado
    preparation_time: string;
    description: string; // Se usará como briefDescription
    quantity_servings: number;
    type: string | null; // Se usará como dishType
    reviews: any[];
    author: string;
    rating: number;
    photos: string[]; // Para la imagen de portada
    videos?: string[];
    date: string | null; // Puede ser null para recetas no publicadas
}

// MappedRecipe debe incluir todos los campos que espera FullRecipeData en el preview/detail screen
// ¡Importante: Los campos detallados son OPCIONALES aquí!
export interface MappedRecipe {
    id: string; // recipe_id
    title: string; // recipe_name
    user: string; // author (createdByUsername)
    commentsCount: number;
    imageUrl: string; // photos[0]
    rating: number;
    date: string | null; // date. Será la fecha real o null si no publicada
    briefDescription?: string; // Asegúrate de que exista y sea opcional si no siempre viene
    dishType?: string | null; // Asegúrate de que exista y sea opcional
    createdByUsername?: string; // ¡CAMBIO CLAVE: Agrega esta propiedad!
    publishedDate?: string; // Puede ser la fecha de creación/última modificación si es no publicada

    ingredients?: { name: string; quantity: number; unit: string }[]; // Propiedad para ingredientes

    steps?: { // Propiedad para pasos (Array de objetos)
        description: string;
        order: number; // ¡CAMBIO CLAVE: Agrega esta propiedad!
        mediaUrlInput: string; // URL original
        mediaType: 'image' | 'mp4-video' | null; // Tipo de medio principal
        displayMediaUrls: string[]; // URLs ya resueltas para mostrar
    }[];
}

export interface UserProfile {
    user_id: number;
    username: string;
    email: string;
    photo: string;
    phone: string;
    birthdate: string;
    role: string;
}