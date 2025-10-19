import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function TripDetailsScreen({ route }) {
  const { trip } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Feather name="map-pin" size={26} color="#007bff" />
        <Text style={styles.title}>{trip.boat.boatName}</Text>
        <Text style={styles.sub}>
          Registration: {trip.boat.registrationNumber}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Fishermen Count:</Text>
          <Text style={styles.value}>{trip.numberOfParticipants}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Location:</Text>
          <Text style={styles.value}>
            {trip.startingLocation.latitude.toFixed(4)},{" "}
            {trip.startingLocation.longitude.toFixed(4)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Heading:</Text>
          <Text style={styles.value}>{trip.heading}° N</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Start Date & Time:</Text>
          <Text style={styles.value}>
            {new Date(trip.startDate).toLocaleDateString()}{" "}
            {trip.startTime || ""}
          </Text>
        </View>

        {trip.endDate && (
          <View style={styles.section}>
            <Text style={styles.label}>End Date & Time:</Text>
            <Text style={styles.value}>
              {new Date(trip.endDate).toLocaleDateString()}{" "}
              {trip.endTime || ""}
            </Text>
          </View>
        )}

        <Text style={[styles.label, { marginTop: 20 }]}>Participants:</Text>
        {trip.participantIds.map((p) => (
          <Text key={p._id} style={styles.value}>
            • {p.name} ({p.nationalId})
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#222", marginTop: 10 },
  sub: { fontSize: 15, color: "#555", marginBottom: 15 },
  section: { marginVertical: 6 },
  label: { fontWeight: "600", color: "#333" },
  value: { color: "#555", marginTop: 2 },
});
