export const CROP_CATEGORIES = {
    HOJA: ["Lechuga", "Acelga", "Espinaca", "Col", "Brócoli", "Repollo", "Kale"],
    FRUTO: ["Tomate", "Pimiento", "Berenjena", "Calabacín", "Pepino", "Calabaza", "Fresas"],
    RAIZ: ["Zanahoria", "Rábano", "Cebolla", "Ajo", "Remolacha", "Patata", "Puerro"],
    LEGUMINOSA: ["Habas", "Guisantes", "Alubias", "Judías"]
};

// Standard scientific rotation: Leguminosa (Fixes Nitrogen) -> Hoja (Grows well with high N) -> Fruto -> Raíz (Cleans soil)
export const ROTATION_ORDER = ["LEGUMINOSA", "HOJA", "FRUTO", "RAIZ"];

export function getRotationType(cropName: string): string {
    const nameLower = cropName.toLowerCase();
    for (const [category, names] of Object.entries(CROP_CATEGORIES)) {
        if (names.some(n => nameLower.includes(n.toLowerCase()))) {
            return category;
        }
    }
    return "OTRO";
}

export function getNextInRotation(currentType: string): string {
    const index = ROTATION_ORDER.indexOf(currentType);
    if (index === -1) return ROTATION_ORDER[0];
    return ROTATION_ORDER[(index + 1) % ROTATION_ORDER.length];
}

export function getCategoryDescription(category: string): string {
    switch (category) {
        case "LEGUMINOSA": return "Plantas que fijan nitrógeno en el suelo (Habas, Guisantes). Ideales para regenerar.";
        case "HOJA": return "Consumidoras intensas de nitrógeno (Lechugas, Coles).";
        case "FRUTO": return "Requieren potasio y fósforo (Tomate, Calabacín).";
        case "RAIZ": return "Ayudan a airear el suelo y requieren menos nutrientes superficiales (Zanahoria, Patata).";
        default: return "Categoría general de cultivo.";
    }
}
