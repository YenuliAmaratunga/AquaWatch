import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Magnetometer } from "expo-sensors";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AUTH_BASE =
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";

// ---------------- Custom Alert Component ----------------
const AppAlert = ({ visible, title, message, type = "info", onClose }) => {
  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "alert-triangle"
      : "info";

  const colors = {
    success: "#28a745",
    error: "#dc3545",
    info: "#007bff",
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={alertStyles.overlay}>
        <View style={alertStyles.box}>
          <Feather name={icon} size={40} color={colors[type]} />
          <Text style={[alertStyles.title, { color: colors[type] }]}>{title}</Text>
          <Text style={alertStyles.message}>{message}</Text>
          <TouchableOpacity
            style={[alertStyles.btn, { backgroundColor: colors[type] }]}
            onPress={onClose}
          >
            <Text style={alertStyles.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const alertStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  message: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
    marginVertical: 10,
  },
  btn: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function TripRegistrationScreen() {
  const navigation = useNavigation();

  const [token, setToken] = useState(null);
  const [fishermanId, setFishermanId] = useState("");
  const [boats, setBoats] = useState([]);
  const [selectedBoat, setSelectedBoat] = useState("");
  const [numFishermen, setNumFishermen] = useState(1);
  const [memberIds, setMemberIds] = useState([""]);
  const [heading, setHeading] = useState(null);
  const [location, setLocation] = useState(null);
  const [isCompassVisible, setIsCompassVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });
  const [tripSuccess, setTripSuccess] = useState({
    visible: false,
    boatName: "",
    fishermen: 0,
  });

  const showAlert = (title, message, type = "info") => {
    setAlertData({ visible: true, title, message, type });
  };

  // ---------------- Initialization ----------------
  useEffect(() => {
    (async () => {
      const auth = await AsyncStorage.getItem("authData");
      if (auth) {
        const parsed = JSON.parse(auth);
        setToken(parsed.token);
        setFishermanId(parsed.userId);
        fetchBoats(parsed.userId);
      }
    })();
  }, []);

  const fetchBoats = async (id) => {
    if (!id) return;
    try {
      const res = await axios.get(
        `${AUTH_BASE}/api/Boat/viewBoatRegRequestsMade/${id}`
      );
      if (Array.isArray(res.data)) setBoats(res.data);
    } catch (e) {
      showAlert("Error", "Failed to fetch boats.", "error");
    }
  };

  // ---------------- Compass ----------------
  useEffect(() => {
    let sub;
    if (isCompassVisible) {
      sub = Magnetometer.addListener(({ x, y }) => {
        if (isFinite(x) && isFinite(y)) {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
        }
      });
      Magnetometer.setUpdateInterval(300);
    }
    return () => {
      if (sub) sub.remove();
    };
  }, [isCompassVisible]);

  const handleConfirmDirection = () => {
    showAlert("Direction Selected", `${heading.toFixed(0)}° North`, "success");
    setIsCompassVisible(false);
  };

  // ---------------- Fishermen Selector ----------------
  const updateNumFishermen = (count) => {
    setNumFishermen(count);
    const updated = Array(count)
      .fill("")
      .map((_, i) => memberIds[i] || "");
    setMemberIds(updated);
  };

  const handleMemberChange = (text, idx) => {
    const arr = [...memberIds];
    arr[idx] = text;
    setMemberIds(arr);
  };

  // ---------------- Map ----------------
  const handleViewLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Denied", "Location permission is required.", "error");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setIsMapVisible(true);
    } catch (e) {
      showAlert("Error", "Failed to get current location", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleHideLocation = () => setIsMapVisible(false);

  // ---------------- Submit ----------------
  const handleSubmit = async () => {
    if (loading) return;

    if (!selectedBoat)
      return showAlert("Missing Field", "Please select a boat.", "error");
    if (!heading)
      return showAlert("Missing Field", "Please select direction.", "error");
    if (!location)
      return showAlert("Missing Field", "Please fetch current location.", "error");

    const boat = boats.find((b) => b._id === selectedBoat);
    if (numFishermen > boat.capacity) {
      return showAlert("Capacity Error", "Exceeded boat capacity.", "error");
    }

    if (memberIds.some((id) => !id)) {
      return showAlert("Missing Data", "Please fill all fisherman IDs.", "error");
    }

    const data = {
      boat: selectedBoat,
      numberOfParticipants: numFishermen,
      participantIds: memberIds,
      startingLocation: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      heading,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${AUTH_BASE}/api/Trip/registerTrip`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 201) {
        const boat = boats.find((b) => b._id === selectedBoat);
        setTripSuccess({
          visible: true,
          boatName: boat.boatName,
          fishermen: numFishermen,
        });
      }
    } catch (e) {
      // ✅ Show backend-provided message if available
      if (e.response && e.response.data && e.response.data.message) {
        showAlert("Trip Error", e.response.data.message, "error");
      } else if (e.response && e.response.data && e.response.data.errors) {
        showAlert("Validation Error", e.response.data.errors.join("\n"), "error");
      } else {
        showAlert("Error", "Something went wrong during submission.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Trip Registration</Text>

      {/* Boat selection */}
      <View style={styles.card}>
        <Text style={styles.label}>Select Boat</Text>

        {Platform.OS === "ios" ? (
          <TouchableOpacity
            style={styles.iosDropdown}
            onPress={() => {
              const boatOptions = boats.map((b) => b.boatName);
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: ["Cancel", ...boatOptions],
                  cancelButtonIndex: 0,
                  userInterfaceStyle: "light",
                },
                (index) => {
                  if (index > 0) {
                    setSelectedBoat(boats[index - 1]._id);
                  }
                }
              );
            }}
          >
            <Text style={styles.iosDropdownText}>
              {selectedBoat
                ? boats.find((b) => b._id === selectedBoat)?.boatName
                : "-- Select a Boat --"}
            </Text>
            <Feather name="chevron-down" size={18} color="#555" />
          </TouchableOpacity>
        ) : (
          <View style={styles.dropdown}>
            <Picker
              selectedValue={selectedBoat}
              onValueChange={(v) => setSelectedBoat(v)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select a Boat --" value="" />
              {boats.map((b) => (
                <Picker.Item key={b._id} label={b.boatName} value={b._id} />
              ))}
            </Picker>
          </View>
        )}

        {/* Sidebar Fisherman Selector */}
        <Text style={[styles.label, { marginTop: 15 }]}>Number of Fishermen</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsSidebarVisible(true)}
        >
          <Feather name="users" size={22} color="#fff" />
          <Text style={styles.btnText}>Select ({numFishermen})</Text>
        </TouchableOpacity>

        {/* Fisherman IDs */}
        {memberIds.map((id, idx) => (
          <View key={idx} style={{ marginTop: 10 }}>
            <Text style={styles.label}>Fisherman {idx + 1} ID</Text>
            <TextInput
              value={id}
              onChangeText={(t) => handleMemberChange(t, idx)}
              placeholder="Enter Fisherman ID"
              style={styles.input}
            />
          </View>
        ))}
      </View>

      {/* Direction & Location */}
      <View style={styles.card}>
        <Text style={styles.label}>Direction</Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => setIsCompassVisible(true)}
        >
          <Feather name="navigation" size={22} color="#fff" />
          <Text style={styles.btnText}>Select Direction</Text>
        </TouchableOpacity>

        {heading && (
          <Text style={styles.infoText}>{heading.toFixed(0)}° N Selected</Text>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Current Location</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <TouchableOpacity style={styles.iconButton} onPress={handleViewLocation}>
            <Feather name="eye" size={22} color="#fff" />
            <Text style={styles.btnText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#999" }]}
            onPress={handleHideLocation}
          >
            <Feather name="eye-off" size={22} color="#fff" />
            <Text style={styles.btnText}>Hide</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color="#007bff" style={{ marginTop: 10 }} />}

        {isMapVisible && location && (
          <MapView style={styles.map} region={location}>
            <Marker coordinate={location} />
          </MapView>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="check-circle-outline" size={22} color="#fff" />
            <Text style={styles.btnText}>Register Trip</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Compass Modal */}
      <Modal visible={isCompassVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Your Direction</Text>
            <View style={styles.compassOuter}>
              <View style={styles.compassInner}>
                <Image
                  source={require("../assets/arrow.png")}
                  style={[styles.arrow, { transform: [{ rotate: `${heading || 0}deg` }] }]}
                  resizeMode="contain"
                />
              </View>
            </View>
            <Text style={styles.degreeText}>
              {heading ? `${heading.toFixed(0)}° N` : "Calibrating..."}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
                onPress={() => setIsCompassVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007bff" }]}
                onPress={handleConfirmDirection}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sidebar Fisherman Selector Modal */}
      <Modal visible={isSidebarVisible} animationType="slide" transparent>
        <View style={styles.sidebarOverlay}>
          <View style={styles.sidebarBox}>
            <Text style={styles.sidebarTitle}>Select Number of Fishermen</Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.verticalSlider}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={numFishermen}
                minimumTrackTintColor="#007bff"
                maximumTrackTintColor="#ccc"
                thumbTintColor="#007bff"
                onValueChange={setNumFishermen}
              />
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{numFishermen}</Text>
              </View>
            </View>
            <View style={styles.sidebarButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#999" }]}
                onPress={() => setIsSidebarVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#007bff" }]}
                onPress={() => {
                  updateNumFishermen(numFishermen);
                  setIsSidebarVisible(false);
                }}
              >
                <Text style={styles.modalBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Trip Success Modal */}
      <Modal visible={tripSuccess.visible} animationType="fade" transparent>
        <View style={styles.successOverlay}>
          <View style={styles.successBox}>
            <Feather name="check-circle" size={70} color="#28a745" />
            <Text style={styles.successTitle}>Trip Registered!</Text>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.successOkButton}
              onPress={() => {
                setTripSuccess({ ...tripSuccess, visible: false });
                navigation.replace("Fisherman", { token, userId: fishermanId });
              }}
            >
              <Text style={styles.successOkText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <AppAlert
        visible={alertData.visible}
        title={alertData.title}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, visible: false })}
      />
    </ScrollView>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingTop: 50 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#222",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    margin: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontWeight: "600", color: "#333", marginBottom: 5 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  iosDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fdfdfd",
    marginBottom: 10,
  },
  iosDropdownText: {
    fontSize: 16,
    color: "#333",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fdfdfd",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    gap: 8,
  },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  infoText: { textAlign: "center", marginTop: 8, color: "#333" },
  map: {
    height: 230,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  submitButton: {
    backgroundColor: "#28a745",
    marginHorizontal: 15,
    marginBottom: 40,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 15 },
  compassOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  compassInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
  },
  arrow: { width: 120, height: 120, tintColor: "#007bff" },
  degreeText: { fontSize: 20, fontWeight: "bold", color: "#007bff", marginVertical: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", width: "100%" },
  modalBtn: {
    flex: 1,
    marginHorizontal: 30,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  sidebarBox: {
    width: "70%",
    height: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    marginBottom: 30,
  },
  verticalSlider: {
    width: 300,
    height: 40,
    transform: [{ rotate: "-90deg" }],
  },
  numberCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  sidebarButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  successBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
    elevation: 10,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#28a745",
    marginTop: 15,
  },
  successOkButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 26,
    borderRadius: 25,
    marginTop: 16,
  },
  successOkText: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "bold",
  },
});
