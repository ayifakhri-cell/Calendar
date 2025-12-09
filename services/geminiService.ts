import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from "../types";
import { format } from "date-fns";

// Check if API key is present
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateThemeBanner = async (date: Date, events: CalendarEvent[]): Promise<string | null> => {
  if (!ai) {
    console.warn("No API Key found for Gemini Service");
    return null;
  }

  const monthName = format(date, "MMMM");
  const eventSummaries = events.slice(0, 5).map(e => e.title).join(", ");
  
  const prompt = `A panoramic, artistic painting header image representing the month of ${monthName}. 
  The style should be a mix of watercolor and digital art, soft, inviting, and highly detailed.
  ${eventSummaries ? `incorporate subtle visual elements related to: ${eventSummaries}` : 'Focus on seasonal elements appropriate for this month.'}
  High quality, wide aspect ratio, suitable for a calendar banner.`;

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9', 
      },
    });

    const base64EncodeString = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64EncodeString) {
      return `data:image/jpeg;base64,${base64EncodeString}`;
    }
    return null;
  } catch (error) {
    console.error("Error generating theme:", error);
    return null; // Fallback will be handled by UI
  }
};

export const interpretHandwriting = async (base64Image: string, currentDate: Date): Promise<CalendarEvent[]> => {
  if (!ai) return [];

  try {
    // Strip header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: `Extract calendar events from this handwritten note. The context month is ${format(currentDate, "MMMM yyyy")}.
            If a specific day number is written (e.g., "Lunch on the 12th"), assume it is for the current context month.
            If only a day name is given (e.g., "Meeting on Friday"), find the next occurrence of that day in the context month.
            Return a JSON array of events.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              day: { type: Type.INTEGER, description: "The day of the month (1-31)" },
              type: { type: Type.STRING, enum: ["work", "personal", "other"] }
            },
            required: ["title", "day", "type"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const rawEvents = JSON.parse(jsonText);
    
    // Convert raw day numbers to actual Date objects
    const parsedEvents: CalendarEvent[] = rawEvents.map((e: any) => {
      const eventDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), e.day);
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: e.title,
        date: eventDate,
        type: e.type || 'other'
      };
    });

    return parsedEvents;

  } catch (error) {
    console.error("Error interpreting handwriting:", error);
    throw error;
  }
};