import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Platform,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
//import AsyncStorage from "@react-native-async-storage/async-storage";
import { ensureProfile } from "../api/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { updateBoatLocation, sendSOS as apiSendSOS } from "../api/client";

const { width, height } = Dimensions.get("window");

export default function GPSTrackingScreen({ navigation }) {
  const mapRef = useRef(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const [boatId, setBoatId] = useState(null); // nationalId stored as boatId in BE
  const [myPos, setMyPos] = useState(null); // { latitude, longitude }
  //const [sosActive, setSosActive] = useState(false);
  const [sending, setSending] = useState(false);
  const [idKey, setIdKey] = useState(null);

  // --- UI: SOS confirm & 5s countdown (arming) ---
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [arming, setArming] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const armTimer = useRef(null);

  // --- UI: Success / error notice banner ---
  const [notice, setNotice] = useState(null); // { type: 'success'|'error'|'info', text: string }
  const noticeAnim = useRef(new Animated.Value(0)).current;

  const showNotice = (type, text) => {
    setNotice({ type, text });
    Animated.timing(noticeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(noticeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start(() => {
          setNotice(null);
        });
      }, 3200);
    });
  };

  const startArming = () => {
    setArming(true);
    setCountdown(5);
    if (armTimer.current) clearInterval(armTimer.current);
    armTimer.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (armTimer.current) clearInterval(armTimer.current);
          armTimer.current = null;
          setArming(false);
          setConfirmVisible(false);
          // fire the SOS
          doSendSOS();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancelArming = () => {
    if (armTimer.current) clearInterval(armTimer.current);
    armTimer.current = null;
    setArming(false);
    setCountdown(5);
  };

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (armTimer.current) clearInterval(armTimer.current);
    };
  }, []);

  // read auth once to get boatId (nationalId)
  /* useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("auth");
        const auth = JSON.parse(raw || "{}");
        const id =
          auth?.user?.nationalId || auth?.boatId || auth?.userId || "BOAT_123"; // final fallback
        setBoatId(id);
        console.log("[gps] boatId:", id);
      } catch (e) {
        console.log("[gps] failed to load auth:", e?.message);
      }
    })();
  }, []); */
  useEffect(() => {
    (async () => {
      const auth = await ensureProfile();
      const id = auth.userId || "UNKNOWN";
      setIdKey(id);
      setBoatId(id);
      console.log("[gps] idKey:", id);
    })();
  }, []);

  // SOS pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // get location once; send initial update if we already know boatId
  useEffect(() => {
    (async () => {
      if (!boatId) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please enable location services.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const coord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setMyPos(coord);

      /*if (boatId) {
        try {
          console.log("[gps] initial update →", coord);
          await updateBoatLocation(boatId, coord.latitude, coord.longitude);
        } catch (e) {
          console.log("[gps] initial update failed:", e?.message);
        }
      } */
      try {
        console.log("[gps] initial update →", { boatId, ...coord });
        await updateBoatLocation(boatId, coord.latitude, coord.longitude);
      } catch (e) {
        console.log("[gps] initial update failed:", e?.message);
      }
    })();
  }, [boatId]);

  // push location every 60s (single request at a time)
  useEffect(() => {
    if (!boatId) return;
    let busy = false;
    const iv = setInterval(async () => {
      try {
        if (busy) return;
        busy = true;
        const pos = await Location.getCurrentPositionAsync({});
        const coord = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setMyPos(coord);
        console.log("[gps] tick update →", coord);
        await updateBoatLocation(boatId, coord.latitude, coord.longitude);
      } catch (e) {
        console.log("[gps] tick update failed:", e?.message);
      } finally {
        busy = false;
      }
    }, 60000);
    return () => clearInterval(iv);
  }, [boatId]);

  const recenter = () => {
    if (!myPos || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { ...myPos, latitudeDelta: 0.045, longitudeDelta: 0.045 },
      450
    );
  };

  const confirmSendSOS = () => {
    if (!boatId || !myPos) {
      Alert.alert("Missing data", "Boat ID or location not ready yet.");
      return;
    }
    // Open our custom confirmation sheet
    cancelArming(); // reset state
    setConfirmVisible(true);
  };

  const doSendSOS = async () => {
    if (sending) return;
    setSending(true);
    try {
      console.log("[gps] SOS →", { boatId, ...myPos });
      await apiSendSOS(boatId, myPos.latitude, myPos.longitude);
      showNotice("success", "Marine Police have been notified. Stay safe.");
    } catch (e) {
      console.log("[gps] SOS error:", e?.message);
      showNotice("error", "Failed to send SOS. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!myPos) {
    return (
      <View className="flex-1 bg-seaGreen justify-center items-center">
        <Text className="text-white text-lg">Getting your location…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      style={{ paddingTop: 6 }}
    >
      {/* Header */}
      <View className="px-4 pb-2 items-center">
        <Text className="text-[20px] font-extrabold text-blue text-center">
          Report Center
        </Text>
        <Text className="text-[12px] text-[#6E8CFB99] text-center mt-0.5">
          SOS • New Report • My Reports
        </Text>

        <View className="bg-lightPurple/80 rounded-full px-3 py-1 mt-2">
          <Text className="text-blue text-[11px] font-semibold">Live</Text>
        </View>
      </View>
      {/* Notice banner (success / error) */}
      {notice && (
        <Animated.View
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor:
              notice?.type === "success"
                ? "#10B981"
                : notice?.type === "error"
                  ? "#EF4444"
                  : "#3C467B",
            opacity: noticeAnim,
            transform: [
              {
                translateY: noticeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            {notice?.type === "success"
              ? "SOS Sent"
              : notice?.type === "error"
                ? "SOS Failed"
                : "Notice"}
          </Text>
          <Text style={{ color: "#fff", opacity: 0.95, marginTop: 2 }}>
            {notice?.text}
          </Text>
        </Animated.View>
      )}
      {/* Map */}
      <View
        className="mx-4 shadow"
        style={{
          width: width - 32,
          height: height * 0.48,
          borderRadius: 22,
          borderWidth: 1,
          borderColor: "#50589C33",
          overflow: "hidden",
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 6,
        }}
      >
        <MapView
          ref={mapRef}
          style={{ width: "100%", height: "100%" }}
          showsUserLocation={false} // no blue dot
          showsCompass // keep the compass
          initialRegion={{
            latitude: myPos.latitude,
            longitude: myPos.longitude,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
          }}
          onMapReady={recenter}
        >
          {/* Custom boat marker */}
          <Marker coordinate={myPos} title="Your Boat">
            <View className="items-center">
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow">
                <MaterialCommunityIcons
                  name="ferry"
                  size={20}
                  color="#3C467B"
                />
              </View>
              <Text className="text-[10px] mt-1 text-blue">You</Text>
            </View>
          </Marker>
        </MapView>

        {/* On-map coordinate chip (UI-only) */}
        <View
          className="absolute left-3 top-3 bg-white px-3 py-2 rounded-2xl"
          style={{
            borderWidth: 1,
            borderColor: "#50589C33",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-[11px] text-blue font-semibold">
            Your Position
          </Text>
          <Text className="text-[12px] text-darkBlue mt-0.5">
            {myPos.latitude.toFixed(5)}, {myPos.longitude.toFixed(5)}
          </Text>
        </View>

        {/* Recenter */}
        <TouchableOpacity
          onPress={recenter}
          className="absolute right-3 top-3 bg-white rounded-full w-11 h-11 items-center justify-center"
          style={{
            borderWidth: 1,
            borderColor: "#50589C33",
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
          activeOpacity={0.85}
          accessibilityLabel="Recenter map to my location"
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={22}
            color="#3C467B"
          />
        </TouchableOpacity>
      </View>

      {/* Coords */}
      <View className="px-4 mt-2">
        <Text className="text-darkBlue font-semibold">
          Your Position: {myPos.latitude.toFixed(6)},{" "}
          {myPos.longitude.toFixed(6)}
        </Text>
      </View>

      {/* SOS */}
      <View className="px-4 mt-4">
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <TouchableOpacity
            onPress={confirmSendSOS}
            disabled={sending}
            activeOpacity={0.9}
            accessibilityLabel="Send SOS emergency alert"
            className="rounded-2xl overflow-hidden"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={["#EF4444", "#DC2626"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: "center" }}
            >
              <Text className="text-white text-[18px] font-extrabold">
                🚨 SOS – EMERGENCY
              </Text>
              <Text className="text-white/90 text-[12px] mt-1">
                Sends your live location to Marine Police
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Secondary actions */}
      <View className="px-4 mt-8">
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={() => navigation.navigate("ReportTypePicker")}
            accessibilityLabel="Create new report"
            className="flex-1 mr-3 bg-white rounded-2xl py-4 items-center"
            style={{
              borderWidth: 1,
              borderColor: "#50589C33",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name="note-plus"
              size={20}
              color="#50589C"
            />
            <Text className="text-blue font-bold mt-1">New Report</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">
              Hazard or Violation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("MyReports")}
            accessibilityLabel="View my reports"
            className="flex-1 ml-3 bg-white rounded-2xl py-4 items-center"
            style={{
              borderWidth: 1,
              borderColor: "#50589C33",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons
              name="folder-account"
              size={20}
              color="#50589C"
            />
            <Text className="text-blue font-bold mt-1">My Reports</Text>
            <Text className="text-[#6E8CFB99] text-[11px] mt-0.5">
              View & edit
            </Text>
          </TouchableOpacity>
        </View>

        <View className="h-6" />
      </View>
      {/* SOS Confirmation & Arming Modal */}
      <Modal
        transparent
        visible={confirmVisible}
        animationType="fade"
        onRequestClose={() => {
          setConfirmVisible(false);
          cancelArming();
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 20,
            }}
          >
            {/* Handle bar */}
            <View
              style={{
                alignSelf: "center",
                width: 44,
                height: 5,
                borderRadius: 3,
                backgroundColor: "#E5E7EB",
                marginBottom: 12,
              }}
            />

            {/* Title */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#FEE2E2",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="alert-octagon"
                  size={18}
                  color="#DC2626"
                />
              </View>
              <Text
                style={{ fontSize: 18, fontWeight: "800", color: "#1F2937" }}
              >
                Emergency SOS
              </Text>
            </View>

            {/* Warning text (nicer layout) */}
            <View
              style={{
                backgroundColor: "#FFF7ED",
                borderColor: "#FED7AA",
                borderWidth: 1,
                borderRadius: 14,
                padding: 12,
                marginBottom: 14,
              }}
            >
              <Text
                style={{ color: "#9A3412", fontWeight: "700", marginBottom: 4 }}
              >
                Read before sending:
              </Text>
              <Text style={{ color: "#9A3412" }}>
                • This will share your{" "}
                <Text style={{ fontWeight: "800" }}>live location</Text> with
                Marine Police.{"\n"}• Use{" "}
                <Text style={{ fontWeight: "800" }}>ONLY</Text> for real
                emergencies.{"\n"}• False SOS can lead to{" "}
                <Text style={{ fontWeight: "800" }}>penalties</Text>.
              </Text>
            </View>

            {/* Actions */}
            {!arming ? (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => {
                    setConfirmVisible(false);
                    cancelArming();
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    marginRight: 8,
                    alignItems: "center",
                    backgroundColor: "#fff",
                  }}
                >
                  <Text style={{ fontWeight: "700", color: "#374151" }}>
                    Not Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={startArming}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    overflow: "hidden",
                    marginLeft: 8,
                  }}
                  activeOpacity={0.92}
                >
                  <LinearGradient
                    colors={["#EF4444", "#DC2626"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 12, alignItems: "center" }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      Send SOS
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Countdown UI */}
                <View
                  style={{
                    alignSelf: "center",
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    borderWidth: 6,
                    borderColor: "#FECACA",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 30, fontWeight: "900", color: "#DC2626" }}
                  >
                    {countdown}
                  </Text>
                </View>
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    marginBottom: 10,
                  }}
                >
                  Sending SOS in{" "}
                  <Text style={{ fontWeight: "800", color: "#DC2626" }}>
                    {countdown}s
                  </Text>
                  …
                </Text>

                <TouchableOpacity
                  onPress={cancelArming}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                    backgroundColor: "#FEF2F2",
                  }}
                  activeOpacity={0.9}
                >
                  <Text style={{ color: "#B91C1C", fontWeight: "800" }}>
                    Cancel SOS
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
