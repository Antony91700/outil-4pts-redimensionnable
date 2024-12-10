import React from 'react';
import { Upload, Download, Target } from 'lucide-react';
import { Point, Segment, MeasurementSettings } from '../../types/geometry';
import { calculateAngle, calculateLengthDifferencePercentage, calculateDistance, calculateCentimeters } from '../../utils/geometryCalculations';
import { ThemeToggle } from './ThemeToggle';

interface ImageControlsProps {
  onImageUpload: (file: File) => void;
  onExport: () => void;
  isPlacingPoints: boolean;
  onTogglePointPlacement: () => void;
  points: Point[];
  measurementSettings: MeasurementSettings;
  onMeasurementSettingsChange: (settings: MeasurementSettings) => void;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  onImageUpload,
  onExport,
  isPlacingPoints,
  onTogglePointPlacement,
  points,
  measurementSettings,
  onMeasurementSettingsChange,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const getSegmentAnalysis = () => {
    if (points.length < 4) return null;

    const segmentAB: Segment = {
      start: points[0],
      end: points[1],
      color: 'blue'
    };

    const segmentCD: Segment = {
      start: points[2],
      end: points[3],
      color: 'red'
    };

    const angle = calculateAngle(segmentAB, segmentCD);
    const { percentage, isLonger } = calculateLengthDifferencePercentage(segmentAB, segmentCD);

    let measurementInfo = '';
    if (measurementSettings.useCentimeters) {
      const abLength = calculateDistance(segmentAB.start, segmentAB.end);
      const cdLength = calculateDistance(segmentCD.start, segmentCD.end);
      const cdCentimeters = calculateCentimeters(cdLength, abLength, measurementSettings.referenceLength);
      measurementInfo = `\nLongueur du segment CD : ${cdCentimeters.toFixed(1)} cm`;
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Analyse des segments</h3>
        <p className="dark:text-gray-300">Angle entre les segments : {angle}°</p>
        <p className="dark:text-gray-300">
          Le segment rouge est {isLonger ? 'plus long' : 'plus court'} de {percentage}%
        </p>
        {measurementInfo && <p className="dark:text-gray-300">{measurementInfo}</p>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col gap-2">
        <label
          htmlFor="image-upload"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          <span>Charger une image</span>
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <button
        onClick={onTogglePointPlacement}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
          isPlacingPoints
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-purple-500 hover:bg-purple-600'
        } text-white`}
      >
        <Target className="w-5 h-5" />
        <span>{isPlacingPoints ? 'Annuler le placement' : 'Placer les points'}</span>
      </button>

      <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <input
          type="checkbox"
          id="measure-cm"
          checked={measurementSettings.useCentimeters}
          onChange={(e) => onMeasurementSettingsChange({
            ...measurementSettings,
            useCentimeters: e.target.checked
          })}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="measure-cm" className="text-sm dark:text-gray-300">
          Mesurer en cm (AB = 10 cm)
        </label>
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        <Download className="w-5 h-5" />
        <span>Exporter l'image</span>
      </button>

      {getSegmentAnalysis()}
    </div>
  );
};