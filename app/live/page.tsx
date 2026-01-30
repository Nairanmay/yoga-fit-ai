'use client';
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { analyzeTreePose } from '@/lib/pose-utils';

export default function LiveSession() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [feedback, setFeedback] = useState("Loading AI Model...");
  const [isCorrect, setIsCorrect] = useState(false);

  // Load Model
  const runCoco = async () => {
    await tf.setBackend('webgl');
    await tf.ready();
    
    // Using MoveNet (Lightning) for high FPS on browser
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet, 
      { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );

    setInterval(() => {
      detect(detector);
    }, 100); // Check every 100ms
  };

  const detect = async (detector: poseDetection.PoseDetector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video?.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // Set canvas dimensions
      if (canvasRef.current) {
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      }

      // 1. Detect Poses
      const poses = await detector.estimatePoses(video);

      if (poses.length > 0) {
        // 2. Analyze Pose (Example: Tree Pose Logic)
        const analysis = analyzeTreePose(poses[0].keypoints);
        setFeedback(analysis.feedback);
        setIsCorrect(analysis.correct);

        // 3. Draw Skeleton
        drawCanvas(poses[0], videoWidth, videoHeight);
      }
    }
  };

  const drawCanvas = (pose: poseDetection.Pose, width: number, height: number) => {
    const ctx = canvasRef.current?.getContext("2d");
    if(ctx) {
        ctx.clearRect(0, 0, width, height);
        // Draw Keypoints
        pose.keypoints.forEach((keypoint) => {
            if (keypoint.score && keypoint.score > 0.3) {
                ctx.beginPath();
                ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = isCorrect ? "#10b981" : "#ef4444"; // Green or Red
                ctx.fill();
            }
        });
        // (Add line drawing logic here for full skeleton)
    }
  };

  useEffect(() => {
    runCoco();
  }, []);

  return (
    <div className="relative min-h-screen bg-black flex flex-col items-center">
      <div className="absolute top-4 z-20 bg-black/50 px-6 py-3 rounded-full backdrop-blur-md">
        <h2 className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {feedback}
        </h2>
      </div>

      <Webcam
        ref={webcamRef}
        className="absolute mx-auto left-0 right-0 top-20 text-center z-10 w-full lg:w-160 rounded-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute mx-auto left-0 right-0 top-20 text-center z-10 w-full lg:w-160"
      />
      
      <div className="absolute bottom-10 z-20">
         <div className="bg-white/10 p-4 rounded-lg text-white text-sm backdrop-blur">
             <p>Safety: Ensure good lighting. Stop if you feel pain.</p>
         </div>
      </div>
    </div>
  );
}