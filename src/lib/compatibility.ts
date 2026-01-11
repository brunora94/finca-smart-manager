export type CompatibilityType = 'Excellent' | 'Good' | 'Neutral' | 'Bad' | 'Antagonistic';

export interface CompatibilityRule {
    target: string;
    type: CompatibilityType;
    reason: string;
}

export interface PlantInfo {
    id: string;
    name: string;
    description: string;
    benefits?: string[];
    rivals?: string[];
    compatibilities: CompatibilityRule[];
    pollination?: string;
}

export const FRUIT_TREES: PlantInfo[] = [
    {
        id: 'apple',
        name: 'Manzano (Pumar)',
        description: 'El rey de Asturias. Necesita espacio y buena aireación.',
        benefits: ['Atrae polinizadores', 'Provee sombra ligera'],
        pollination: 'Necesita otra variedad compatible para polinización cruzada (ej. Reineta + Golden).',
        compatibilities: [
            { target: 'clover', type: 'Excellent', reason: 'Fija nitrógeno y cubre el suelo.' },
            { target: 'garlic', type: 'Good', reason: 'Repele plagas y hongos.' },
            { target: 'walnut', type: 'Antagonistic', reason: 'La juglona del nogal inhibe su crecimiento.' },
            { target: 'hazelnut', type: 'Neutral', reason: 'Crecen bien cerca si hay espacio.' }
        ]
    },
    {
        id: 'pear',
        name: 'Peral (Peral)',
        description: 'Sensible al exceso de humedad en raíces. Gran productor.',
        pollination: 'Mayoría requiere polinizador cercano.',
        compatibilities: [
            { target: 'apple', type: 'Good', reason: 'Comparten requerimientos similares.' },
            { target: 'lavender', type: 'Excellent', reason: 'Atrae abejas esenciales para su fruto.' },
            { target: 'walnut', type: 'Antagonistic', reason: 'Sensible al nogal.' }
        ]
    },
    {
        id: 'cherry',
        name: 'Cerezo',
        description: 'Crecimiento rápido. Sensible a la mosca de la fruta.',
        compatibilities: [
            { target: 'onion', type: 'Good', reason: 'Ayuda a repeler insectos.' },
            { target: 'plum', type: 'Good', reason: 'Suelen llevarse bien en fincas mixtas.' }
        ]
    },
    {
        id: 'walnut',
        name: 'Nogal (Nucal)',
        description: 'Árbol imponente. Produce juglona, una toxina alelopática.',
        rivals: ['Manzano', 'Peral', 'Tomate', 'Patata'],
        compatibilities: [
            { target: 'grass', type: 'Bad', reason: 'Incluso la hierba crece con dificultad bajo su copa.' },
            { target: 'currant', type: 'Good', reason: 'Las grosellas suelen tolerar mejor la juglona.' }
        ]
    },
    {
        id: 'hazelnut',
        name: 'Avellano (Ablanal)',
        description: 'Típico del paisaje asturiano. Resistente y rústico.',
        compatibilities: [
            { target: 'apple', type: 'Good', reason: 'Buen compañero de lindes.' },
            { target: 'plum', type: 'Good', reason: 'Raíces compatibles.' }
        ]
    },
    {
        id: 'plum',
        name: 'Ciruelo',
        description: 'Muy productivo en Asturias. Soporta bien el frío.',
        compatibilities: [
            { target: 'cherry', type: 'Good', reason: 'Cuidado similar.' },
            { target: 'garlic', type: 'Excellent', reason: 'Reduce riesgo de hongos.' }
        ]
    },
    {
        id: 'lemon',
        name: 'Limonero',
        description: 'Sensible a heladas. Necesita sol y reparo.',
        compatibilities: [
            { target: 'rosemary', type: 'Good', reason: 'Protección biológica y estética.' },
            { target: 'mint', type: 'Good', reason: 'Mantiene humedad y ahuyenta pulgón.' }
        ]
    }
];

export const VEGETABLES: PlantInfo[] = [
    {
        id: 'tomato',
        name: 'Tomate',
        description: 'Cultivo estrella del verano. Necesita mucho sol y riego regular.',
        benefits: ['Fácil de cultivar', 'Alta producción'],
        compatibilities: [
            { target: 'basil', type: 'Excellent', reason: 'La albahaca mejora su sabor y protege de plagas.' },
            { target: 'onion', type: 'Good', reason: 'Ayudan a repeler insectos.' },
            { target: 'potato', type: 'Antagonistic', reason: 'Peligro de transmisión de tizón y virus.' },
            { target: 'walnut', type: 'Antagonistic', reason: 'Muy sensible a la juglona.' }
        ]
    },
    {
        id: 'potato',
        name: 'Patata',
        description: 'Tubérculo fundamental. Prefiere suelos sueltos.',
        compatibilities: [
            { target: 'beans', type: 'Excellent', reason: 'Las judías fijan nitrógeno que la patata agradece.' },
            { target: 'tomato', type: 'Bad', reason: 'Comparten plagas y enfermedades.' }
        ]
    },
    {
        id: 'onion',
        name: 'Cebolla',
        description: 'Muy versátil. Ayuda a proteger otras plantas.',
        compatibilities: [
            { target: 'carrot', type: 'Excellent', reason: 'La cebolla ahuyenta la mosca de la zanahoria.' },
            { target: 'tomato', type: 'Excellent', reason: 'Gran pareja en el huerto.' },
            { target: 'peas', type: 'Antagonistic', reason: 'La cebolla inhibe el crecimiento de las leguminosas.' }
        ]
    },
    {
        id: 'broccoli',
        name: 'Brócoli',
        description: 'Cultivo de temporada fresca. Rico en vitaminas y muy saludable.',
        compatibilities: [
            { target: 'potato', type: 'Good', reason: 'Se ayudan mutuamente en la absorción de nutrientes.' },
            { target: 'onion', type: 'Good', reason: 'La cebolla ayuda a camuflar el olor del brócoli ante plagas.' },
            { target: 'tomato', type: 'Bad', reason: 'Compiten por recursos y pueden atraer plagas similares.' }
        ]
    }
];

export const ALL_PLANTS = [...FRUIT_TREES, ...VEGETABLES];

export function getCompatibility(id1: string, id2: string): CompatibilityRule | null {
    const plant1 = ALL_PLANTS.find(p => p.id === id1 || p.name.toLowerCase().includes(id1.toLowerCase()));
    if (!plant1) return null;

    // Direct match target
    const rule = plant1.compatibilities.find(c => c.target === id2 || id2.toLowerCase().includes(c.target.toLowerCase()));
    if (rule) return rule;

    // Reciprocal
    const plant2 = ALL_PLANTS.find(p => p.id === id2 || p.name.toLowerCase().includes(id2.toLowerCase()));
    if (plant2) {
        const reciprocal = plant2.compatibilities.find(c => c.target === id1 || id1.toLowerCase().includes(c.target.toLowerCase()));
        if (reciprocal) return reciprocal;
    }

    return { target: id2, type: 'Neutral', reason: 'No hay interacciones conocidas especiales.' };
}
