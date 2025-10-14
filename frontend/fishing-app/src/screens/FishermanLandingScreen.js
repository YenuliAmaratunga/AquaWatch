import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FishermanLandingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const language = "en";

  const translations = {
    si: {
      quick: "ඉක්මන් ක්‍රියාමාර්ග",
      boat: "බෝට්ටු ලියාපදිංචිය",
      trip: "සංචාර සැලසුම්",
      safe: "ආරක්ෂක අනතුරු ඇඟවීම්",
      com: "සමාජ මධ්‍යස්ථානය",
      gear: "උපකරණ සහ උපාංග",
      license: "බලපත්‍ර සහ අවසර ලිපි",
    },
    en: {
      quick: "Quick Actions",
      boat: "Boat Registration",
      trip: "Trip Planning",
      safe: "Safety Alerts",
      com: "Community Hub",
      gear: "Gear & Tackle",
      license: "License & Permits",
    },
    ta: {
      quick: "விரைவான நடவடிக்கைகள்",
      boat: "படகு பதிவு",
      trip: "பயண திட்டமிடல்",
      safe: "பாதுகாப்பு எச்சரிக்கைகள்",
      com: "சமூக மையம்",
      gear: "உபகரணங்கள் மற்றும் கருவிகள்",
      license: "அனுமதி & உரிமங்கள்",
    },
  };

  const icons = {
    boat: "sail-boat",
    trip: "map",
    safe: "shield-alert",
    com: "account-group",
    gear: "compass",
    license: "file-document",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    width: "48%",
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  };

  return (
    <View className="flex-1 bg-white">
      {/* ---------- HEADER ---------- */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 35,
          backgroundColor: "white",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 2 },
            },
            android: {
              elevation: 4,
            },
          }),
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Fisherman's Hub
          </Text>
        </View>

        {/* Right corner icons */}
        <View style={{ position: "absolute", right: 16, flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => alert("Notifications")}>
            <MaterialCommunityIcons name="bell-outline" size={26} color="#1E90FF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => alert("Profile")} style={{ marginLeft: 12 }}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/4140/4140048.png", // sketch-style avatar
              }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- MAIN CONTENT ---------- */}
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text className="text-xl font-bold mb-4">{translations[language].quick}</Text>

        <View className="flex-row flex-wrap justify-between">
          {["boat", "trip", "safe", "com", "gear", "license"].map((key, index) => (
            <TouchableOpacity
              key={index}
              style={cardStyle}
              activeOpacity={0.8}
              onPress={() => {
                if (key === "boat") navigation.navigate("Boat");
                if (key === "trip") navigation.navigate("TripRegistration");
                if (key === "gear") navigation.navigate("Compass");
              }}
            >
              <View className="items-center">
                <MaterialCommunityIcons
                  name={icons[key]}
                  size={38}
                  color="#1E90FF"
                />
                <Text className="mt-2 text-gray-700 font-medium text-center">
                  {translations[language][key]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
