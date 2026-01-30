import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  let name, age, weight, goals, duration, injuries;

  try {
    const body = await req.json();
    name = body.name;
    age = body.age;
    weight = body.weight;
    goals = body.goals;
    duration = body.duration;
    injuries = body.injuries;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert Yoga Instructor (Iyengar style) and Nutritionist. 
      Create a highly personalized 1-day plan for:
      - Name: ${name}
      - Profile: ${age} years old, ${weight}kg
      - Main Goals: ${goals.join(", ")}
      - Session Duration: ${duration} minutes
      - Physical Issues: ${injuries || "None"}

      Return strictly valid JSON (no markdown) with this structure:
      {
        "summary": "A 1-sentence motivating personalized summary for ${name}.",
        "routine": [
          { 
            "name": "Pose Name (English)", 
            "sanskrit": "Sanskrit Name",
            "duration": "Time (e.g., 2 mins)", 
            "type": "Warm Up | Flow | Strength | Cool Down",
            "benefit": "Specific benefit related to ${goals[0]}",
            "instruction": "Brief 1-sentence cue on how to do it correctly."
          }
        ],
        "diet": [
          { 
            "time": "Pre-Yoga", 
            "item": "Specific food item", 
            "reason": "Why this helps energy/recovery." 
          },
          { "time": "Post-Yoga", "item": "Meal suggestion", "reason": "Recovery benefit." },
          { "time": "Lunch", "item": "Healthy Indian/Global meal", "reason": "Sustained energy." }
        ],
        "mindfulness": "A short breathing or meditation tip."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const plan = JSON.parse(text);
    
    return NextResponse.json(plan);

  } catch (error: any) {
    console.error('⚠️ AI Gen Failed:', error.message);
    
    // Fallback Data
    return NextResponse.json({
      summary: "We couldn't reach the AI guru, but here is a balanced routine for you.",
      routine: [
        { name: "Mountain Pose", sanskrit: "Tadasana", duration: "2 mins", type: "Warm Up", benefit: "Improves posture and stability.", instruction: "Stand tall, feet together, shoulders rolled back." },
        { name: "Downward Dog", sanskrit: "Adho Mukha Svanasana", duration: "3 mins", type: "Flow", benefit: "Stretches hamstrings and strengthens arms.", instruction: "Press hands into mat, lift hips high." },
        { name: "Child's Pose", sanskrit: "Balasana", duration: "5 mins", type: "Cool Down", benefit: "Relieves stress and fatigue.", instruction: "Sit back on heels, forehead to mat." }
      ],
      diet: [
        { time: "Hydration", item: "Warm Lemon Water", "reason": "Aids digestion and hydration." }
      ],
      mindfulness: "Take 5 deep breaths, counting to 4 on inhale and 6 on exhale."
    }); 
  }
}