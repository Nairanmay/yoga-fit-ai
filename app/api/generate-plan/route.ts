import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Error: Missing GEMINI_API_KEY in Environment Variables");
      throw new Error('Missing API Key');
    }

    const body = await req.json();
    const { name, age, weight, goals, duration, injuries } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use the standard stable model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Yoga Instructor. Create a JSON-only 1-day plan for:
      - Name: ${name || "Yogi"}
      - Profile: ${age || 25} yrs, ${weight || 70}kg
      - Goals: ${goals?.join(", ") || "General Fitness"}
      - Duration: ${duration || 30} mins
      - Injuries: ${injuries || "None"}

      Return strictly valid JSON. No markdown backticks. No intro text.
      Structure:
      {
        "summary": "Motivating sentence.",
        "routine": [
          { "name": "Pose Name", "sanskrit": "Sanskrit", "duration": "Time", "type": "Warm Up", "benefit": "Why", "instruction": "How" }
        ],
        "diet": [
          { "time": "Pre-Yoga", "item": "Food", "reason": "Why" }
        ],
        "mindfulness": "Tip"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("🤖 AI Raw Response:", text.substring(0, 100) + "..."); // Log first 100 chars for debug

    // --- ROBUST JSON CLEANING ---
    // Sometimes AI adds "```json ... ```" or "Here is the plan: { ... }"
    // We find the first "{" and the last "}" to extract just the JSON object.
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1);
    }

    const plan = JSON.parse(text);
    return NextResponse.json(plan);

  } catch (error: any) {
    console.error('⚠️ AI Plan Generation Failed:', error.message || error);
    
    // Fallback Data (So the user sees SOMETHING instead of a crash)
    return NextResponse.json({
      summary: "The AI is meditating right now. Here is a classic wellness routine for you.",
      routine: [
        { name: "Mountain Pose", sanskrit: "Tadasana", duration: "2 mins", type: "Warm Up", benefit: "Improves posture.", instruction: "Stand tall, feet together." },
        { name: "Cat-Cow", sanskrit: "Marjaryasana-Bitilasana", duration: "3 mins", type: "Flow", benefit: "Spine flexibility.", instruction: "Inhale arch, exhale round." },
        { name: "Child's Pose", sanskrit: "Balasana", duration: "5 mins", type: "Cool Down", benefit: "Rest and reset.", instruction: "Hips to heels, forehead down." }
      ],
      diet: [
        { time: "Tip", item: "Hydration", reason: "Drink water before and after session." }
      ],
      mindfulness: "Close your eyes and count 10 deep breaths."
    }); 
  }
}