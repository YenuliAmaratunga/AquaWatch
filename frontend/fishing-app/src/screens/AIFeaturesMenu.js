import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

/**
 * AI Features Menu Screen
 * Quick access to all AI Safety & Risk Analysis features
 * This can be integrated into your main navigation or accessed from the home screen
 */
export default function AIFeaturesMenu({ navigation }) {
  const features = [
    {
      id: 1,
      title: "Risk Assessment Dashboard",
      subtitle: "Real-time safety analysis for your boats",
      icon: "analytics",
      color: "#636CCB",
      screen: "RiskAssessmentDashboard",
      delay: 100,
    },
    {
      id: 2,
      title: "Trip Safety Validator",
      subtitle: "Pre-trip safety checks with AI",
      icon: "shield-checkmark",
      color: "#10B981",
      screen: "TripSafetyValidator",
      delay: 200,
    },
    {
      id: 3,
      title: "Safety Analytics",
      subtitle: "Insights, trends, and statistics",
      icon: "bar-chart",
      color: "#F59E0B",
      screen: "SafetyAnalytics",
      delay: 300,
    },
  ];

  const FeatureCard = ({ feature }) => (
    <Animatable.View animation="fadeInUp" delay={feature.delay}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate(feature.screen)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[feature.color, feature.color + "DD"]}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={feature.icon} size={40} color="#fff" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{feature.title}</Text>
              <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
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
          <Ionicons
            name="brain"
            size={50}
            color="#fff"
            style={{ alignSelf: "center", marginBottom: 10 }}
          />
          <Text style={styles.headerTitle}>AI Safety Features</Text>
          <Text style={styles.headerSubtitle}>
            Powered by advanced risk analysis
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Features List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}

        {/* Info Card */}
        <Animatable.View animation="fadeIn" delay={400} style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#636CCB" />
            <Text style={styles.infoTitle}>About AI Features</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI-powered safety system analyzes multiple factors including
            weather conditions, boat specifications, crew details, and historical
            data to provide comprehensive risk assessments and recommendations.
          </Text>
          <View style={styles.infoBullets}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.bulletText}>Real-time weather integration</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.bulletText}>Dynamic risk scoring (0-100)</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.bulletText}>Historical analytics & trends</Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.bulletText}>Automated safety recommendations</Text>
            </View>
          </View>
        </Animatable.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#636CCB",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 15,
  },
  infoBullets: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 13,
    color: "#374151",
    marginLeft: 8,
    fontWeight: "600",
  },
});

