import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const BASE_URL =
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";

export default function BoatListScreen() {
  const [boats, setBoats] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // ✅ Fetch userId once
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem("authData");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setUserId(parsed.userId);
        }
      } catch (error) {
        console.log("Error reading AsyncStorage:", error);
      }
    };
    fetchUserId();
  }, []);

  // ✅ Fetch boats (runs when userId changes)
  const fetchBoats = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/api/Boat/viewBoatRegRequestsMade/${userId}`
      );
      setBoats(response.data);


    } catch (error) {
      console.log("Error fetching boats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBoats();
  }, [userId]);

  // ✅ Handle Pull-to-Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBoats();
  };

  // ✅ Delete Boat with Alert
  const handleDeleteBoat = (boatId) => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete this boat?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/Boat/delete/${boatId}`);
            Alert.alert("Success", "Boat deleted successfully!");
            fetchBoats(); // refresh list
          } catch (error) {
            console.log("Delete error:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to delete the boat.");
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00aaff" />
      </View>
    );
  }

  if (boats.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "gray" }}>No boats found.</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "rejected":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const renderBoatCard = ({ item }) => (
    <LinearGradient
      colors={["#e0f7fa", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <Image
        source={{
          uri:
            item.images && item.images.length > 0
              ? item.images[0].secure_url
              : "https://cdn-icons-png.flaticon.com/512/1622/1622162.png",
        }}
        style={styles.image}
      />

      <View style={styles.details}>
        <View style={styles.row}>
          <Text style={styles.name}>{item.boatName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status || "Unknown"}
            </Text>
          </View>
        </View>

        <Text style={styles.id}>ID: {item._id}</Text>
        <Text style={styles.infoText}>
          Type: {item.boatType || "N/A"}
        </Text>
      

        {/* Buttons Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007bff" }]}
            onPress={() =>
              navigation.navigate("BoatDetailsScreen", { boat: item })
            }
          >
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#dc3545" }]}
            onPress={() => handleDeleteBoat(item._id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <FlatList
      key={"one-column"}
      data={boats}
      renderItem={renderBoatCard}
      keyExtractor={(item) => item._id}
      nestedScrollEnabled
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
  },
  card: {
    flexDirection: "row",
    borderRadius: 15,
    marginVertical: 10,
    padding: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 80,
    borderRadius: 10,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#0b3954",
  },
  id: {
    fontSize: 13,
    color: "#6c757d",
    marginVertical: 2,
  },
  infoText: {
    fontSize: 13,
    color: "#333",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
