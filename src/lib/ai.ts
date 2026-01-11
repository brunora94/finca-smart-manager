import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Initialize Gemini client lazily
let geminiClients: GoogleGenerativeAI[] = [];

// Models to try in order of preference
const MODELS_TO_TRY = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro"
];

function getGeminiClients(): GoogleGenerativeAI[] {
    if (geminiClients.length > 0) return geminiClients;

    // Collect all available Google Keys
    const keys = [
        process.env.GOOGLE_API_KEY,
        process.env.GOOGLE_API_KEY_2,
        process.env.GOOGLE_API_KEY_3
    ].filter(Boolean) as string[];

    if (keys.length === 0) {
        console.error("AI Error: No GOOGLE_API_KEY found in environment.");
        return [];
    }

    // Clean keys (remove potential extra whitespace/quotes)
    const cleanKeys = keys.map(k => k.trim().replace(/^["']|["']$/g, ""));
    geminiClients = cleanKeys.map(k => new GoogleGenerativeAI(k));
    return geminiClients;
}

export async function runWithResilience(action: (model: any) => Promise<any>) {
    const clients = getGeminiClients();
    if (clients.length === 0) throw new Error("No hay proveedores de IA configurados. Revisa tus variables de entorno.");

    let lastError: any = null;

    // Outer loop: Try each available API Key
    for (let i = 0; i < clients.length; i++) {
        const client = clients[i];

        // Inner loop: Try each recommended model for this key
        for (const modelName of MODELS_TO_TRY) {
            try {
                const model = client.getGenerativeModel({ model: modelName });
                return await action(model);
            } catch (e: any) {
                const errorMessage = e.message || "";
                const isQuota = errorMessage.includes('429') || errorMessage.includes('quota');
                const isNotFound = errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('not supported');

                if (isQuota) {
                    console.warn(`Gemini Quota exceeded for model ${modelName} on Key ${i + 1}. Trying next...`);
                    lastError = new Error(`Cuota agotada en Key ${i + 1} (${modelName}). Intentando alternativa...`);
                    continue;
                }

                if (isNotFound) {
                    console.warn(`Gemini Model ${modelName} not available or not supported on Key ${i + 1}. Skipping...`);
                    lastError = e;
                    continue;
                }

                console.warn(`Gemini error with ${modelName} on Key ${i + 1}:`, errorMessage);
                lastError = e;
                continue;
            }
        }
    }
    throw lastError || new Error("Todos los modelos y llaves de IA han fallado.");
}

export async function analyzeCropImage(imageUrl: string, userNote?: string, context?: any) {
    try {
        let base64Image = "";
        let mimeType = "image/jpeg";

        if (imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            mimeType = response.headers.get('content-type') || "image/jpeg";
            const arrayBuffer = await response.arrayBuffer();
            base64Image = Buffer.from(arrayBuffer).toString('base64');
        } else {
            // Fallback for local dev/legacy if still used
            const fullPath = path.join(process.cwd(), "public", imageUrl);
            if (fs.existsSync(fullPath)) {
                const imageBuffer = fs.readFileSync(fullPath);
                base64Image = imageBuffer.toString("base64");
            }
        }

        if (!base64Image) throw new Error("Could not load image for analysis");

        const prompt = `
      Eres un agrónomo experto gestionando una finca ecológica en Asturias llamada "La Finquina".
      Analiza esta imagen junto con el contexto del cultivo.
      
      CONTEXTO DEL CULTIVO:
      - Nombre: ${context?.name || 'Desconocido'}
      - Variedad: ${context?.variety || 'Desconocida'}
      - Ubicación: ${context?.bed || 'General'} / ${context?.row || 'Sin fila'}
      - Notas del usuario: "${userNote || 'Sin notas'}"
      - Vecinos registrados en la misma línea (separados por 40cm): ${context?.neighbors?.join(', ') || 'Ninguno'}
      - FECHA ACTUAL: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
      
      REGLAS TÉCNICAS (Prioridad):
      - Nogal: Tóxico para Manzanos, Perales, Tomates y Patatas.
      - Manzano: Se beneficia de Trébol y Ajo.
      
      REQ_ANÁLISIS:
      1. Identifica salud y vigor.
      2. Evalúa COMPATIBILIDAD con los vecinos.
      3. Estima FECHA DE COSECHA: Basándote en lo que ves, la FECHA ACTUAL (${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}) y sabiendo que se plantó el ${context?.plantedAt ? new Date(context.plantedAt).toLocaleDateString('es-ES') : 'fecha desconocida'}, ¿cuándo estará listo para recolectar? (Dá un rango o fecha aproximada basándote en el calendario real).
      4. Diagnóstico TÉCNICO: ¿Hay plagas? ¿Necesita quitar malas hierbas? ¿Necesita diatomeas o insecticidas específicos?
      
      Devuelve ÚNICAMENTE un objeto JSON:
      {
        "identification": "Identificación",
        "health": "Bueno | Regular | Malo",
        "diagnosis": "Diagnóstico detallado",
        "compatibility": "Análisis de vecinos",
        "harvestEstimation": "Fecha o periodo estimado de cosecha",
        "agronomicTips": ["Tarea técnica 1", "Tarea técnica 2"],
        "advice": "Consejo general",
        "suggestedTasks": ["Tarea de mantenimiento general"]
      }
    `;

        const result = await runWithResilience((model) => model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType: mimeType } }
        ]));

        const text = result.response.text();
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);

    } catch (error: any) {
        console.error("Gemini Analysis failed:", error);
        return { error: error?.message || "Gemini error" };
    }
}

export async function analyzeCropNote(userNote: string, context?: any) {
    try {
        const prompt = `
      Analiza esta NOTA DE CAMPO para "La Finquina":
      - Cultivo: ${context?.name || 'Desconocido'}
      - Nota: "${userNote}"
      - Vecinos: ${context?.neighbors?.join(', ') || 'Ninguno'}
      - Fecha de Plantación: ${context?.plantedAt ? new Date(context.plantedAt).toLocaleDateString('es-ES') : 'fecha desconocida'}
      - FECHA ACTUAL: ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
      
      REQ_ANÁLISIS:
      1. Identifica salud y vigor basándote en la nota.
      2. Evalúa COMPATIBILIDAD con los vecinos.
      3. Estima FECHA DE COSECHA: Basándote en la FECHA ACTUAL, el tiempo transcurrido desde la plantación y lo que dice la nota.
      4. Diagnóstico TÉCNICO: ¿Menciona plagas? ¿Necesita quitar malas hierbas? ¿Sugieres diatomeas o insecticidas?
      
      Devuelve JSON { identification, health, diagnosis, compatibility, harvestEstimation, agronomicTips: [], advice, suggestedTasks: [] }.
    `;

        const result = await runWithResilience((model) => model.generateContent(prompt));
        const jsonString = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonString);
    } catch (error) {
        return { error: "Failed to analyze note" };
    }
}

export async function translateToSpanish(text: string): Promise<string> {
    try {
        const result = await runWithResilience((model) =>
            model.generateContent(`Translate this plant common name from English to Spanish (only the Spanish common name, nothing else): "${text}"`)
        );
        return result.response.text().trim().replace(/[".]/g, "");
    } catch (e) {
        return text;
    }
}

export async function getAiDailyAdvice(context: {
    weather: any,
    pendingTasks: any[],
    activeCrops: any[],
    monthlySpending: number
}) {
    try {
        const prompt = `
            Eres el "Consejero Maestro" de La Finquina, una finca en Asturias.
            Fecha de hoy: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            Resumen motivador (máx 300 carac) para hoy:
            - Clima: ${context.weather?.temp}°C, Hum ${context.weather?.humidity}%.
            - Tareas: ${context.pendingTasks.length} pendientes.
            - Cultivos: ${context.activeCrops.length} activos.
            - Gasto: ${context.monthlySpending}€.
            
            Dá un consejo directo y usa emojis. 🌱
        `;

        const result = await runWithResilience((model) => model.generateContent(prompt));
        return result.response.text().trim();
    } catch (e: any) {
        console.error("Dashboard AI Advice Error:", e.message);
        const isQuota = e.message?.includes('429') || e.message?.includes('quota');
        return isQuota
            ? "La IA está descansando un momento (límite de cuota gratuito). Prueba en un minuto. ☕"
            : `IA en mantenimiento. Error: ${e.message?.substring(0, 500)} 🌱`;
    }
}

export async function translateToEnglish(query: string): Promise<string> {
    try {
        const result = await runWithResilience((model) =>
            model.generateContent(`Translate the following plant common name from Spanish to simple English (only the English common name, nothing else): "${query}"`)
        );
        return result.response.text().trim().replace(/[".]/g, "");
    } catch (e) {
        return query;
    }
}
