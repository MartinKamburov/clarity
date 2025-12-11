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
        d="M20,11.4 C21.2,11.6 22.1,12.7 22.1,14 C22.1,15.4 21,16.6 19.6,16.6 C19.4,16.6 19.2,16.6 19,16.5 L19,16.6 L17.5,16.6 L17.5,16.5 C17.5,17.9 16.4,19 15,19 C13.7,19 12.7,18.1 12.5,17 C12.3,18.1 11.3,19 10,19 C8.6,19 7.5,17.9 7.5,16.5 L7.5,16.6 L6,16.6 L6,16.5 C5.8,16.6 5.6,16.6 5.4,16.6 C4,16.6 2.9,15.4 2.9,14 C2.9,12.7 3.8,11.6 5,11.4 C5,11.3 5,11.1 5,11 C5,9.3 6.3,8 8,8 C8.6,8 9.2,8.2 9.7,8.6 C10.3,7 11.8,5.9 13.5,5.9 C15.2,5.9 16.7,7 17.3,8.6 C17.8,8.2 18.4,8 19,8 C20.7,8 22,9.3 22,11 C22,11.1 22,11.3 22,11.4 L20,11.4 Z"
        fill={color}
      />
    </Svg>
  );
};