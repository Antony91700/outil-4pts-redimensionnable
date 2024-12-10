import { Point, Segment } from '../types/geometry';

export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const calculateAngle = (segment1: Segment, segment2: Segment): number => {
  const dx1 = segment1.end.x - segment1.start.x;
  const dy1 = segment1.end.y - segment1.start.y;
  const dx2 = segment2.end.x - segment2.start.x;
  const dy2 = segment2.end.y - segment2.start.y;

  const angle1 = Math.atan2(dy1, dx1);
  const angle2 = Math.atan2(dy2, dx2);
  
  let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  
  return Math.round(angle);
};

export const calculateLengthDifferencePercentage = (
  segment1: Segment,
  segment2: Segment
): { percentage: number; isLonger: boolean } => {
  const length1 = calculateDistance(segment1.start, segment1.end);
  const length2 = calculateDistance(segment2.start, segment2.end);
  
  const percentage = Math.round((Math.abs(length1 - length2) / Math.max(length1, length2)) * 100);
  const isLonger = length2 > length1;
  
  return { percentage, isLonger };
};

export const calculateCentimeters = (
  pixelLength: number,
  referencePixelLength: number,
  referenceCentimeters: number
): number => {
  return (pixelLength * referenceCentimeters) / referencePixelLength;
};