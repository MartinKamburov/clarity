import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function GetUserName() {
  const [users_name, onChangeText] = React.useState('');
  const translateY = useSharedValue(0);
  
  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(0, { // Move UP by 15 pixels
        duration: 3000, // Takes 2.5 seconds (slow and floaty)
        easing: Easing.inOut(Easing.quad), // Smooth start/stop
      }),
      -1, // Infinite repeat
      true // Reverse (go back down)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));


  const handleNextPage = () => {
    if (users_name.trim() === '') {
      return; 
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    router.push({
        pathname: "/screen3",
        params: { name: users_name.trim() } 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView ensures the keyboard doesn't cover 
         your beautiful form when typing 
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentWrapper}
      >
        
        {/* 1. The Clarity Icon */}
        <Animated.View 
          style={[
            animatedStyle, 
            { alignItems: 'center', width: '100%' } // <--- THIS FIXES THE CENTERING
          ]}
        >
          <Image 
            source={require('../../../assets/ClarityIcon.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* 2. Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>
              Welcome to Clarity
          </Text>
          <Text style={styles.subText}>
              I would love to get to know you better! What's your name?
          </Text>
        </View>
        
        {/* 3. The "Cloud" Input */}
        <TextInput 
          style={styles.cloudInput}
          onChangeText={onChangeText}
          value={users_name}
          placeholder="Enter your name..."
          placeholderTextColor="#A0C4FF" // Light blue placeholder
        />

        {/* 4. The Action Button */}
        <Pressable 
            onPress={handleNextPage} 
            style={({ pressed }) => [
                styles.buttonStyling,
                pressed && styles.buttonPressed // Adds a click effect
            ]}
        >
            <Text style={styles.buttonText}>Continue</Text>
        </Pressable>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB", 
  },
  heroImage: {
    width: width * 0.6, // 80% of screen width
    height: width * 0.6,
    maxHeight: 350,
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    // 1. Changed from 'center' to 'flex-start' so it starts at the top
    justifyContent: 'flex-start', 
    paddingHorizontal: 30,
    width: '100%',
    
    // 2. Add Padding Top: Controls how far down the content starts
    // Increase this number to move it down, decrease to move it up
    // paddingTop: 120, 
  },

  // -- Logo Style --
  logo: {
    width: 300,  
    height: 200, 
    resizeMode: 'contain',
    marginBottom: 20, // Reduced slightly to keep things tight
  },

  // -- Typography --
  textContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#005A9C', 
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 18,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 24, 
  },

  // -- Cloud Input Box --
  cloudInput: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 30, 
    paddingHorizontal: 25,
    fontSize: 18,
    color: '#333333',
    marginBottom: 30,
    shadowColor: '#A0C4FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5, 
  },

  // -- Button Styles --
  buttonStyling: {
    width: '100%',
    backgroundColor: '#005A9C', 
    paddingVertical: 18,
    borderRadius: 30, 
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    backgroundColor: '#004080', 
    transform: [{ scale: 0.98 }], 
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  }, 
});