import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

// STATIC HARDCODED DATA - No API calls
const STATIC_BOAT_DATA = {
  boatName: "Sea Explorer",
  registrationNumber: "SL-BOAT-2024-001",
  boatType: "Fishing Vessel",
  capacity: 8,
  boatAge: 3,
  engineStatus: "Good",
};

const STATIC_RISK_FACTORS = {
  boatAge: 3,
  fuelAmount: 70,
  fuelEfficiency: 4.0,
  crewCount: 5,
  lifeJacketsCount: 8,
  engineStatus: "Good",
  weatherCondition: "Fair",
  distanceKm: 45,
  pastViolations: 0,
};

const STATIC_RISK_SCORE = 28; // Low risk (hardcoded)

const getRiskLevel = (score) => {
  if (score < 30) {
    return {
      level: "LOW",
      emoji: "✅",
      color: "#10B981",
    };
  } else if (score < 60) {
    return {
      level: "MEDIUM",
      emoji: "⚠️",
      color: "#F59E0B",
    };
  } else {
    return {
      level: "HIGH",
      emoji: "❌",
      color: "#EF4444",
    };
  }
};

const getTripRecommendation = (score) => {
  if (score < 30) {
    return {
      decision: "TRIP APPROVED ✓",
      message: "All safety parameters are within acceptable limits. Safe travels!",
      icon: "checkmark-circle",
      color: "#10B981",
    };
  } else if (score < 60) {
    return {
      decision: "CAUTION ADVISED",
      message: "Some risk factors detected. Proceed with extra caution.",
      icon: "warning",
      color: "#F59E0B",
    };
  } else {
    return {
      decision: "TRIP NOT RECOMMENDED",
      message: "High risk conditions detected. Consider postponing this trip.",
      icon: "close-circle",
      color: "#EF4444",
    };
  }
};

const STATIC_RISK_BREAKDOWN = [
  {
    icon: "calendar",
    factor: "Boat Age",
    value: "3 years",
    status: "safe",
    message: "Boat is relatively new and well-maintained",
  },
  {
    icon: "water",
    factor: "Fuel Status",
    value: "70 liters (Sufficient)",
    status: "safe",
    message: "Adequate fuel for planned distance of 45 km",
  },
  {
    icon: "shield-checkmark",
    factor: "Safety Equipment",
    value: "8/5 life jackets",
    status: "safe",
    message: "Sufficient life jackets for all crew members",
  },
  {
    icon: "construct",
    factor: "Engine Condition",
    value: "Good",
    status: "safe",
    message: "Engine is in good working condition",
  },
  {
    icon: "partly-sunny",
    factor: "Weather Conditions",
    value: "Fair",
    status: "safe",
    message: "Weather conditions are favorable for fishing",
  },
  {
    icon: "navigate",
    factor: "Trip Distance",
    value: "45 km",
    status: "safe",
    message: "Distance is manageable with current fuel",
  },
];

const STATIC_RECOMMENDATIONS = [
  {
    priority: "LOW",
    action: "Ensure regular maintenance schedule is followed",
  },
  {
    priority: "LOW",
    action: "Check weather updates before departure",
  },
  {
    priority: "LOW",
    action: "Verify all communication devices are working",
  },
  {
    priority: "MEDIUM",
    action: "Carry extra fuel for emergency situations",
  },
];

export default function RiskAssessmentDashboard({ navigation }) {
  const [riskScore] = useState(STATIC_RISK_SCORE);
  const [riskAnimation] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(riskAnimation, {
        toValue: riskScore,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const RiskGauge = ({ score }) => {
    const riskLevel = getRiskLevel(score);
    const percentage = (score / 100) * 100;

    return (
      <Animatable.View animation="zoomIn" style={styles.gaugeContainer}>
        <View style={styles.gauge}>
          <View style={styles.gaugeBackground}>
            <View
              style={[
                styles.gaugeFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: riskLevel.color,
                },
              ]}
            />
          </View>
          <View style={styles.gaugeContent}>
            <Text style={[styles.riskEmoji, { fontSize: 50 }]}>
              {riskLevel.emoji}
            </Text>
            <Text style={styles.riskScoreText}>{score}</Text>
            <Text style={styles.riskScoreLabel}>/ 100</Text>
            <Text style={[styles.riskLevelText, { color: riskLevel.color }]}>
              {riskLevel.level} RISK
            </Text>
          </View>
        </View>
      </Animatable.View>
    );
  };

  const RiskFactorCard = ({ icon, factor, value, status, message }) => {
    const statusColors = {
      safe: "#10B981",
      warning: "#F59E0B",
      critical: "#EF4444",
    };

    return (
      <Animatable.View animation="fadeInUp" delay={300} style={styles.factorCard}>
        <View style={styles.factorHeader}>
          <View style={styles.factorIconContainer}>
            <Ionicons name={icon} size={24} color={statusColors[status]} />
          </View>
          <View style={styles.factorInfo}>
            <Text style={styles.factorTitle}>{factor}</Text>
            <Text style={[styles.factorValue, { color: statusColors[status] }]}>
              {value}
            </Text>
          </View>
        </View>
        <Text style={styles.factorMessage}>{message}</Text>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <Ionicons name="analytics" size={70} color="#636CCB" />
        </Animatable.View>
        <Text style={styles.loadingText}>Analyzing Safety Data...</Text>
      </View>
    );
  }

  const recommendation = getTripRecommendation(riskScore);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={["#636CCB", "#8B93FF"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown">
          <Text style={styles.headerTitle}>AI Risk Assessment</Text>
          <Text style={styles.headerSubtitle}>
            Real-time safety analysis for {STATIC_BOAT_DATA.boatName}
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Risk Gauge */}
      <RiskGauge score={riskScore} />

      {/* Recommendation Card */}
      <Animatable.View animation="fadeInUp" delay={200}>
        <LinearGradient
          colors={[recommendation.color, recommendation.color + "DD"]}
          style={styles.recommendationCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={recommendation.icon} size={40} color="#fff" />
          <Text style={styles.recommendationDecision}>{recommendation.decision}</Text>
          <Text style={styles.recommendationMessage}>{recommendation.message}</Text>
        </LinearGradient>
      </Animatable.View>

      {/* Boat Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="boat" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Boat:</Text>
          <Text style={styles.infoValue}>{STATIC_BOAT_DATA.boatName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="document-text" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoValue}>{STATIC_BOAT_DATA.registrationNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="resize" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>{STATIC_BOAT_DATA.boatType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Capacity:</Text>
          <Text style={styles.infoValue}>{STATIC_BOAT_DATA.capacity} persons</Text>
        </View>
      </View>

      {/* Toggle Details Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setShowDetails(!showDetails)}
      >
        <Text style={styles.toggleButtonText}>
          {showDetails ? "Hide" : "Show"} Detailed Analysis
        </Text>
        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Detailed Risk Breakdown */}
      {showDetails && (
        <Animatable.View animation="fadeInUp">
          <Text style={styles.sectionTitle}>Risk Factor Breakdown</Text>
          {STATIC_RISK_BREAKDOWN.map((item, index) => (
            <RiskFactorCard key={index} {...item} />
          ))}

          {/* Safety Recommendations */}
          <Text style={styles.sectionTitle}>Safety Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            {STATIC_RECOMMENDATIONS.map((rec, index) => (
              <Animatable.View
                key={index}
                animation="fadeInLeft"
                delay={index * 100}
                style={styles.recommendationItem}
              >
                <View
                  style={[
                    styles.priorityBadge,
                    {
                      backgroundColor:
                        rec.priority === "HIGH"
                          ? "#EF4444"
                          : rec.priority === "MEDIUM"
                          ? "#F59E0B"
                          : "#636CCB",
                    },
                  ]}
                >
                  <Text style={styles.priorityText}>{rec.priority}</Text>
                </View>
                <Text style={styles.recommendationAction}>{rec.action}</Text>
              </Animatable.View>
            ))}
          </View>
        </Animatable.View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("TripSafetyValidator")}
        >
          <LinearGradient
            colors={["#636CCB", "#8B93FF"]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-done-circle" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Validate New Trip</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate("SafetyAnalytics")}
        >
          <LinearGradient
            colors={["#10B981", "#34D399"]}
            style={styles.actionButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bar-chart" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>View Analytics</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Info Note */}
      <View style={styles.infoNote}>
        <Ionicons name="information-circle" size={20} color="#636CCB" />
        <Text style={styles.infoNoteText}>
          This is a demonstration with static data. In production, this would use real-time boat and weather data.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#636CCB",
    marginTop: 20,
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
  gaugeContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  gauge: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: "#fff",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gaugeBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: (width * 0.7) / 2,
    borderBottomRightRadius: (width * 0.7) / 2,
    overflow: "hidden",
  },
  gaugeFill: {
    height: "100%",
    borderBottomLeftRadius: (width * 0.7) / 2,
    borderBottomRightRadius: (width * 0.7) / 2,
  },
  gaugeContent: {
    alignItems: "center",
  },
  riskEmoji: {
    marginBottom: 10,
  },
  riskScoreText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#1F2937",
  },
  riskScoreLabel: {
    fontSize: 18,
    color: "#6B7280",
    marginBottom: 8,
  },
  riskLevelText: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  recommendationCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  recommendationDecision: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    marginTop: 10,
    letterSpacing: 1,
  },
  recommendationMessage: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.95,
  },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: "auto",
    fontWeight: "700",
  },
  toggleButton: {
    backgroundColor: "#636CCB",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 15,
  },
  factorCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  factorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  factorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  factorValue: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  factorMessage: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 18,
  },
  recommendationsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
  recommendationAction: {
    fontSize: 13,
    color: "#1F2937",
    flex: 1,
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  infoNote: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#636CCB",
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#4338CA",
    marginLeft: 10,
    lineHeight: 18,
  },
});
