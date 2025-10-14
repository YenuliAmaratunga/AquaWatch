import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import RegisterBoatScreen from "./RegisterBoatScreen";
import BoatListScreen from "./BoatListScreen";

export default function BoatTabsScreen() {
  const [activeTab, setActiveTab] = useState("register"); // default tab
  const [formVisible, setFormVisible] = useState(true); // keep RegisterBoatScreen mounted

  return (
    <View style={styles.container}>
      {/* ---------- HEADER ---------- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Boat Management</Text>
      </View>

      {/* ---------- TAB BAR ---------- */}
      <View style={styles.tabContainer}>
        {[
          { key: "available", label: "Available Boats" },
          { key: "register", label: "Register New Boat" },
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
        {/* Tab 1 - Available Boats */}
        {activeTab === "available" && (
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View>
              <Text style={styles.sectionHeader}>Available Boats</Text>
              <Text style={styles.infoText}>
                Here you’ll see all your registered boats once they are added.
              </Text>
              <BoatListScreen/>
            </View>
          </ScrollView>
        )}

        {/* Tab 2 - Register Boat */}
        {/* Keep mounted but toggle visibility to preserve form state */}
        {formVisible && (
          <View
            style={[
              styles.registerContainer,
              { display: activeTab === "register" ? "flex" : "none" },
            ]}
          >
            <RegisterBoatScreen />
          </View>
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
    backgroundColor: "#1E3A8A",
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
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
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
    color: "#1E3A8A",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },

  /* ---------- CARD ---------- */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },

  registerContainer: {
    flex: 1,
  },
});
