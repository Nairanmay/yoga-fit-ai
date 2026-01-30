export const dynamic = 'force-dynamic';
'use client';
import { useUserStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

// Updated Interface to match new API data
interface YogaPlan {
  summary: string;
  routine: { 
    name: string; 
    sanskrit: string; 
    duration: string; 
    type: string; 
    benefit: string; 
    instruction: string; 
  }[];
  diet: { time: string; item: string; reason: string }[];
  mindfulness: string;
}

export default function PlanPage() {
  const { data: session } = useSession();
  const { profile } = useUserStore();
  const [plan, setPlan] = useState<YogaPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile.goals || plan) return; // Prevent double fetch

    const fetchAIPlan = async () => {
      try {
        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...profile,
            name: session?.user?.name || "Yogi"
          }),
        });
        const data = await res.json();
        setPlan(data);
      } catch (err) {
        console.error(err);
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
          <h1 className="text-4xl font-bold text-teal-900 tracking-tight">
            Namaste, {session?.user?.name?.split(' ')[0] || "Yogi"}
          </h1>
          <p className="text-stone-600 mt-2 text-lg">
            {plan?.summary || `Your personalized ${profile.goals?.[0]} plan`}
          </p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-stone-500 hover:text-red-500 transition">
          Sign Out
        </button>
      </header>

      {plan && (
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Yoga Routine */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-2 space-y-6"
          >
            <h2 className="text-2xl font-bold text-teal-800 flex items-center gap-2">
              🧘 Daily Flow
            </h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
              {plan.routine.map((pose, i) => (
                <div key={i} className="p-6 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-800">{pose.name}</h3>
                      <p className="text-sm text-stone-500 italic">{pose.sanskrit}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                      ${pose.type.includes('Warm') ? 'bg-orange-100 text-orange-700' : 
                        pose.type.includes('Cool') ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                      {pose.duration}
                    </span>
                  </div>
                  <p className="text-stone-600 text-sm mb-2">{pose.instruction}</p>
                  <p className="text-xs text-teal-600 font-medium">✨ Benefit: {pose.benefit}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Diet & Mindfulness */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Diet Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
              <h2 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
               🥗 Sattvic Diet
              </h2>
              <ul className="space-y-6">
                {plan.diet.map((item, i) => (
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
          </motion.div>

        </div>
      )}
    </div>
  );
}