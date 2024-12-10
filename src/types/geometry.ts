export interface Point {
  x: number;
  y: number;
  label: string;
}

export interface Segment {
  start: Point;
  end: Point;
  color: string;
}

export interface MeasurementSettings {
  useCentimeters: boolean;
  referenceLength: number;
}