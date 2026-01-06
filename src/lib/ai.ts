import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Initialize Gemini client lazily
let genAI: GoogleGenerativeAI | null = null;

const MODELS_TO_TRY = ["gemini-2.5-flash", "gemini-2.0-flash-exp", "gemini-2.0-flash"];

export async function runWithResilience(action: (model: any) => Promise<any>) {
    if (!genAI) {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_API_KEY not found");
        genAI = new GoogleGenerativeAI(apiKey);
    }

    let lastError: any = null;
    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            return await action(model);
        } catch (e: any) {
            console.warn(`Gemini trial with ${modelName} failed:`, e.message);
            lastError = e;
            if (e.message?.includes('404') || e.message?.includes('not found')) {
                continue;
            }
            continue;
        }
    }
    throw lastError || new Error("All models failed");
}

export async function analyzeCropImage(imageUrl: string, userNote?: string, context?: any) {
    try {
        let base64Image = "";

        if (imageUrl.startsWith('http')) {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
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
            { inlineData: { data: base64Image, mimeType: "image/jpeg" } }
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
    } catch (e) {
        return "Concéntrate en tus labores. La IA está fuera de línea. 🌱";
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
