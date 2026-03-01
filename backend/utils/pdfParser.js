import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
* Extraer texto de un archivo PDF
* @param {string} filePath - Ruta al archivo PDF
* @returns {Promise<{text: string, numPages: number}>}
*/
export const extractTextFromPDF = async (filepath) => {
    try {
        const dataBuffer = await fs.readFile(filepath);
        // pdf-parse espera un Uint8Array, no un Buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text: data.text,
            numPages: data.numpages,
            info: data.info,
        };
    } catch (error) {
        console.error("Error al analizar PDF:", error);
        throw new Error("No se pudo extraer el texto del PDF");
    }
};