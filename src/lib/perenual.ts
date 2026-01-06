export interface PerenualPlant {
    id: number;
    common_name: string;
    scientific_name: string[];
    other_name: string[];
    cycle: string;
    watering: string;
    sunlight: string[];
    default_image: {
        original_url: string;
        thumbnail: string;
    } | null;
}

export interface PerenualDetail extends PerenualPlant {
    description: string;
    type: string;
    dimension: string;
    care_level: string;
    attracts: string[];
    propagation: string[];
    hardiness: { min: string; max: string };
    flowers: boolean;
    flowering_season: string;
    fruiting_season: string;
    leaf: boolean;
    leaf_color: string[];
    edible_fruit: boolean;
    maintenance: string;
}

const API_KEY = process.env.PERENUAL_API_KEY;
const BASE_URL = 'https://perenual.com/api/v2';

export async function searchPlants(query: string): Promise<PerenualPlant[]> {
    if (!API_KEY) {
        console.warn("PERENUAL_API_KEY for plant search is missing");
        return [];
    }

    try {
        const response = await fetch(`${BASE_URL}/species-list?key=${API_KEY}&q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`Perenual API error: ${response.statusText}`);
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Failed to search plants:", error);
        return [];
    }
}

export async function getPlantDetails(id: number): Promise<PerenualDetail | null> {
    if (!API_KEY) return null;

    try {
        const response = await fetch(`${BASE_URL}/species/details/${id}?key=${API_KEY}`);
        if (!response.ok) throw new Error(`Perenual API error: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error("Failed to get plant details:", error);
        return null;
    }
}
