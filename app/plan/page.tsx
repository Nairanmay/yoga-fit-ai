'use client'; 
export const dynamic = 'force-dynamic';

import { useUserStore } from '@/lib/store';
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// --- ICONS (Inline for instant professional look) ---
const Icons = {
  Clock: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Fire: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>,
  Leaf: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Moon: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Droplet: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
};

// Fallback Data
const FALLBACK_PLAN = {
  summary: "Welcome to your sanctuary. We've curated a balanced flow to help you find your center today.",
  routine: [
    { name: "Mountain Pose", sanskrit: "Tadasana", duration: "2 min", type: "Warm Up", benefit: "Grounding & Stability", instruction: "Stand tall, feet together, engage quads, palms forward." },
    { name: "Cat-Cow Flow", sanskrit: "Marjaryasana-Bitilasana", duration: "3 min", type: "Flow", benefit: "Spinal Flexibility", instruction: "Inhale arch back (Cow), exhale round spine (Cat)." },
    { name: "Downward Dog", sanskrit: "Adho Mukha Svanasana", duration: "3 min", type: "Strength", benefit: "Full Body Stretch", instruction: "Hips high, heels down, press through hands." },
    { name: "Child's Pose", sanskrit: "Balasana", duration: "5 min", type: "Cool Down", benefit: "Restoration", instruction: "Knees wide, forehead to mat, arms extended forward." }
  ],
  diet: [
    { time: "Pre-Session", item: "Warm Lemon Water", reason: "Awakens digestion and hydrates." },
    { time: "Post-Session", item: "Handful of Almonds", reason: "Quick protein for muscle repair." }
  ],
  mindfulness: "Inhale for 4 counts, hold for 4, exhale for 6. Focus only on the sound of your breath."
};

export default function PlanPage() {
  const { data: session } = useSession();
  const { profile } = useUserStore();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
            ...profile,
            name: profile.name || session?.user?.name || "Yogi", 
          }),
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setPlan(data);
      } catch (err) {
        console.error(err);
        setPlan(FALLBACK_PLAN);
        setError("AI busy. Loaded premium fallback plan.");
      } finally {
        setLoading(false);
      }
    };
    fetchAIPlan();
  }, [profile, session]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F4] relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-tr from-teal-50 to-orange-50 opacity-50" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full z-10"
      />
      <motion.p 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        className="mt-6 text-teal-800 font-medium tracking-wide z-10"
      >
        Designing your sanctuary...
      </motion.p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 font-sans relative overflow-hidden">
      {/* --- Ambient Background Gradients --- */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-teal-200/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-150 h-150orange-100/30 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        
        {/* --- HEADER --- */}
        <header className="flex justify-between items-start mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-teal-600 font-bold tracking-widest text-xs uppercase mb-2 block">Your Personalized Journey</span>
            <h1 className="text-4xl md:text-5xl font-light text-slate-900 tracking-tight">
              Namaste, <span className="font-semibold text-teal-800">{session?.user?.name?.split(' ')[0] || "Yogi"}</span>
            </h1>
          </motion.div>
          
          <button onClick={() => signOut({ callbackUrl: '/' })} className="px-6 py-2 rounded-full border border-slate-200 text-slate-500 text-sm hover:bg-white hover:text-red-500 hover:shadow-md transition-all duration-300">
            Sign Out
          </button>
        </header>

        {/* --- SUMMARY CARD --- */}
        {plan && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-8 rounded-4xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm"
          >
            <div className="flex items-start gap-4">
               <div className="p-3 bg-teal-100/50 rounded-full text-teal-700"><Icons.Leaf /></div>
               <div>
                  <h3 className="text-lg font-semibold text-teal-900 mb-1">Today's Intention</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">{plan.summary}</p>
               </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT: TIMELINE ROUTINE (Bento Grid Style) --- */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                <Icons.Clock /> Daily Flow
              </h2>
              <span className="text-sm font-medium text-slate-400">{plan?.routine?.length} Asanas</span>
            </div>

            <div className="relative space-y-4">
              {/* Timeline Line */}
              <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-slate-100 -z-10" />

              {plan?.routine?.map((pose: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative flex items-start gap-4"
                >
                  {/* Timeline Node */}
                  <div className={`
                    w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-sm font-bold shadow-sm border border-white
                    ${pose.type?.includes('Warm') ? 'bg-orange-50 text-orange-600' : 
                      pose.type?.includes('Cool') ? 'bg-blue-50 text-blue-600' : 'bg-teal-50 text-teal-600'}
                  `}>
                    {i + 1}
                  </div>

                  {/* Glass Card */}
                  <div className="flex-1 p-5 rounded-3xl bg-white/70 backdrop-blur-md border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/90 cursor-default">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{pose.name}</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{pose.sanskrit}</p>
                      </div>
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600">
                        {pose.duration}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 text-sm mb-3 leading-relaxed">{pose.instruction}</p>
                    
                    <div className="items-center gap-2 text-xs font-medium text-teal-600 bg-teal-50/50 inline-flex px-3 py-1.5 rounded-lg">
                      <Icons.Fire /> 
                      {pose.benefit}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: WIDGETS --- */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mindfulness Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="p-8 rounded-[2.5rem] bg-teal-900 text-white shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-teal-200 mb-4 text-sm font-bold uppercase tracking-wider">
                  <Icons.Moon /> Mindfulness
                </div>
                <p className="text-xl md:text-2xl font-light leading-snug italic opacity-90">
                  "{plan?.mindfulness}"
                </p>
              </div>
            </motion.div>

            {/* Diet Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm"
            >
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Icons.Droplet /> Nutrition Fuel
               </h3>
               <div className="space-y-6">
                 {plan?.diet?.map((item: any, i: number) => (
                   <div key={i} className="flex gap-4">
                     <div className="flex flex-col items-center">
                       <div className="w-2 h-2 bg-teal-400 rounded-full" />
                       <div className="w-px h-full bg-slate-100 mt-2" />
                     </div>
                     <div className="pb-2">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.time}</span>
                       <p className="font-semibold text-slate-800 mt-1">{item.item}</p>
                       <p className="text-sm text-slate-500 mt-1">{item.reason}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </motion.div>

            {/* Start Session Button */}
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-5 rounded-2xl bg-linear-to-r from-teal-600 to-teal-500 text-white font-bold text-lg shadow-lg shadow-teal-200/50 hover:shadow-xl transition-all"
            >
              Start Guided Session →
            </motion.button>
            
          </div>
        </div>
      </div>
    </div>
  );
}