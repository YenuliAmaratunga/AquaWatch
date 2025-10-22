import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import TripRegistrationScreen from "./TripRegistrationScreen";
import TripsScreen from "./TripsScreen";

export default function TripTabsScreen() {
  const [activeTab, setActiveTab] = useState("register"); // default tab
  const [formVisible, setFormVisible] = useState(true); // keep registration form mounted

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trip Management</Text>
      </View>

      {/* ---------- TAB BAR ---------- */}
      <View style={styles.tabContainer}>
        {[
          { key: "register", label: "Register New Trip" },
          { key: "view", label: "View Trips" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ---------- TAB CONTENT ---------- */}
      <View style={{ flex: 1 }}>
        {/* Tab 1 - Register Trip */}
        {formVisible && (
          <View
            style={[
              styles.registerContainer,
              { display: activeTab === "register" ? "flex" : "none" },
            ]}
          >
            <TripRegistrationScreen />
          </View>
        )}

        {/* Tab 2 - View Trips */}
        {activeTab === "view" && (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View>
              <Text style={styles.sectionHeader}>Your Trips</Text>
              <Text style={styles.infoText}>
                Below are your active and past fishing trips.
              </Text>
              <TripsScreen />
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingTop: 40 },

  /* ---------- HEADER ---------- */
  header: {
    paddingVertical: 16,
    backgroundColor: "#007bff",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
  },

  /* ---------- TAB BAR ---------- */
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 30,
    marginHorizontal: 10,
    marginVertical: 15,
    padding: 5,
  },
  tabButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  activeTabButton: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  tabText: {
    color: "#111827",
    fontWeight: "500",
    fontSize: 13,
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "600",
  },

  /* ---------- CONTENT ---------- */
  contentContainer: {
    padding: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 15,
  },
  registerContainer: {
    flex: 1,
  },
});
