import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LandingScreen({ navigation }) {
  const [language, setLanguage] = useState("en");

  const labels = {
    en: { register: "Register", login: "Login" },
    si: { register: "ලියාපදිංචි", login: "ලොග් ඉන් වන්න" },
    ta: { register: "பதிவு", login: "உள்நுழையவும்" },
  };

  const currentLabels = labels[language] || labels.en;

  const GradientButton = ({ text, colors, onPress }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        flex: 1,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 16,
          alignItems: "center",
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {text || "Button"}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={["#EEF0FF", "#D8D8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ App Logo - Make sure path exists */}
          <Image
            source={require("../assets/CircularAppLogo.png")}
            style={{ width: 192, height: 192, marginBottom: 64 }}
            resizeMode="contain"
          />

          {/* ✅ Register & Login Buttons */}
          <View style={{ width: "100%", marginBottom: 24 }}>
            <GradientButton
              text={currentLabels.register}
              colors={["#50589C", "#6E8CFB"]}
              onPress={() => navigation.navigate("Register", { language })}
            />
            <View style={{ height: 32 }} />
            <GradientButton
              text={currentLabels.login}
              colors={["#6E8CFB", "#BABCFF"]}
              onPress={() => navigation.navigate("Login", { language })}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
