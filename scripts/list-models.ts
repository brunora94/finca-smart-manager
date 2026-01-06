import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("GOOGLE_API_KEY not found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Unfortunately, the JS SDK doesn't have a direct listModels method in the same way the bridge does
        // but it might be exposed in newer versions or we can try fetching from the raw endpoint
        // For now, let's try a common alternative model name if 1.5-flash failed
        console.log("Listing models is not directly supported in the standard JS SDK object,");
        console.log("but we can try to probe for gemini-1.5-flash-latest or gemini-1.5-flash-8b.");

        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-1.5-flash-8b"];

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hola, ¿estás disponible?");
                console.log(`Model ${modelName}: SUCCESS`);
            } catch (e: any) {
                console.log(`Model ${modelName}: FAILED - ${e.message}`);
            }
        }
    } catch (error) {
        console.error("Listing failed:", error);
    }
}

listModels();
