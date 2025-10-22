import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  calculateOverallRisk,
  calculateWeatherRisk,
  getRiskLevel,
  getTripRecommendation,
  getRiskBreakdown,
  generateSafetyRecommendations,
} from "../utils/riskCalculator";

const { width } = Dimensions.get("window");

const AUTH_BASE =
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";
const WEATHER_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0";

export default function RiskAssessmentDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [riskScore, setRiskScore] = useState(0);
  const [riskAnimation] = useState(new Animated.Value(0));
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchUserBoats();
  }, []);

  useEffect(() => {
    if (riskScore > 0) {
      Animated.timing(riskAnimation, {
        toValue: riskScore,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [riskScore]);

  const fetchUserBoats = async () => {
    try {
      const auth = await AsyncStorage.getItem("authData");
      if (!auth) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(auth);
      const res = await axios.get(
        `${AUTH_BASE}/api/Boat/viewBoatRegRequestsMade/${parsed.userId}`
      );

      if (Array.isArray(res.data) && res.data.length > 0) {
        setBoats(res.data);
        // Auto-select first boat for demo
        analyzeBoat(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching boats:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeBoat = async (boat) => {
    setSelectedBoat(boat);
    setLoading(true);

    try {
      // Fetch weather data for home port (using dummy coordinates for demo)
      const lat = 6.9271; // Colombo, Sri Lanka
      const lon = 79.8612;

      const weatherRes = await axios.get(
        `${WEATHER_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}`
      );

      if (weatherRes.data.success) {
        setWeatherData(weatherRes.data.data);
        calculateRisk(boat, weatherRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      // Calculate risk without weather data
      calculateRisk(boat, null);
    } finally {
      setLoading(false);
    }
  };

  const calculateRisk = (boat, weather) => {
    // Calculate boat age (assuming registration date is creation date)
    const boatAge = boat.createdAt
      ? new Date().getFullYear() - new Date(boat.createdAt).getFullYear()
      : 5; // Default 5 years if no date

    const weatherRisk = calculateWeatherRisk(weather);

    const factors = {
      boatAge: boatAge,
      fuelAmount: 60, // Demo value
      fuelEfficiency: 3.5, // Demo value
      crewCount: 4, // Demo value
      lifeJacketsCount: 4, // Demo value
      engineStatus: "Good", // From boat data if available
      weatherRisk: weatherRisk,
      distanceKm: 50, // Demo value for typical fishing trip
      pastViolations: 0, // Could be fetched from backend
    };

    const score = calculateOverallRisk(factors);
    setRiskScore(score);
  };

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
        <ActivityIndicator size="large" color="#636CCB" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!selectedBoat) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="boat-outline" size={70} color="#636CCB" />
        <Text style={styles.loadingText}>No boats found</Text>
        <Text style={styles.subText}>Register a boat to see risk assessment</Text>
      </View>
    );
  }

  const recommendation = getTripRecommendation(riskScore);
  const riskBreakdown = getRiskBreakdown({
    boatAge: new Date().getFullYear() - new Date(selectedBoat.createdAt).getFullYear(),
    fuelAmount: 60,
    fuelEfficiency: 3.5,
    crewCount: 4,
    lifeJacketsCount: 4,
    engineStatus: "Good",
    weatherRisk: calculateWeatherRisk(weatherData),
    distanceKm: 50,
    pastViolations: 0,
  });
  const recommendations = generateSafetyRecommendations(riskBreakdown);

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
            Real-time safety analysis for {selectedBoat.boatName}
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
          <Text style={styles.infoValue}>{selectedBoat.boatName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="document-text" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Registration:</Text>
          <Text style={styles.infoValue}>{selectedBoat.registrationNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="resize" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>{selectedBoat.boatType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people" size={20} color="#636CCB" />
          <Text style={styles.infoLabel}>Capacity:</Text>
          <Text style={styles.infoValue}>{selectedBoat.capacity} persons</Text>
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
          {riskBreakdown.map((item, index) => (
            <RiskFactorCard key={index} {...item} />
          ))}

          {/* Safety Recommendations */}
          <Text style={styles.sectionTitle}>Safety Recommendations</Text>
          <View style={styles.recommendationsContainer}>
            {recommendations.map((rec, index) => (
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

      {/* Refresh Button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => analyzeBoat(selectedBoat)}
      >
        <Ionicons name="refresh" size={20} color="#636CCB" />
        <Text style={styles.refreshButtonText}>Refresh Analysis</Text>
      </TouchableOpacity>

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
  subText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
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
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#636CCB",
    backgroundColor: "#fff",
  },
  refreshButtonText: {
    color: "#636CCB",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },
});

