
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function convertCode(phpCode: string, targetLanguage: string): Promise<string> {
  if (!process.env.API_KEY) {
    throw new Error("API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const prompt = `
    As an expert polyglot software engineer, your task is to translate the provided PHP code into ${targetLanguage}.
    Your response must be clean, idiomatic, and adhere to the best practices of ${targetLanguage}.
    
    - Do not include any explanations, introductory phrases, or markdown formatting beyond the code block itself.
    - Provide ONLY the raw code for the target language inside a single code block.
    - If the PHP code contains concepts that don't directly translate, use the closest equivalent in the target language.

    Here is the PHP code to convert:
    \`\`\`php
    ${phpCode}
    \`\`\`
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to convert code: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while communicating with the AI service.");
  }
}
