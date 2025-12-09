import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomePage from './src/app';

export default function App() {
  return (
    <SafeAreaProvider>
      <HomePage />
      <StatusBar style="auto" />      
    </SafeAreaProvider>
  );
}

