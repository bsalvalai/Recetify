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
    id: string;
    title: string;
    imageUrl: string;
    briefDescription: string;
    dishType?: string;
    user: string;
    ingredients: { name: string; quantity: number; unit: string }[];
    steps: {
        order?: number; // Puede ser opcional si lo generas en la transformación
        description: string;
        displayMediaUrls: string[];
        mediaType: 'image' | 'mp4-video';
    }[];
    date: string | null;
    servings: number; // <--- ¡Asegúrate de que este campo exista!
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