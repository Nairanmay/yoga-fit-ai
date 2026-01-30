'use client'; 
export const dynamic = 'force-dynamic';

import { useUserStore } from '@/lib/store';
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

// Fallback Plan (Shows if AI fails or times out)
const FALLBACK_PLAN = {
  summary: "We couldn't reach the AI guru, but here is a balanced routine for you.",
  routine: [
    { name: "Mountain Pose", sanskrit: "Tadasana", duration: "2 mins", type: "Warm Up", benefit: "Improves posture and stability.", instruction: "Stand tall, feet together, shoulders rolled back." },
    { name: "Downward Dog", sanskrit: "Adho Mukha Svanasana", duration: "3 mins", type: "Flow", benefit: "Stretches hamstrings and strengthens arms.", instruction: "Press hands into mat, lift hips high." },
    { name: "Child's Pose", sanskrit: "Balasana", duration: "5 mins", type: "Cool Down", benefit: "Relieves stress and fatigue.", instruction: "Sit back on heels, forehead to mat." }
  ],
  diet: [
    { time: "Hydration", item: "Warm Lemon Water", reason: "Aids digestion and hydration." },
    { time: "Post-Yoga", item: "Banana or Nuts", reason: "Quick energy replenishment." }
  ],
  mindfulness: "Take 5 deep breaths, counting to 4 on inhale and 6 on exhale."
};

export default function PlanPage() {
  const { data: session } = useSession();
  const { profile } = useUserStore();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Prevent fetching if no goals set (likely direct navigation without onboarding)
    if (!profile.goals) {
        setLoading(false);
        return;
    }

    const fetchAIPlan = async () => {
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // --- FIX IS HERE: Spread first, then overwrite/default ---
            ...profile,
            name: profile.name || session?.user?.name || "Yogi", 
          }),
        });
        
        if (!res.ok) throw new Error("Failed to fetch plan");
        
        const data = await res.json();
        setPlan(data);
      } catch (err) {
        console.error("Plan Fetch Error:", err);
        setError("AI Service Unavailable. Showing Default Plan.");
        setPlan(FALLBACK_PLAN); // <--- Load Backup Plan
      } finally {
        setLoading(false);
      }
    };

    fetchAIPlan();
  }, [profile, session]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
      <p className="text-teal-800 font-medium animate-pulse">Curating your wellness path...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-end border-b pb-6 border-stone-200">
        <div>
          <h1 className="text-4xl font-bold text-teal-900">
            Namaste, {session?.user?.name?.split(' ')[0] || "Yogi"}
          </h1>
          <p className="text-stone-600 mt-2 text-lg">
            {plan?.summary || `Your personalized ${profile.goals?.[0] || 'Wellness'} plan`}
          </p>
          {error && <p className="text-amber-600 text-sm mt-1 bg-amber-50 inline-block px-2 py-1 rounded border border-amber-200">⚠️ {error}</p>}
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-stone-500 hover:text-red-500 transition">
          Sign Out
        </button>
      </header>

      {plan && (
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Yoga Routine */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
              🧘 Daily Flow
            </h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              {plan.routine?.map((pose: any, i: number) => (
                <div key={i} className="p-6 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-800">{pose.name}</h3>
                      <p className="text-sm text-stone-500 italic">{pose.sanskrit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${pose.type?.includes('Warm') ? 'bg-orange-100 text-orange-700' : 
                        pose.type?.includes('Cool') ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                      {pose.duration}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm mb-2">{pose.instruction}</p>
                  <p className="text-xs text-teal-600 font-medium">✨ Benefit: {pose.benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Diet & Mindfulness */}
          <div className="space-y-6">
            {/* Diet Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
               🥗 Sattvic Diet
              </h2>
              <ul className="space-y-6">
                {plan.diet?.map((item: any, i: number) => (
                  <li key={i} className="relative pl-6 border-l-2 border-stone-200">
                    <div className="absolute -left-1.25 top-0 w-2 h-2 rounded-full bg-teal-400"></div>
                    <span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{item.time}</span>
                    <p className="font-medium text-stone-800">{item.item}</p>
                    <p className="text-xs text-stone-500 mt-1">{item.reason}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Mindfulness Card */}
            <div className="bg-teal-900 p-6 rounded-3xl shadow-lg text-white">
              <h2 className="text-lg font-bold mb-2 text-teal-200">✨ Mindfulness Tip</h2>
              <p className="text-teal-50 leading-relaxed italic">
                "{plan.mindfulness}"
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}