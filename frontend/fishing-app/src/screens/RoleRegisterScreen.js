import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const AUTH_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/registration-service/v1.0";

export default function RoleRegisterScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { role, language } = route.params || { role: "fisherman", language: "en" };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
    nationalId: "",
    boatName: "",
    dob: "",
    homeAddress: "",
    badgeNumber: "",
    unit: "",
    email: "",
    organization: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const translations = {
    en: {
      name: "Full Name",
      phone: "Phone Number",
      password: "Password",
      nationalId: "National ID",
      boatName: "Boat Name",
      dob: "Date of Birth (YYYY-MM-DD)",
      homeAddress: "Home Address",
      badgeNumber: "Badge Number",
      unit: "Unit",
      email: "Email",
      organization: "Organization Name",
      submit: "Submit",
      heading: `${role.toUpperCase()} Registration`,
      show: "Show",
      hide: "Hide",
    },
    si: {
      name: "සම්පූර්ණ නම",
      phone: "දුරකථන අංකය",
      password: "මුරපදය",
      nationalId: "ජාතික හැඳුනුම්පත",
      boatName: "නාවු නම",
      dob: "උපන් දිනය (YYYY-MM-DD)",
      homeAddress: "ගෘහස්ථ ලිපිනය",
      badgeNumber: "තහවුරු අංකය",
      unit: "අංශය",
      email: "ඊමේල්",
      organization: "ආයතන නාමය",
      submit: "යොමු කරන්න",
      heading: `${role.toUpperCase()} ලියාපදිංචිය`,
      show: "පෙන්වන්න",
      hide: "සඟවන්න",
    },
    ta: {
      name: "முழு பெயர்",
      phone: "தொலைபேசி எண்",
      password: "கடவுச்சொல்",
      nationalId: "தேசிய அடையாள அட்டை",
      boatName: "படகு பெயர்",
      dob: "பிறந்த தேதி (YYYY-MM-DD)",
      homeAddress: "வீட்டு முகவரி",
      badgeNumber: "அடையாள எண்",
      unit: "அலகு",
      email: "மின்னஞ்சல்",
      organization: "அமைப்பின் பெயர்",
      submit: "சமர்ப்பிக்கவும்",
      heading: `${role.toUpperCase()} பதிவு`,
      show: "காண்பி",
      hide: "மறை",
    },
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: form.name,
        role,
        phone: form.phone,
        password: form.password,
        language:
          language === "si" ? "Sinhala" : language === "ta" ? "Tamil" : "English",
      };

      if (role === "fisherman") {
        Object.assign(payload, {
          nationalId: form.nationalId,
          boatName: form.boatName,
          dob: form.dob,
          homeAddress: form.homeAddress,
        });
      } else if (role === "marine") {
        Object.assign(payload, {
          badgeNumber: form.badgeNumber,
          unit: form.unit,
          email: form.email,
        });
      } else if (role === "ngo") {
        Object.assign(payload, {
          organization: form.organization,
          email: form.email,
        });
      }

      const res = await axios.post(`${AUTH_BASE}/api/User/registerUser`, payload, {
        timeout: 12000,
      });

      Alert.alert("Success", res.data.message);
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    }
  };

  const t = translations[language];

  return (
    <LinearGradient colors={["#EEF0FF", "#D8D8FF"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 32, // 👈 not too high anymore
              paddingBottom: 48,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Heading */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#2D2D4A",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              {t.heading}
            </Text>

            {/* Common Fields */}
            <CustomInput
              label={t.name}
              value={form.name}
              onChangeText={(t) => handleChange("name", t)}
            />
            <CustomInput
              label={t.phone}
              value={form.phone}
              onChangeText={(t) => handleChange("phone", t)}
              keyboardType="phone-pad"
            />
            <CustomInput
              label={t.password}
              value={form.password}
              onChangeText={(t) => handleChange("password", t)}
              secureTextEntry={!showPassword}
              rightElement={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ color: "#6E8CFB", fontWeight: "600" }}>
                    {showPassword ? t.hide : t.show}
                  </Text>
                </TouchableOpacity>
              }
            />

            {/* Role Specific */}
            {role === "fisherman" && (
              <>
                <CustomInput
                  label={t.nationalId}
                  value={form.nationalId}
                  onChangeText={(t) => handleChange("nationalId", t)}
                />
                <CustomInput
                  label={t.boatName}
                  value={form.boatName}
                  onChangeText={(t) => handleChange("boatName", t)}
                />
                <CustomInput
                  label={t.dob}
                  value={form.dob}
                  onChangeText={(t) => handleChange("dob", t)}
                />
                <CustomInput
                  label={t.homeAddress}
                  value={form.homeAddress}
                  onChangeText={(t) => handleChange("homeAddress", t)}
                />
              </>
            )}

            {role === "marine" && (
              <>
                <CustomInput
                  label={t.badgeNumber}
                  value={form.badgeNumber}
                  onChangeText={(t) => handleChange("badgeNumber", t)}
                />
                <CustomInput
                  label={t.unit}
                  value={form.unit}
                  onChangeText={(t) => handleChange("unit", t)}
                />
                <CustomInput
                  label={t.email}
                  value={form.email}
                  onChangeText={(t) => handleChange("email", t)}
                  keyboardType="email-address"
                />
              </>
            )}

            {role === "ngo" && (
              <>
                <CustomInput
                  label={t.organization}
                  value={form.organization}
                  onChangeText={(t) => handleChange("organization", t)}
                />
                <CustomInput
                  label={t.email}
                  value={form.email}
                  onChangeText={(t) => handleChange("email", t)}
                  keyboardType="email-address"
                />
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.9}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                marginTop: 32,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={["#50589C", "#6E8CFB"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 15,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
                  {t.submit}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* 🔹 Reusable Input */
const CustomInput = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry,
  rightElement,
}) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ marginBottom: 6, fontWeight: "600", color: "#2E2E3A" }}>
      {label}
    </Text>
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#C6C6E6",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 14,
        paddingVertical: Platform.OS === "ios" ? 12 : 10,
      }}
    >
      <TextInput
        style={{ flex: 1, fontSize: 16 }}
        placeholder={label}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {rightElement}
    </View>
  </View>
);
