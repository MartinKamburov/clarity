import { View, Text, StyleSheet, Image, Button } from "react-native";
import { Link } from "expo-router";


export default function HomePage() {
    return (
        <View style={styles.container}>
            <Image source={require('../../assets/ClarityIcon.png')} style={styles.image}/>
            
            <Link href="/screen1" style={styles.buttonStyling}>
              <Text style={styles.text}>Click to get started!</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "#F0F8FF"
  },
  image: {
    width: 250,
    height: 350,
  },
  buttonStyling: {
    backgroundColor: '#005A9C', // Deep Royal Blue (Contrasts well with Sky Blue)
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20, // Fully rounded ends
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    
    // The "Hover" Shadow
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  }
});