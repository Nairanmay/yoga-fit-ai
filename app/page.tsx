import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8">
        <h1 className="text-5xl font-bold text-teal-800 tracking-tight">
          Yoga Fit AI
        </h1>
        <p className="text-xl text-stone-600">
          Smart guidance for every pose. Personalized plans, real-time corrections, and holistic wellness.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/onboarding" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all shadow-lg">
            Start Your Journey
          </Link>
          <Link href="/live" className="bg-white border-2 border-teal-600 text-teal-700 hover:bg-teal-50 px-8 py-4 rounded-full text-lg font-medium transition-all">
            Try Live AI Cam
          </Link>
        </div>
      </div>
    </main>
  );
}