import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const safetyChecklist = {
  MAX_BOAT_AGE_YEARS: 15,
  MIN_FUEL_AMOUNT_LITERS: 20,
  MIN_FUEL_EFFICIENCY: 2.0,
  MIN_LIFE_JACKETS_PER_CREW: 1,
  CRITICAL_ENGINE_STATUSES: ["Needs Maintenance", "Critical"],
  RADIO_COMM_REQUIRED: true,
  WEATHER_CHECK_REQUIRED: true,
  MIN_FUEL_BUFFER_PERCENTAGE: 0.15,
};

export default function RiskScreen() {
  const navigation = useNavigation();

  const checklistItems = [
    {
      id: 1,
      icon: "boat",
      title: "Boat Age Limit",
      value: `${safetyChecklist.MAX_BOAT_AGE_YEARS} years`,
      description: "Older boats may not meet safety standards",
      color: "#636CCB",
    },
    {
      id: 2,
      icon: "water",
      title: "Minimum Fuel",
      value: `${safetyChecklist.MIN_FUEL_AMOUNT_LITERS} liters`,
      description: "Ensure sufficient fuel for the journey",
      color: "#F59E0B",
    },
    {
      id: 3,
      icon: "speedometer",
      title: "Fuel Efficiency",
      value: `${safetyChecklist.MIN_FUEL_EFFICIENCY} km/l`,
      description: "Check your boat's fuel consumption rate",
      color: "#10B981",
    },
    {
      id: 4,
      icon: "shield-checkmark",
      title: "Life Jackets",
      value: `${safetyChecklist.MIN_LIFE_JACKETS_PER_CREW} per person`,
      description: "Every crew member must have a life jacket",
      color: "#EF4444",
    },
    {
      id: 5,
      icon: "construct",
      title: "Engine Status",
      value: "Must be Good",
      description: `Avoid: ${safetyChecklist.CRITICAL_ENGINE_STATUSES.join(", ")}`,
      color: "#8B5CF6",
    },
    {
      id: 6,
      icon: "radio",
      title: "Radio Communication",
      value: safetyChecklist.RADIO_COMM_REQUIRED ? "Required" : "Optional",
      description: "Essential for emergency contact",
      color: "#3B82F6",
    },
    {
      id: 7,
      icon: "cloudy",
      title: "Weather Check",
      value: safetyChecklist.WEATHER_CHECK_REQUIRED ? "Required" : "Optional",
      description: "Check forecast before departure",
      color: "#06B6D4",
    },
    {
      id: 8,
      icon: "battery-charging",
      title: "Fuel Buffer",
      value: `${(safetyChecklist.MIN_FUEL_BUFFER_PERCENTAGE * 100).toFixed(0)}%`,
      description: "Extra fuel for unexpected conditions",
      color: "#F97316",
    },
  ];

  const ChecklistCard = ({ item, delay }) => (
    <Animatable.View animation="fadeInUp" delay={delay} style={styles.card}>
      <LinearGradient
        colors={[item.color, item.color + "DD"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={item.icon} size={28} color="#fff" />
          </View>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{item.description}</Text>
      </LinearGradient>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#636CCB", "#8B93FF"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown">
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={40} color="#fff" style={{ marginBottom: 10 }} />
            <Text style={styles.headerTitle}>Safety Checklist</Text>
            <Text style={styles.headerSubtitle}>
              Review requirements before your fishing trip
            </Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Card */}
        <Animatable.View animation="fadeIn" delay={100} style={styles.introCard}>
          <View style={styles.introHeader}>
            <Ionicons name="information-circle" size={24} color="#636CCB" />
            <Text style={styles.introTitle}>Important Safety Guidelines</Text>
          </View>
          <Text style={styles.introText}>
            Ensure all the following requirements are met before departing on your fishing trip.
            Your safety and the safety of your crew depend on it.
          </Text>
        </Animatable.View>

        {/* Checklist Cards */}
        {checklistItems.map((item, index) => (
          <ChecklistCard key={item.id} item={item} delay={200 + index * 50} />
        ))}

        {/* AI Features Button */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => navigation.navigate("AIFeaturesMenu")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="analytics" size={24} color="#fff" />
              <Text style={styles.aiButtonText}>Advanced AI Risk Analysis</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Footer Warning */}
        <Animatable.View animation="fadeIn" delay={700} style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#EF4444" />
          <Text style={styles.warningText}>
            Non-compliance with these safety requirements may result in denied trip approval
            or legal penalties.
          </Text>
        </Animatable.View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: "#EEF2FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#636CCB",
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 10,
  },
  introText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    opacity: 0.9,
  },
  cardDescription: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.85,
    marginLeft: 68,
    lineHeight: 18,
  },
  aiButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
  },
  aiButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    gap: 10,
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  warningText: {
    fontSize: 12,
    color: "#991B1B",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});
