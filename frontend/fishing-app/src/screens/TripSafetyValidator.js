import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  calculateOverallRisk,
  calculateWeatherRisk,
  getRiskLevel,
  getTripRecommendation,
  getRiskBreakdown,
  calculateDistance,
} from "../utils/riskCalculator";

const AUTH_BASE =
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";
const WEATHER_BASE =
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0";

export default function TripSafetyValidator({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState("");
  const [crewCount, setCrewCount] = useState("4");
  const [lifeJackets, setLifeJackets] = useState("4");
  const [fuelAmount, setFuelAmount] = useState("60");
  const [engineStatus, setEngineStatus] = useState("Good");
  const [destinationLat, setDestinationLat] = useState("");
  const [destinationLon, setDestinationLon] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    fetchUserBoats();
    getCurrentLocation();
  }, []);

  const fetchUserBoats = async () => {
    try {
      const auth = await AsyncStorage.getItem("authData");
      if (!auth) return;

      const parsed = JSON.parse(auth);
      const res = await axios.get(
        `${AUTH_BASE}/api/Boat/viewBoatRegRequestsMade/${parsed.userId}`
      );

      if (Array.isArray(res.data)) {
        setBoats(res.data);
        if (res.data.length > 0) {
          setSelectedBoat(res.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching boats:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const validateTrip = async () => {
    // Validation checks
    if (!selectedBoat) {
      Alert.alert("Missing Data", "Please select a boat");
      return;
    }

    if (!crewCount || !lifeJackets || !fuelAmount) {
      Alert.alert("Missing Data", "Please fill in all fields");
      return;
    }

    if (!destinationLat || !destinationLon) {
      Alert.alert("Missing Data", "Please enter destination coordinates");
      return;
    }

    if (!currentLocation) {
      Alert.alert("Location Error", "Unable to get current location");
      return;
    }

    setValidating(true);

    try {
      const boat = boats.find((b) => b._id === selectedBoat);
      
      // Calculate boat age
      const boatAge = boat.createdAt
        ? new Date().getFullYear() - new Date(boat.createdAt).getFullYear()
        : 5;

      // Calculate distance
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        parseFloat(destinationLat),
        parseFloat(destinationLon)
      );

      // Fetch weather data for destination
      const weatherRes = await axios.get(
        `${WEATHER_BASE}/api/weather/forecast?lat=${destinationLat}&lon=${destinationLon}`
      );

      let weatherData = null;
      if (weatherRes.data.success) {
        weatherData = weatherRes.data.data;
      }

      const weatherRisk = calculateWeatherRisk(weatherData);

      // Calculate overall risk
      const factors = {
        boatAge: boatAge,
        fuelAmount: parseFloat(fuelAmount),
        fuelEfficiency: 3.5, // km per liter - could be boat-specific
        crewCount: parseInt(crewCount),
        lifeJacketsCount: parseInt(lifeJackets),
        engineStatus: engineStatus,
        weatherRisk: weatherRisk,
        distanceKm: distance,
        pastViolations: 0, // Could be fetched from backend
      };

      const riskScore = calculateOverallRisk(factors);
      const riskLevel = getRiskLevel(riskScore);
      const recommendation = getTripRecommendation(riskScore);
      const breakdown = getRiskBreakdown(factors);

      setValidationResult({
        boat: boat,
        riskScore: riskScore,
        riskLevel: riskLevel,
        recommendation: recommendation,
        breakdown: breakdown,
        distance: distance,
        weatherData: weatherData,
        factors: factors,
      });

      setShowResultModal(true);
    } catch (error) {
      console.error("Validation error:", error);
      Alert.alert("Error", "Failed to validate trip. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const ResultModal = () => {
    if (!validationResult) return null;

    const { riskScore, riskLevel, recommendation, breakdown, distance, boat } =
      validationResult;

    return (
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowResultModal(false)}
      >
        <ScrollView style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[recommendation.color, recommendation.color + "DD"]}
            style={styles.modalHeader}
          >
            <Ionicons name={recommendation.icon} size={60} color="#fff" />
            <Text style={styles.modalTitle}>{recommendation.decision}</Text>
            <Text style={styles.modalSubtitle}>{recommendation.message}</Text>
          </LinearGradient>

          {/* Risk Score Display */}
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Risk Score</Text>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreValue, { color: riskLevel.color }]}>
                {riskScore}
              </Text>
              <Text style={styles.scoreMax}>/ 100</Text>
            </View>
            <Text style={[styles.scoreLevelText, { color: riskLevel.color }]}>
              {riskLevel.emoji} {riskLevel.level} RISK
            </Text>
          </View>

          {/* Trip Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Trip Details</Text>
            <View style={styles.detailRow}>
              <Ionicons name="boat" size={18} color="#636CCB" />
              <Text style={styles.detailLabel}>Boat:</Text>
              <Text style={styles.detailValue}>{boat.boatName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="navigate" size={18} color="#636CCB" />
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{distance.toFixed(2)} km</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="people" size={18} color="#636CCB" />
              <Text style={styles.detailLabel}>Crew:</Text>
              <Text style={styles.detailValue}>{crewCount} persons</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="water" size={18} color="#636CCB" />
              <Text style={styles.detailLabel}>Fuel:</Text>
              <Text style={styles.detailValue}>{fuelAmount} liters</Text>
            </View>
          </View>

          {/* Risk Breakdown */}
          <View style={styles.breakdownCard}>
            <Text style={styles.cardTitle}>Risk Analysis</Text>
            {breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View
                  style={[
                    styles.statusIndicator,
                    {
                      backgroundColor:
                        item.status === "safe"
                          ? "#10B981"
                          : item.status === "warning"
                          ? "#F59E0B"
                          : "#EF4444",
                    },
                  ]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.breakdownFactor}>{item.factor}</Text>
                  <Text style={styles.breakdownValue}>{item.value}</Text>
                  <Text style={styles.breakdownMessage}>{item.message}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            {recommendation.decision === "APPROVED" && (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => {
                  setShowResultModal(false);
                  navigation.navigate("TripRegistration");
                }}
              >
                <LinearGradient
                  colors={["#10B981", "#34D399"]}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Proceed to Register</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.closeButtonText}>
                {recommendation.decision === "DENIED" ? "Revise Trip Plan" : "Close"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Modal>
    );
  };

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
          <Ionicons
            name="shield-checkmark"
            size={50}
            color="#fff"
            style={{ alignSelf: "center", marginBottom: 10 }}
          />
          <Text style={styles.headerTitle}>Trip Safety Validator</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered pre-trip safety assessment
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Boat Selection */}
        <Animatable.View animation="fadeInUp" delay={100} style={styles.inputGroup}>
          <Text style={styles.label}>Select Boat *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedBoat}
              onValueChange={(value) => setSelectedBoat(value)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select a Boat --" value="" />
              {boats.map((boat) => (
                <Picker.Item
                  key={boat._id}
                  label={`${boat.boatName} (${boat.registrationNumber})`}
                  value={boat._id}
                />
              ))}
            </Picker>
          </View>
        </Animatable.View>

        {/* Crew Count */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.inputGroup}>
          <Text style={styles.label}>Number of Crew Members *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="people" size={20} color="#636CCB" />
            <TextInput
              style={styles.input}
              value={crewCount}
              onChangeText={setCrewCount}
              keyboardType="numeric"
              placeholder="e.g., 4"
            />
          </View>
        </Animatable.View>

        {/* Life Jackets */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.inputGroup}>
          <Text style={styles.label}>Number of Life Jackets *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark" size={20} color="#636CCB" />
            <TextInput
              style={styles.input}
              value={lifeJackets}
              onChangeText={setLifeJackets}
              keyboardType="numeric"
              placeholder="e.g., 4"
            />
          </View>
        </Animatable.View>

        {/* Fuel Amount */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.inputGroup}>
          <Text style={styles.label}>Fuel Amount (Liters) *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="water" size={20} color="#636CCB" />
            <TextInput
              style={styles.input}
              value={fuelAmount}
              onChangeText={setFuelAmount}
              keyboardType="numeric"
              placeholder="e.g., 60"
            />
          </View>
        </Animatable.View>

        {/* Engine Status */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.inputGroup}>
          <Text style={styles.label}>Engine Status *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={engineStatus}
              onValueChange={(value) => setEngineStatus(value)}
              style={styles.picker}
            >
              <Picker.Item label="Good" value="Good" />
              <Picker.Item label="Needs Maintenance" value="Needs Maintenance" />
              <Picker.Item label="Critical" value="Critical" />
            </Picker>
          </View>
        </Animatable.View>

        {/* Destination Coordinates */}
        <Animatable.View animation="fadeInUp" delay={600}>
          <Text style={styles.sectionTitle}>Destination Location *</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Latitude</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#636CCB" />
              <TextInput
                style={styles.input}
                value={destinationLat}
                onChangeText={setDestinationLat}
                keyboardType="numeric"
                placeholder="e.g., 6.9271"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Longitude</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location" size={20} color="#636CCB" />
              <TextInput
                style={styles.input}
                value={destinationLon}
                onChangeText={setDestinationLon}
                keyboardType="numeric"
                placeholder="e.g., 79.8612"
              />
            </View>
          </View>

          {/* Quick Location Presets */}
          <Text style={styles.presetLabel}>Quick Presets:</Text>
          <View style={styles.presetButtons}>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setDestinationLat("6.9271");
                setDestinationLon("79.8612");
              }}
            >
              <Text style={styles.presetButtonText}>Colombo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setDestinationLat("7.8731");
                setDestinationLon("80.7718");
              }}
            >
              <Text style={styles.presetButtonText}>Kandy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetButton}
              onPress={() => {
                setDestinationLat("8.5874");
                setDestinationLon("81.2152");
              }}
            >
              <Text style={styles.presetButtonText}>Trincomalee</Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>

        {/* Current Location Display */}
        {currentLocation && (
          <Animatable.View animation="fadeIn" style={styles.locationInfo}>
            <Ionicons name="navigate-circle" size={20} color="#10B981" />
            <Text style={styles.locationText}>
              Current: {currentLocation.latitude.toFixed(4)},{" "}
              {currentLocation.longitude.toFixed(4)}
            </Text>
          </Animatable.View>
        )}

        {/* Validate Button */}
        <Animatable.View animation="fadeInUp" delay={700}>
          <TouchableOpacity
            style={styles.validateButton}
            onPress={validateTrip}
            disabled={validating}
          >
            <LinearGradient
              colors={["#636CCB", "#8B93FF"]}
              style={styles.buttonGradient}
            >
              {validating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="analytics" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Validate Trip Safety</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Info Card */}
        <Animatable.View animation="fadeIn" delay={800} style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#636CCB" />
          <Text style={styles.infoText}>
            Our AI will analyze weather conditions, boat specifications, fuel adequacy,
            and safety equipment to provide a comprehensive risk assessment.
          </Text>
        </Animatable.View>
      </View>

      <View style={{ height: 40 }} />

      {/* Result Modal */}
      <ResultModal />
    </ScrollView>
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
    fontSize: 26,
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: "#1F2937",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  picker: {
    height: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 10,
    marginBottom: 15,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 8,
  },
  presetButtons: {
    flexDirection: "row",
    gap: 8,
  },
  presetButton: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#636CCB",
  },
  presetButtonText: {
    color: "#636CCB",
    fontSize: 12,
    fontWeight: "600",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 12,
    color: "#065F46",
    marginLeft: 8,
    fontWeight: "600",
  },
  validateButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    marginTop: 10,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 10,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EEF2FF",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#636CCB",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#4338CA",
    marginLeft: 10,
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginTop: 15,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 30,
    opacity: 0.95,
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 15,
  },
  scoreCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: "900",
  },
  scoreMax: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: -5,
  },
  scoreLevelText: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 15,
    letterSpacing: 1,
  },
  detailsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 8,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#1F2937",
    marginLeft: "auto",
    fontWeight: "700",
  },
  breakdownCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
  },
  breakdownItem: {
    flexDirection: "row",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  statusIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  breakdownFactor: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636CCB",
    marginTop: 2,
  },
  breakdownMessage: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16,
  },
  modalActions: {
    marginHorizontal: 20,
  },
  proceedButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#636CCB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#636CCB",
    fontSize: 16,
    fontWeight: "700",
  },
});

