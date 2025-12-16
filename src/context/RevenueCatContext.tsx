import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform, Alert } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

// Your API Keys
const API_KEY = 'test_wXBzcXrOGDPXcjsLqCvUHlYnaCr'; 
const ENTITLEMENT_ID = 'Clarity Pro'; // Must match your RevenueCat Entitlement ID exactly

interface RevenueCatProps {
  isPro: boolean;
  customerInfo: CustomerInfo | null;
  restorePurchases: () => Promise<void>;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

export const RevenueCatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPro, setIsPro] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    // 1. Initialize SDK
    const init = async () => {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Enable logs to see what's happening

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Purchases.configure({ apiKey: API_KEY });
      }

      try {
        const info = await Purchases.getCustomerInfo();
        updateCustomerState(info);
      } catch (e) {
        console.log('Error fetching customer info:', e);
      }
    };

    init();

    // 2. Define the listener function separately (THE FIX)
    const customerInfoUpdated = (info: CustomerInfo) => {
      updateCustomerState(info);
    };

    // 3. Add the listener
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);

    // 4. Remove the listener using the exact reference
    return () => {
      Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
    };
  }, []);

  // Helper to check for "Clarity Pro" entitlement
  const updateCustomerState = (info: CustomerInfo) => {
    setCustomerInfo(info);
    // Checks if the 'Clarity Pro' entitlement is currently active
    const isActive = typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    setIsPro(isActive);
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      updateCustomerState(info);
      if (typeof info.entitlements.active[ENTITLEMENT_ID] !== "undefined") {
         Alert.alert("Success", "Your purchases have been restored.");
      } else {
         Alert.alert("Notice", "No active subscription found to restore.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <RevenueCatContext.Provider value={{ isPro, customerInfo, restorePurchases }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  return context;
};