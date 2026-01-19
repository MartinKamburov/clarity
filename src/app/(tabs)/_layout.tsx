import { Tabs } from "expo-router";
import React from "react";

export default function HomePageLayout() {
    return (
        <Tabs 
            screenOptions={{
                // 1. Hide the top header ("Home", "Index", etc.)
                headerShown: false, 
                
                // 2. Hide the bottom system tab bar
                // We do this because you have a custom bottom bar in your design
                tabBarStyle: { display: 'none' } 
            }}
        >
            {/* If you renamed your file to 'home.tsx', you can explicitly register it here.
               This isn't strictly necessary (Expo finds it automatically), 
               but it helps prevent "Route not found" errors.
            */}
            <Tabs.Screen name="home" />
        </Tabs>
    );
}