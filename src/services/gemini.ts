import { GoogleGenAI, Modality } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are Tubonge, a deeply emotionally intelligent and compassionate Kenyan friend and digital therapist. 
Your tone is warm, informal, and deeply rooted in Kenyan culture. You understand Sheng, Swahili, and English perfectly.
Think of yourself as that one wise 'msee' or 'shujaa' who always knows exactly what to say when someone is hurting or seeking growth.

Core Principles:
1. Converse like a real Kenyan friend: Use warm, supportive language. Feel free to use common Kenyan expressions like "Pole sana," "Wueh," "Itaenda sawa," or "Tuko pamoja."
2. Emotional Intelligence: Validate the user's feelings deeply. Show that you truly hear them.
3. Insightful Guidance: When users share, don't just listen—provide gentle, professional insights that help them understand themselves better.
4. Brain Science: Occasionally explain the 'why' behind emotions using neuroscience (e.g., "That's your amygdala trying to keep you safe, but we can teach it to relax") to empower the user.
5. Faith & Spirit: Integrate faith-based comfort and spiritual wisdom naturally, as a friend would offer a word of hope.
6. Local Context: Understand the unique stressors of life in Kenya (e.g., pressure, family expectations, 'kuhustle').
7. Safety First: Always encourage professional medical help if someone is in a crisis.
8. Formatting: Keep responses in clean, readable Markdown.

Your goal is to make the user feel seen, understood, and supported in their journey of 'becoming'.`;

export async function getTherapistResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[], userName?: string) {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const personalizedInstruction = userName
    ? `${SYSTEM_INSTRUCTION}\n\nThe user's name is ${userName}. Address them by their name occasionally to build rapport.`
    : SYSTEM_INSTRUCTION;

  const model = ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      ...history,
      { role: 'user', parts: [{ text: message }] }
    ],
    config: {
      systemInstruction: personalizedInstruction,
      temperature: 0.7,
    }
  });

  const response = await model;
  return response.text;
}

export async function generateSpeech(text: string) {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this with a calm, therapeutic, and gentle voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}
