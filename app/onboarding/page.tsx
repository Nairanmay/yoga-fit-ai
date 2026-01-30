'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';

export default function Onboarding() {
  const router = useRouter();
  const { profile, setProfile } = useUserStore();
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else router.push('/plan');
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
        <div className="mb-6 h-2 bg-stone-200 rounded-full">
          <div 
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-teal-900">Tell us about you</h2>
            <input 
              placeholder="Name" 
              className="w-full p-4 border rounded-lg bg-stone-50"
              onChange={(e) => setProfile({ name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Height (cm)" className="p-4 border rounded-lg bg-stone-50" onChange={(e) => setProfile({ height: e.target.value })}/>
              <input type="number" placeholder="Weight (kg)" className="p-4 border rounded-lg bg-stone-50" onChange={(e) => setProfile({ weight: e.target.value })}/>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-teal-900">What's your goal?</h2>
            {['Weight Loss', 'Flexibility', 'Strength', 'Stress Relief'].map(goal => (
              <button
                key={goal}
                onClick={() => setProfile({ goals: [goal] })}
                className={`w-full p-4 rounded-lg text-left border ${profile.goals.includes(goal) ? 'bg-teal-100 border-teal-500' : 'bg-white border-gray-200'}`}
              >
                {goal}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-teal-900">Duration per session?</h2>
                <div className="flex gap-2">
                    {[10, 20, 30, 45].map(min => (
                        <button key={min} onClick={() => setProfile({ duration: min })} className={`flex-1 p-3 rounded-lg border ${profile.duration === min ? 'bg-teal-600 text-white' : 'bg-white'}`}>
                            {min}m
                        </button>
                    ))}
                </div>
            </div>
        )}

        <button 
          onClick={handleNext}
          className="w-full mt-8 bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 transition"
        >
          {step === 3 ? 'Generate My Plan' : 'Next'}
        </button>
      </div>
    </div>
  );
}