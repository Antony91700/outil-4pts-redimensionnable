import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Point } from '../../types/geometry';
import { calculateAngle, calculateLengthDifferencePercentage } from '../../utils/geometryCalculations';
import { ResizeHandle } from './ResizeHandle';

interface ImageCanvasProps {
  imageUrl: string | null;
  isPlacingPoints: boolean;
  onPointPlaced: (point: Point) => void;
  points: Point[];
}

export const ImageCanvas: React.FC<ImageCanvasProps> = ({
  imageUrl,
  isPlacingPoints,
  onPointPlaced,
  points,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w'>('se');
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [startResizeSize, setStartResizeSize] = useState({ width: 800, height: 600 });
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      setImage(img);
      setScale(1);
      setOffset({ x: 0, y: 0 });
      
      const canvas = canvasRef.current;
      if (canvas) {
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;
        setImagePosition({ x, y });
      }
      
      drawCanvas();
    };
  }, [imageUrl]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the current context state
    ctx.save();
    
    // Apply transformations for panning and zooming
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw image
    const x = (canvas.width / scale - image.width) / 2;
    const y = (canvas.height / scale - image.height) / 2;
    ctx.drawImage(image, x, y);
    setImagePosition({ x, y });

    // Draw segments with proper scaling
    if (points.length >= 2) {
      // Draw AB segment in blue
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2 / scale;
      const startA = transformPoint(points[0], x, y);
      const endB = transformPoint(points[1], x, y);
      ctx.moveTo(startA.x, startA.y);
      ctx.lineTo(endB.x, endB.y);
      ctx.stroke();
    }

    if (points.length >= 4) {
      // Draw CD segment in red
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2 / scale;
      const startC = transformPoint(points[2], x, y);
      const endD = transformPoint(points[3], x, y);
      ctx.moveTo(startC.x, startC.y);
      ctx.lineTo(endD.x, endD.y);
      ctx.stroke();
    }

    // Draw points
    points.forEach((point) => {
      const transformedPoint = transformPoint(point, x, y);
      
      // Draw point
      ctx.beginPath();
      ctx.fillStyle = 'red';
      ctx.arc(transformedPoint.x, transformedPoint.y, 5 / scale, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = 'black';
      ctx.font = `${14 / scale}px Arial`;
      ctx.fillText(
        point.label,
        transformedPoint.x + 8 / scale,
        transformedPoint.y - 8 / scale
      );
    });

    // Draw crosshair if placing points
    if (isPlacingPoints && mousePos) {
      ctx.beginPath();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 1 / scale;
      
      // Vertical line
      ctx.moveTo(mousePos.x, mousePos.y - 10 / scale);
      ctx.lineTo(mousePos.x, mousePos.y + 10 / scale);
      
      // Horizontal line
      ctx.moveTo(mousePos.x - 10 / scale, mousePos.y);
      ctx.lineTo(mousePos.x + 10 / scale, mousePos.y);
      
      ctx.stroke();
    }

    ctx.restore();
  };

  const transformPoint = (point: Point, imageX: number, imageY: number) => {
    return {
      x: imageX + point.x,
      y: imageY + point.y,
    };
  };

  const untransformPoint = (x: number, y: number, imageX: number, imageY: number) => {
    return {
      x: x - imageX,
      y: y - imageY,
    };
  };

  useEffect(() => {
    drawCanvas();
  }, [scale, offset, image, points, mousePos, canvasSize]);

  const getCanvasCoordinates = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;
    
    // Get coordinates relative to the image
    const imageX = (canvas.width / scale - image.width) / 2;
    const imageY = (canvas.height / scale - image.height) / 2;
    
    const point = untransformPoint(mouseX, mouseY, imageX, imageY);
    return point;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPlacingPoints) {
      const coords = getCanvasCoordinates(e);
      onPointPlaced(coords);
    } else {
      setIsPanning(true);
      setStartPanPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && !isPlacingPoints) {
      setOffset({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y,
      });
    }

    if (isResizing) {
      const deltaX = e.clientX - startResizePos.x;
      const deltaY = e.clientY - startResizePos.y;

      let newWidth = startResizeSize.width;
      let newHeight = startResizeSize.height;

      switch (resizeDirection) {
        case 'e':
          newWidth = Math.max(400, startResizeSize.width + deltaX);
          break;
        case 'w':
          newWidth = Math.max(400, startResizeSize.width - deltaX);
          break;
        case 'n':
          newHeight = Math.max(300, startResizeSize.height - deltaY);
          break;
        case 's':
          newHeight = Math.max(300, startResizeSize.height + deltaY);
          break;
        case 'se':
          newWidth = Math.max(400, startResizeSize.width + deltaX);
          newHeight = Math.max(300, startResizeSize.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(400, startResizeSize.width - deltaX);
          newHeight = Math.max(300, startResizeSize.height + deltaY);
          break;
        case 'ne':
          newWidth = Math.max(400, startResizeSize.width + deltaX);
          newHeight = Math.max(300, startResizeSize.height - deltaY);
          break;
        case 'nw':
          newWidth = Math.max(400, startResizeSize.width - deltaX);
          newHeight = Math.max(300, startResizeSize.height - deltaY);
          break;
      }

      setCanvasSize({ width: newWidth, height: newHeight });
    }
    
    if (isPlacingPoints) {
      setMousePos(getCanvasCoordinates(e));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsResizing(false);
  };

  const handleZoom = (factor: number) => {
    setScale((prevScale) => {
      const newScale = prevScale * factor;
      return Math.min(Math.max(0.1, newScale), 5);
    });
  };

  const handleResizeStart = (direction: typeof resizeDirection) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartResizePos({ x: e.clientX, y: e.clientY });
    setStartResizeSize(canvasSize);
  };

  return (
    <div 
      ref={containerRef}
      className="relative inline-block"
      style={{ width: canvasSize.width, height: canvasSize.height }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`border border-gray-300 rounded-lg ${
          isPlacingPoints ? 'cursor-crosshair' : 'cursor-move'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <ResizeHandle position="n" onMouseDown={handleResizeStart('n')} />
      <ResizeHandle position="s" onMouseDown={handleResizeStart('s')} />
      <ResizeHandle position="e" onMouseDown={handleResizeStart('e')} />
      <ResizeHandle position="w" onMouseDown={handleResizeStart('w')} />
      <ResizeHandle position="se" onMouseDown={handleResizeStart('se')} />
      <ResizeHandle position="sw" onMouseDown={handleResizeStart('sw')} />
      <ResizeHandle position="ne" onMouseDown={handleResizeStart('ne')} />
      <ResizeHandle position="nw" onMouseDown={handleResizeStart('nw')} />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => handleZoom(1.1)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(0.9)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};