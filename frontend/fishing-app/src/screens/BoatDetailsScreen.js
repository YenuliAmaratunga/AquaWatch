import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function BoatDetailsScreen({ route }) {
  const { boat } = route.params;

  // If multiple images exist, use them all; otherwise use a default one
  const images =
    boat.images && boat.images.length > 0
      ? boat.images.map((img) => img.secure_url)
      : [
          "https://cdn-icons-png.flaticon.com/512/1622/1622162.png",
        ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image Carousel */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item }} style={styles.image} />
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent"]}
              style={styles.gradient}
            />
          </View>
        )}
      />

      {/* Title Section */}
      <View style={styles.header}>
        <Text style={styles.boatName}>{boat.boatName}</Text>
        <Text style={styles.status}>Status: {boat.status}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <InfoRow icon="pricetag-outline" label="Boat ID" value={boat._id} />
       
        <InfoRow
          icon="boat-outline"
          label="Boat Type"
          value={boat.boatType || "N/A"}
        />
        <InfoRow
          icon="clipboard-outline"
          label="Registration No"
          value={boat.registrationNumber || "N/A"}
        />
        <InfoRow
          icon="resize-outline"
          label="Length"
          value={`${boat.length || "-"} ft`}
        />
        <InfoRow
          icon="swap-horizontal-outline"
          label="Width"
          value={`${boat.width || "-"} ft`}
        />
        <InfoRow
          icon="cog-outline"
          label="Engine Type"
          value={boat.engineType || "N/A"}
        />
        <InfoRow icon="home-outline" label="Home Port" value={boat.homePort} />
        <InfoRow
          icon="shield-outline"
          label="Insurance No"
          value={boat.insuranceNumber || "N/A"}
        />
      </View>

      {/* Optional: safety equipment section */}
      {boat.safetyEquipment && boat.safetyEquipment.length > 0 && (
        <View style={styles.equipmentContainer}>
          <Text style={styles.sectionTitle}>Safety Equipment</Text>
          {boat.safetyEquipment.map((item, index) => (
            <Text key={index} style={styles.equipmentItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

/* --- Reusable InfoRow Component --- */
function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.iconLabel}>
        <Ionicons name={icon} size={20} color="#007bff" style={{ marginRight: 8 }} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* --- Styles --- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  imageContainer: {
    width,
    height: 250,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  header: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  boatName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0b3954",
  },
  status: {
    fontSize: 16,
    color: "#007bff",
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  iconLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  value: {
    fontSize: 15,
    color: "#555",
    flexShrink: 1,
    textAlign: "right",
  },
  equipmentContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0b3954",
    marginBottom: 8,
  },
  equipmentItem: {
    fontSize: 15,
    color: "#444",
    marginLeft: 10,
    marginVertical: 2,
  },
});
