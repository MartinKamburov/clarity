import { View, Text, StyleSheet, Image, Button } from "react-native";
import { Link } from "expo-router";


export default function HomePage() {
    return (
        <View style={styles.container}>
            <Image source={require('../../assets/ClarityIcon.png')} style={styles.image}/>
            <Link href="/screen1">
              <Text>Click to get started!</Text>
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
});