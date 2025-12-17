import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CircleButtonProps {
  onPress?: () => void;
  children: React.ReactNode; // This allows you to pass ANY icon (Feather, Material, etc.)
  style?: ViewStyle;
}

export const CircleButton = ({ onPress, children, style }: CircleButtonProps) => {
  
  const handlePress = () => {
    Haptics.selectionAsync(); // Built-in haptics for every button
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity 
      style={[styles.circleButton, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(26, 47, 90, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});