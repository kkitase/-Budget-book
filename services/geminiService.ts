import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

const processReceiptImage = async (file: File): Promise<ReceiptData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: `Analyze this receipt image. Extract the store name, date (in YYYY-MM-DD format), and total amount. 
            If the year is missing, assume the current year is ${new Date().getFullYear()}.
            If the store name is unclear, use "Unknown Store".
            If the date is unclear, use today's date: ${new Date().toISOString().split('T')[0]}.
            Ensure the amount is a number.`
          }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: {
              type: Type.STRING,
              description: "The name of the store or merchant."
            },
            date: {
              type: Type.STRING,
              description: "The date of purchase in YYYY-MM-DD format."
            },
            amount: {
              type: Type.NUMBER,
              description: "The total amount of the purchase."
            }
          },
          required: ["storeName", "date", "amount"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text) as ReceiptData;
    return data;
  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    throw new Error("Failed to analyze receipt. Please try again or enter manually.");
  }
};

export const geminiService = {
  processReceiptImage
};