'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageCompareProps {
  image1: string;
  image2: string;
}

const ImageCompare: React.FC<ImageCompareProps> = ({ image1, image2 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const isDragging = useRef(false);

  const startDrag = () => (isDragging.current = true);
  const stopDrag = () => (isDragging.current = false);

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const clientX = (e as TouchEvent).touches
      ? (e as TouchEvent).touches[0].clientX
      : (e as MouseEvent).clientX;

    const rect = containerRef.current.getBoundingClientRect();
    let newPos = ((clientX - rect.left) / rect.width) * 100;

    if (newPos < 0) newPos = 0;
    if (newPos > 100) newPos = 100;
    setSliderPosition(newPos);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => onDrag(e);
    const handleMouseUp = () => stopDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-xl aspect-square overflow-hidden select-none mx-auto"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      {/* Image 1 (bottom) */}
      <div className="absolute inset-0">
        <Image
          src={image1}
          alt="Image 1"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* Image 2 (top with mask) */}
      <div 
        className={`absolute top-0 left-0 h-full overflow-hidden transition-all duration-75`}
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full">
          <Image
            src={image2}
            alt="Image 2"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Draggable Line */}
      <div
        className={`absolute top-0 h-full w-1 bg-white border border-black cursor-col-resize z-10 transition-all duration-75`}
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-2 border-black" />
      </div>
    </div>
  );
};

export default ImageCompare;
