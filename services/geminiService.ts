import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, DietaryFilter } from '../types';

const MODEL_NAME = 'gemini-3-pro-preview';

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeFridgeAndGetRecipes = async (
  base64Image: string,
  mimeType: string,
  filters: DietaryFilter[]
): Promise<Recipe[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = `Analyze the provided image of a fridge/pantry. Identify the visible ingredients. 
    Based on these ingredients, suggest 5 creative and delicious recipes that can be made primarily with these items.
    
    If the recipe requires common pantry staples (oil, salt, pepper, basic spices) or items not clearly visible, list them as 'ingredientsMissing'.
    Items clearly visible or confidently inferred from the image context should be 'ingredientsAvailable'.
    
    Strictly adhere to the following dietary restrictions if any are listed: ${filters.join(', ')}.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
              prepTimeMinutes: { type: Type.INTEGER },
              calories: { type: Type.INTEGER },
              dietaryTags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              ingredientsAvailable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  }
                }
              },
              ingredientsMissing: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  }
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    instruction: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      // Clean up markdown code blocks if the model includes them
      const cleanText = response.text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      const data = JSON.parse(cleanText);
      
      // Assign local IDs for React keys
      return data.map((recipe: any, index: number) => ({
        ...recipe,
        id: `recipe-${Date.now()}-${index}`
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
