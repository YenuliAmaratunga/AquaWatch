import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const AUTH_BASE =
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";

export default function TripsScreen() {

  const navigation = useNavigation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current"); 

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const authData = await AsyncStorage.getItem("authData");
      const parsed = JSON.parse(authData);
      const res = await axios.get(`${AUTH_BASE}/api/Trip/myTrips`, {
        headers: { Authorization: `Bearer ${parsed.token}` },
      });
      setTrips(res.data.trips || []);
    } catch (error) {
      console.error("Error fetching trips:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async (tripId) => {
    try {
      const authData = await AsyncStorage.getItem("authData");
      const parsed = JSON.parse(authData);
      await axios.put(
        `${AUTH_BASE}/api/trip/end`,
        {
          tripId,
          endDate: new Date(),
          endTime: new Date().toLocaleTimeString(),
        },
        {
          headers: { Authorization: `Bearer ${parsed.token}` },
        }
      );
      fetchTrips(); // refresh
    } catch (error) {
      console.error("Error ending trip:", error.message);
    }
  };

  const filteredTrips =
    activeTab === "current"
      ? trips.filter((t) => !t.endDate)
      : trips.filter((t) => t.endDate);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#007bff" size="large" />
        <Text>Loading trips...</Text>
      </View>
    );
  }

  const renderTrip = ({ item }) => (
    <View style={styles.tripCard}>
      <Text style={styles.tripTitle}>{item.boat.boatName}</Text>
      <Text style={styles.tripSub}>Participants: {item.numberOfParticipants}</Text>
      <Text style={styles.tripSub}>
        Start: {new Date(item.startDate).toLocaleDateString()}{" "}
        {item.startTime || ""}
      </Text>
      {item.endDate && (
        <Text style={styles.tripSub}>
          End: {new Date(item.endDate).toLocaleDateString()}{" "}
          {item.endTime || ""}
        </Text>
      )}

      <View style={styles.tripButtons}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: "#007bff" }]}
          onPress={() => navigation.navigate("TripDetails", { trip: item })}
        >
          <Feather name="info" color="#fff" size={16} />
          <Text style={styles.btnText}>View More</Text>
        </TouchableOpacity>

        {!item.endDate && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: "#dc3545" }]}
            onPress={() => handleEndTrip(item._id)}
          >
            <Feather name="flag" color="#fff" size={16} />
            <Text style={styles.btnText}>End Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Trips</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "current" && styles.activeTab]}
          onPress={() => setActiveTab("current")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "current" && styles.activeTabText,
            ]}
          >
            Current Trips
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Trip History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip list */}
      {filteredTrips.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: "#666" }}>
            {activeTab === "current"
              ? "No active trips found"
              : "No past trips yet"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          renderItem={renderTrip}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", paddingHorizontal: 15 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#222",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#e9ecef",
    borderRadius: 10,
    marginBottom: 15,
  },
  tab: { flex: 1, padding: 10, borderRadius: 10 },
  tabText: { textAlign: "center", fontWeight: "500", color: "#555" },
  activeTab: { backgroundColor: "#007bff" },
  activeTabText: { color: "#fff" },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 2,
  },
  tripTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  tripSub: { color: "#555", marginTop: 4 },
  tripButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 5,
  },
  btnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
});
