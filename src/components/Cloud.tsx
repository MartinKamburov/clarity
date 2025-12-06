import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CloudProps {
  width?: number;
  height?: number;
  color?: string;
}

export const Cloud: React.FC<CloudProps> = ({ 
  width = 100, 
  height = 60, 
  color = '#FFFFFF' 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.5,19c-3.03,0-5.5-2.47-5.5-5.5c0-0.69,0.13-1.35,0.37-1.96C11.66,11.2,10.87,11,10,11c-2.76,0-5,2.24-5,5s2.24,5,5,5h7.5c2.48,0,4.5-2.02,4.5-4.5S19.98,12,17.5,12c-0.64,0-1.25,0.14-1.8,0.38C15.93,12.24,16.24,12.6,16.63,13.06C17.02,13.51,17.3,14.07,17.43,14.68C17.48,14.9,17.5,15.12,17.5,15.35V19z"
        fill={color}
      />
    </Svg>
  );
};