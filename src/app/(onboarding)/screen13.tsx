import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// --- PLANS CONFIGURATION ---
const PLANS = [
  {
    id: 'yearly',
    title: 'Yearly',
    price: '$19.99',
    period: '/ year',
    subtitle: '$1.66 / month',
    saveBadge: 'SAVE 67%',
    trial: '3 Days Free'
  },
  {
    id: 'monthly',
    title: 'Monthly',
    price: '$4.99',
    period: '/ month',
    subtitle: 'Billed monthly',
    saveBadge: null,
    trial: null
  },
  {
    id: 'lifetime',
    title: 'Lifetime',
    price: '$49.99',
    period: 'once',
    subtitle: 'One-time payment',
    saveBadge: 'BEST VALUE',
    trial: null
  }
];

// --- BENEFITS LIST ---
const BENEFITS = [
  "Unlimited daily affirmations",
  "Unlock all themes & backgrounds",
  "Home screen widgets",
  "No ads, ever"
];

export default function ThePaywall() {
  const params = useLocalSearchParams();
  const { name } = params;

  // Default to Yearly as it's the one we want to push
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const handleSelect = (id: string) => {
    Haptics.selectionAsync();
    setSelectedPlan(id);
  };

  const handleSubscribe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log(`Processing subscription for: ${selectedPlan}`);
    router.replace("/(tabs)/home"); 
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)/home"); 
  };

  // Helper to get button text based on selection
  const getButtonText = () => {
    if (selectedPlan === 'yearly') return "Start 3-Day Free Trial";
    return "Continue";
  };

  return (
      <SafeAreaView style={styles.container}>
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            
            {/* --- HEADER --- */}
            <View style={styles.headerContainer}>
                <Image 
                    source={require('../../../assets/ClarityIcon.png')} 
                    style={styles.heroImage}
                    resizeMode="contain"
                />
                <Text style={styles.headerTitle}>
                    Unlock full access for {name}
                </Text>
            </View>

            {/* --- BENEFITS (Compact) --- */}
            <View style={styles.benefitsContainer}>
                {BENEFITS.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                        <Feather name="check" size={16} color="#4ADE80" />
                        <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                ))}
            </View>

            {/* --- PLAN SELECTOR --- */}
            <Animated.View 
                entering={FadeInUp.springify().delay(200)}
                style={styles.plansContainer}
            >
                {PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                        <TouchableOpacity 
                            key={plan.id}
                            style={[
                                styles.planCard, 
                                isSelected && styles.planCardSelected
                            ]}
                            onPress={() => handleSelect(plan.id)}
                            activeOpacity={0.9}
                        >
                            {/* Radio Circle */}
                            <View style={[
                                styles.radioCircle, 
                                isSelected && styles.radioCircleSelected
                            ]}>
                                {isSelected && <View style={styles.radioDot} />}
                            </View>

                            {/* Text Info */}
                            <View style={styles.planInfo}>
                                <View style={styles.titleRow}>
                                    <Text style={[styles.planTitle, isSelected && styles.textSelected]}>
                                        {plan.title}
                                    </Text>
                                    {plan.saveBadge && (
                                        <View style={styles.saveBadge}>
                                            <Text style={styles.saveBadgeText}>{plan.saveBadge}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.planSubtitle}>{plan.subtitle}</Text>
                            </View>

                            {/* Price */}
                            <View style={styles.priceContainer}>
                                <Text style={[styles.planPrice, isSelected && styles.textSelected]}>
                                    {plan.price}
                                </Text>
                                <Text style={styles.planPeriod}>{plan.period}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>

            {/* --- FOOTER ACTIONS --- */}
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={styles.mainButton} 
                    onPress={handleSubscribe}
                    activeOpacity={0.9}
                >
                    <Text style={styles.mainButtonTitle}>{getButtonText()}</Text>
                    {selectedPlan === 'yearly' && (
                        <Text style={styles.mainButtonSubtitle}>Then $19.99/year. Cancel anytime.</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={handleClose}
                >
                    <Text style={styles.secondaryButtonText}>
                        Continue with Limited Version
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.disclaimer}>
                Recurring billing. Cancel anytime in settings.
            </Text>

        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  
  // --- HEADER ---
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20, 
  },
  heroImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22, 
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // --- BENEFITS ---
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 25,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 13, 
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // --- PLANS ---
  plansContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 25,
  },
  planCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#005A9C', // Blue Border for active
    shadowColor: "#003366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Radio Button
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#A0AEC0',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#005A9C',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#005A9C',
  },

  // Plan Info
  planInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A5568',
  },
  textSelected: {
    color: '#005A9C',
  },
  saveBadge: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#064E3B',
  },
  planSubtitle: {
    fontSize: 13,
    color: '#718096',
  },

  // Price
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5568',
  },
  planPeriod: {
    fontSize: 12,
    color: '#718096',
  },

  // --- FOOTER ---
  footer: {
    width: '100%',
    gap: 12,
    marginBottom: 10,
  },
  mainButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16, 
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#003366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  mainButtonTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#005A9C',
  },
  mainButtonSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005A9C',
    opacity: 0.8,
    marginTop: 2,
  },
  secondaryButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  disclaimer: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
});