import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ToastAndroid, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IdCard,
  ShieldAlert,
  CloudSun,
  Locate,
} from "lucide-react-native";

const cardData = [
  { id: 1, title: "Registration & QR", bg: "bg-darkPurple", screen: "Fisherman", icon: IdCard, color: "#50589C" },
  { id: 2, title: "Safety & Risk", bg: "bg-darkPurple", screen: "Risk", icon: ShieldAlert, color: "#50589C" },
  { id: 3, title: "Weather Forecast", bg: "bg-darkPurple", screen: "Weather", icon: CloudSun, color: "#50589C" },
  { id: 4, title: "SOS & Reporting", bg: "bg-darkPurple", screen: "GPS", icon: Locate, color: "#50589C" },
  { id: 5, title: "AI Safety Analytics", bg: "bg-darkPurple", screen: "AIFeaturesMenu", icon: ShieldAlert, color: "#50589C" },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Info", message);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all auth data
              await AsyncStorage.removeItem("authData");
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("userId");
              
              showToast("✅ Logged out successfully");
              
              // Navigate to landing screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white px-4 pt-16">
      {/* Top Bar */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-3xl font-bold text-darkBlue">
            AquaWatch
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Maritime Safety Dashboard
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="px-4 py-2 bg-red-500 rounded-lg flex-row items-center"
          style={{ elevation: 3 }}
        >
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text className="text-white text-sm font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Grid Section - 5 Cards */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-700 mb-4">
          Quick Access
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          {cardData.map((card, index) => {
            const Icon = card.icon;
            return (
              <TouchableOpacity
                key={card.id}
                className={`w-[48%] h-44 mb-4 rounded-2xl ${card.bg} items-center justify-center border border-gray-200 shadow-lg`}
                style={{
                  backgroundColor: card.color,
                  elevation: 5,
                }}
                onPress={() => {
                  if (card.screen) {
                    navigation.navigate(card.screen);
                  }
                }}
              >
                <View className="bg-white/20 rounded-full p-3 mb-3">
                  <Icon size={36} color="white" />
                </View>
                <Text className="text-base font-bold text-white text-center px-2">
                  {card.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Footer */}
        <View className="mt-auto mb-4 p-4 bg-blue-50 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-sm text-gray-700 ml-2 flex-1">
              Tap any card to access features. Stay safe at sea! 🌊
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
