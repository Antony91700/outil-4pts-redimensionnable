import React from 'react';

interface ResizeHandleProps {
  position: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w';
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onMouseDown }) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'se':
        return 'bottom-0 right-0 cursor-se-resize w-4 h-4 rounded-full';
      case 'sw':
        return 'bottom-0 left-0 cursor-sw-resize w-4 h-4 rounded-full';
      case 'ne':
        return 'top-0 right-0 cursor-ne-resize w-4 h-4 rounded-full';
      case 'nw':
        return 'top-0 left-0 cursor-nw-resize w-4 h-4 rounded-full';
      case 'n':
        return 'top-0 left-1/2 -translate-x-1/2 cursor-ns-resize w-8 h-4 rounded-md';
      case 's':
        return 'bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize w-8 h-4 rounded-md';
      case 'e':
        return 'right-0 top-1/2 -translate-y-1/2 cursor-ew-resize w-4 h-8 rounded-md';
      case 'w':
        return 'left-0 top-1/2 -translate-y-1/2 cursor-ew-resize w-4 h-8 rounded-md';
      default:
        return '';
    }
  };

  return (
    <div
      className={`absolute bg-blue-500 opacity-50 hover:opacity-75 ${getPositionClasses()}`}
      onMouseDown={onMouseDown}
    />
  );
};