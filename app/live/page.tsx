'use client';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';

// We do NOT import TensorFlow here at the top level anymore.
// This prevents the Vercel build server from crashing.

export const dynamic = 'force-dynamic'; // Disable static snapshotting

export default function LiveSession() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState("Initializing AI...");
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load AI Models dynamically inside useEffect
  useEffect(() => {
    let detector: any;
    let rafId: number;

    const loadModels = async () => {
      try {
        // 1. Dynamic Imports (Only loads in browser)
        const tf = await import('@tensorflow/tfjs-core');
        await import('@tensorflow/tfjs-backend-webgl');
        const poseDetection = await import('@tensorflow-models/pose-detection');

        // 2. Setup Backend
        await tf.setBackend('webgl');
        await tf.ready();

        // 3. Create Detector
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        setIsLoading(false);
        setFeedback("Go to Full Body View");
        detect(detector);
      } catch (err) {
        console.error("AI Load Error:", err);
        setFeedback("Error loading AI. Refresh page.");
      }
    };

    const detect = async (net: any) => {
      if (
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        if (canvasRef.current) {
          canvasRef.current.width = videoWidth;
          canvasRef.current.height = videoHeight;
        }

        // Estimate poses
        const poses = await net.estimatePoses(video);

        // Draw and Analyze
        if (poses.length > 0) {
           // Simple visual feedback logic
           // (You can re-add the advanced angle math here if needed)
           if (canvasRef.current) {
             const ctx = canvasRef.current.getContext("2d");
             drawSkeleton(ctx, poses[0].keypoints);
           }
        }
      }
      // Loop
      rafId = requestAnimationFrame(() => detect(net));
    };

    // Helper to draw (Simplified for this file)
    const drawSkeleton = (ctx: any, keypoints: any[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        keypoints.forEach((kp: any) => {
            if(kp.score > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "#00ff00";
                ctx.fill();
            }
        });
    };

    loadModels();

    // Cleanup function
    return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (detector) detector.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute z-50 text-teal-400 text-xl font-bold animate-pulse">
          Loading AI Models...
        </div>
      )}

      <div className="absolute top-4 z-20 bg-black/50 px-6 py-3 rounded-full backdrop-blur-md border border-white/10">
        <h2 className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-white'}`}>
            {feedback}
        </h2>
      </div>

      <div className="relative w-full max-w-lg aspect-3/4 lg:aspect-video rounded-2xl overflow-hidden border-2 border-stone-800">
        <Webcam
            ref={webcamRef}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored
        />
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      <div className="absolute bottom-10 z-20">
         <div className="bg-white/10 p-4 rounded-lg text-white text-sm backdrop-blur">
             <p>Ensure good lighting. Stand 2-3 meters back.</p>
         </div>
      </div>
    </div>
  );
}