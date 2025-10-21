import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import QRCode from "react-native-qrcode-svg";

export default function TripDetailsScreen({ route }) {
  const { trip } = route.params;
  const [startLocationName, setStartLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    const fetchLocationName = async () => {
      try {
        const { latitude, longitude } = trip.startingLocation;
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result?.length > 0) {
          const loc = result[0];
          const name = `${loc.name || loc.street || "Unknown"}, ${
            loc.city || loc.region || ""
          }, ${loc.country}`;
          setStartLocationName(name);
        } else {
          setStartLocationName("Unknown location");
        }
      } catch (error) {
        console.log(error);
        setStartLocationName("Location unavailable");
      } finally {
        setLoadingLocation(false);
      }
    };
    fetchLocationName();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        }}
        style={styles.header}
        imageStyle={styles.headerImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.boatName}>{trip.boat.boatName}</Text>
          <Text style={styles.boatReg}>Reg No: {trip.boat.registrationNumber}</Text>
        </View>
      </ImageBackground>

      {/* Trip Info */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Feather name="users" size={22} color="#007bff" />
          <Text style={styles.label}>Fishermen:</Text>
          <Text style={styles.value}>{trip.numberOfParticipants}</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="map-pin" size={22} color="#007bff" />
          <Text style={styles.label}>Start Location:</Text>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={styles.value}>{startLocationName}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Feather name="compass" size={22} color="#007bff" />
          <Text style={styles.label}>Heading:</Text>
          <Text style={styles.value}>{trip.heading}° N</Text>
        </View>

        <View style={styles.infoRow}>
          <Feather name="clock" size={22} color="#007bff" />
          <Text style={styles.label}>Start:</Text>
          <Text style={styles.value}>
            {new Date(trip.startDate).toLocaleDateString()} {trip.startTime || ""}
          </Text>
        </View>
      </View>

      {/* Crew Members */}
      <View style={styles.participantsCard}>
        <Text style={styles.participantTitle}>Crew Members</Text>
        {trip.participantIds.map((p) => (
          <Text key={p._id || p.nationalId} style={styles.participant}>
            • {p.name} ({p.nationalId})
          </Text>
        ))}
      </View>

      {/* QR Code */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Trip QR Code</Text>
        {trip.qrData ? (
          <QRCode value={trip.qrData} size={180} color="#000" backgroundColor="#fff" />
        ) : (
          <Text style={styles.noQr}>QR Code not available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eef3f9" },
  header: { height: 220, justifyContent: "flex-end" },
  headerImage: { borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  overlay: {
    backgroundColor: "rgba(0,0,0,0.35)",
    padding: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  boatName: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  boatReg: { fontSize: 15, color: "#dfe6eb" },
  card: {
    margin: 15,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    elevation: 5,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginVertical: 6, gap: 8 },
  label: { fontWeight: "600", color: "#333", flex: 1 },
  value: { color: "#444", flex: 1.5 },
  participantsCard: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },
  participantTitle: { fontSize: 16, fontWeight: "600", color: "#222", marginBottom: 6 },
  participant: { color: "#555", marginLeft: 10, marginTop: 4 },
  qrCard: {
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  qrTitle: { fontSize: 18, fontWeight: "700", color: "#007bff", marginBottom: 10 },
  noQr: { color: "#888", marginVertical: 10 },
});
