'use client'; 
export const dynamic = 'force-dynamic';

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';

export default function LiveSession() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // --- DEBUG STATE ---
  const [status, setStatus] = useState("Initializing...");
  const [logs, setLogs] = useState<string[]>([]);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Helper to print logs to screen
  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev.slice(-4), msg]); // Keep last 5 logs
  };

  useEffect(() => {
    let detector: any;
    let rafId: number;

    const loadAI = async () => {
      try {
        addLog("Step 1: Starting Import...");
        
        // 1. Load Libraries
        const tf = await import('@tensorflow/tfjs-core');
        await import('@tensorflow/tfjs-backend-webgl');
        const poseDetection = await import('@tensorflow-models/pose-detection');
        
        addLog("Step 2: TF Imported. Setting Backend...");

        // 2. Set Backend (Try WebGL, fallback to CPU if fails)
        try {
            await tf.setBackend('webgl');
            addLog("Backend set to WebGL");
        } catch (e) {
            addLog("WebGL failed, trying cpu...");
            await tf.setBackend('cpu');
        }
        
        await tf.ready();
        addLog("Step 3: TF Ready. Loading Model...");

        // 3. Load Model
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );

        addLog("Step 4: Model Loaded Successfully!");
        setModelLoaded(true);
        setStatus("Align your body in frame");
        detect(detector);

      } catch (err: any) {
        setStatus("CRITICAL ERROR");
        addLog(`Error: ${err.message}`);
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

        // Force canvas size to match video
        if (canvasRef.current) {
            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;
        }

        try {
            const poses = await net.estimatePoses(video);
            if (poses.length > 0 && canvasRef.current) {
                const ctx = canvasRef.current.getContext("2d");
                if (ctx) drawSkeleton(ctx, poses[0].keypoints);
            }
        } catch (e) {
            // Ignore frame errors
        }
      }
      rafId = requestAnimationFrame(() => detect(net));
    };

    const drawSkeleton = (ctx: any, keypoints: any[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        keypoints.forEach((kp: any) => {
            if(kp.score > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = "#00ff00"; // Green dots
                ctx.fill();
            }
        });
    };

    loadAI();

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (detector) detector.dispose();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center justify-center">
      
      {/* --- DEBUG OVERLAY (Visible on phone/web) --- */}
      <div className="absolute top-0 left-0 w-full bg-stone-900/80 text-green-400 font-mono text-xs p-2 z-50">
        <p className="font-bold text-white border-b border-white/20 pb-1 mb-1">Status: {status}</p>
        {logs.map((log, i) => (
            <div key={i}>{log}</div>
        ))}
      </div>

      {/* Camera View */}
      <div className="relative w-full max-w-lg aspect-3/4 lg:aspect-video rounded-2xl overflow-hidden border-2 border-stone-800 mt-12">
        <Webcam
            ref={webcamRef}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored
            // Ensure webcam works on mobile (facingMode: user)
            videoConstraints={{ facingMode: "user" }}
        />
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      
      {!modelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-40">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-white">Loading AI Brain...</p>
            </div>
        </div>
      )}
    </div>
  );
}