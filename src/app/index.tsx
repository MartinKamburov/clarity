import { View, Text, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";
import FloatingCloud from "../components/FloatingCloud";


export default function HomePage() {
    return (
        <View style={styles.container}>
            <Image source={require('../../assets/ClarityIcon.png')} style={styles.image}/>
            <FloatingCloud />
            <Text>Hello world</Text>
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