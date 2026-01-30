import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    const body = await req.json();
    const { name, age, weight, goals, duration, injuries } = body;

    const genAI = new GoogleGenerativeAI(apiKey);

    // --- ULTIMATE MODEL LIST ---
    // The code will try these in order. 
    // "gemini-pro" is the safety net that usually works for everyone.
    const modelNames = [
      "gemini-2.0-flash-exp",        // Experimental (often free)
      "gemini-1.5-flash",            // Standard Fast
      "gemini-1.5-flash-latest",     // Latest alias
      "gemini-1.5-pro",              // Standard Pro
      "gemini-pro",                  // Legacy Stable (MOST RELIABLE)
      "gemini-1.0-pro"               // Oldest Backup
    ];
    
    let result: any = null;
    let success = false;
    let lastError;

    const prompt = `
      You are an expert Yoga Instructor. Create a valid JSON 1-day plan for:
      - Name: ${name || "Yogi"}
      - Profile: ${age || 25} yrs, ${weight || 70}kg
      - Goals: ${goals?.join(", ") || "General Fitness"}
      - Duration: ${duration || 30} mins
      - Injuries: ${injuries || "None"}

      Return ONLY strictly valid JSON (NO markdown, NO backticks).
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

    // 1. Try models one by one
    for (const modelName of modelNames) {
      try {
        console.log(`🤖 Attempting model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        success = true;
        console.log(`✅ Success with model: ${modelName}`);
        break; // It worked! Exit loop.
      } catch (e: any) {
        console.warn(`⚠️ Model ${modelName} failed: ${e.message.substring(0, 100)}...`);
        lastError = e;
      }
    }

    // 2. Safety Check
    if (!success || !result) {
      throw lastError || new Error("All AI models failed to respond.");
    }

    // 3. Process Response
    const response = await result.response;
    let text = response.text();

    // Clean JSON (Remove ```json and ```)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extra Safety: Find the first '{' and last '}'
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        text = text.substring(start, end + 1);
    }

    const plan = JSON.parse(text);
    return NextResponse.json(plan);

  } catch (error: any) {
    console.error('❌ FINAL AI FAILURE:', error.message);
    
    // FALLBACK DATA (Prevents Crash)
    return NextResponse.json({
      summary: "The AI is currently unavailable, but here is a balanced routine.",
      routine: [
        { name: "Mountain Pose", sanskrit: "Tadasana", duration: "2 mins", type: "Warm Up", benefit: "Improves posture.", instruction: "Stand tall." },
        { name: "Cat-Cow", sanskrit: "Marjaryasana", duration: "3 mins", type: "Flow", benefit: "Spine health.", instruction: "Inhale arch, exhale round." }
      ],
      diet: [
        { time: "Tip", item: "Hydration", reason: "Drink water." }
      ],
      mindfulness: "Take 10 deep breaths."
    }); 
  }
}