import { analyzeCropImage } from '../src/lib/ai'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    console.log("Testing AI Analysis...")
    // Use one of the images the user already uploaded
    const imagePath = "/uploads/1766755210914_image.jpg"

    try {
        const result = await analyzeCropImage(imagePath, "Test note")
        console.log("Result:", result)
    } catch (error) {
        console.error("Test Failed:", error)
    }
}

main()
