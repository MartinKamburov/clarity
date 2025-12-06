import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function ThirdQuestion(){
    return (
        <View style={styles.container}>
            <Text>
                Welcome to the third question!
            </Text>

            <Link href="/screen3" style={styles.buttonStyling}>
                <Text style={styles.text}>Click to go to the next page</Text>
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