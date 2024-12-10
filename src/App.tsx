import React, { useState, useRef } from 'react';
import { ImageCanvas } from './components/Canvas/ImageCanvas';
import { ImageControls } from './components/Controls/ImageControls';
import { Point, MeasurementSettings } from './types/geometry';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isPlacingPoints, setIsPlacingPoints] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [measurementSettings, setMeasurementSettings] = useState<MeasurementSettings>({
    useCentimeters: false,
    referenceLength: 10 // 10 cm reference length for segment AB
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPoints([]);
  };

  const handleExport = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'mesure.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePointPlaced = (coords: { x: number; y: number }) => {
    if (points.length >= 4) return;

    const labels = ['A', 'B', 'C', 'D'];
    const newPoint: Point = {
      x: coords.x,
      y: coords.y,
      label: labels[points.length],
    };

    setPoints([...points, newPoint]);

    if (points.length === 3) {
      setIsPlacingPoints(false);
    }
  };

  const handleTogglePointPlacement = () => {
    if (isPlacingPoints) {
      setIsPlacingPoints(false);
    } else {
      setPoints([]);
      setIsPlacingPoints(true);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 transition-colors">
        <div className="container mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="col-span-1">
              <ImageCanvas
                imageUrl={imageUrl}
                isPlacingPoints={isPlacingPoints}
                onPointPlaced={handlePointPlaced}
                points={points}
              />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              <ImageControls
                onImageUpload={handleImageUpload}
                onExport={handleExport}
                isPlacingPoints={isPlacingPoints}
                onTogglePointPlacement={handleTogglePointPlacement}
                points={points}
                measurementSettings={measurementSettings}
                onMeasurementSettingsChange={setMeasurementSettings}
              />
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;