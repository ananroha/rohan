import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface RaindropPinProps {
  color: string;
  size?: number;
}

export function RaindropPin({ color, size = 36 }: RaindropPinProps) {
  const w = size * 0.7;
  const h = size;
  // Raindrop: rounded top, tapers to a point at the bottom
  return (
    <Svg width={w} height={h} viewBox="0 0 28 40">
      <Path
        d="M14 2 C14 2, 2 14, 2 22 A12 12 0 0 0 26 22 C26 14, 14 2, 14 2 Z"
        fill={color}
        stroke="white"
        strokeWidth={1.5}
      />
    </Svg>
  );
}
