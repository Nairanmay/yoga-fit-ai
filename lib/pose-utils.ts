import * as poseDetection from '@tensorflow-models/pose-detection';

export const POINTS = {
  NOSE: 0,
  LEFT_SHOULDER: 5, RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,    RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,    RIGHT_WRIST: 10,
  LEFT_HIP: 11,     RIGHT_HIP: 12,
  LEFT_KNEE: 13,    RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,   RIGHT_ANKLE: 16,
};

// Calculate angle between three points (A, B, C)
export function calculateAngle(
  a: poseDetection.Keypoint,
  b: poseDetection.Keypoint,
  c: poseDetection.Keypoint
) {
  if (!a || !b || !c) return 0;
  
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

// Simple heuristic for "Tree Pose" (Vrikshasana)
export function analyzeTreePose(keypoints: poseDetection.Keypoint[]) {
  const issues = [];
  const rHip = keypoints[POINTS.RIGHT_HIP];
  const rKnee = keypoints[POINTS.RIGHT_KNEE];
  const rAnkle = keypoints[POINTS.RIGHT_ANKLE];

  // Check if standing leg is straight
  const kneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  
  if (kneeAngle < 160) {
    issues.push("Straighten your standing leg.");
  }

  // Check arm balance (Are wrists above shoulders?)
  const lWrist = keypoints[POINTS.LEFT_WRIST];
  const lShoulder = keypoints[POINTS.LEFT_SHOULDER];
  
  if (lWrist.y > lShoulder.y) {
    issues.push("Raise your arms higher above your head.");
  }

  return issues.length === 0 
    ? { correct: true, feedback: "Great form! Hold steady." } 
    : { correct: false, feedback: issues.join(" ") };
}