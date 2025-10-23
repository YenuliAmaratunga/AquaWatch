import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import axios from "axios";
import * as Location from "expo-location";
import * as Animatable from "react-native-animatable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WeatherForecastScreen() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [forecastType, setForecastType] = useState("Hourly");
  const [showTips, setShowTips] = useState(false);
  const navigation = useNavigation();

  const fetchWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Location permission denied");
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const res = await axios.get(
        `https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0/api/weather/forecast?lat=${latitude}&lon=${longitude}`
      );
      if (res.data.success) {
        setWeather(res.data.data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error fetching weather data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchWeather();
  }, []);

  const SkeletonCard = ({ style }) => (
    <Animatable.View
      animation="pulse"
      iterationCount="infinite"
      style={[
        {
          backgroundColor: "#E5E7EB",
          borderRadius: 20,
          height: 180,
          width: "100%",
        },
        style,
      ]}
    />
  );

  const SkeletonRow = () => (
    <View style={{ flexDirection: "row", marginVertical: 8 }}>
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={{
          backgroundColor: "#E5E7EB",
          borderRadius: 12,
          height: 20,
          width: 20,
          marginRight: 8,
        }}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        style={{
          backgroundColor: "#E5E7EB",
          borderRadius: 4,
          height: 20,
          width: "60%",
        }}
      />
    </View>
  );

  if (loading)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <Animatable.View animation="pulse" iterationCount="infinite">
          <MaterialCommunityIcons
            name="weather-sunny"
            size={70}
            color="#3C467B"
            style={{ marginBottom: 10 }}
          />
        </Animatable.View>
        <Animatable.Text
          animation="fadeIn"
          iterationCount="infinite"
          duration={2000}
          style={{
            color: "#3C467B",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 8,
          }}
        >
          Fetching Weather Data...
        </Animatable.Text>
        <ActivityIndicator
          size="large"
          color="#636CCB"
          style={{ marginTop: 12 }}
        />
      </View>
    );

  if (!weather)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: 20,
        }}
      >
        <Animatable.View animation="fadeIn" duration={800}>
          <MaterialCommunityIcons
            name="weather-cloudy-alert"
            size={70}
            color="#3C467B"
            style={{ marginBottom: 16, alignSelf: "center" }}
          />
          <Text
            style={{
              color: "#3C467B",
              fontSize: 18,
              textAlign: "center",
              marginBottom: 12,
              fontWeight: "600",
            }}
          >
            Unable to load weather data
          </Text>
          <Text
            style={{
              color: "#6B7280",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Please check your internet connection and location permissions
          </Text>
          <TouchableOpacity
            onPress={fetchWeather}
            style={{
              backgroundColor: "#3C467B",
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Try Again
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    );

  const { weather: currentWeather, marine } = weather;
  const locationName = currentWeather?.location ?? "Unknown";

  const getWaveColor = (h) => {
    if (!h) return "#fff";
    if (h > 3) return "#EF4444"; // red
    if (h > 1.5) return "#FACC15"; // yellow
    return "#000435"; // dark blue
  };

  const getWindColor = (w) => {
    if (!w) return "#fff";
    if (w > 40) return "#EF4444";
    if (w > 20) return "#FBBF24";
    return "#3C467B";
  };

  const Row = ({ icon, label, value, colorClass, labelColor, iconColor }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        alignItems: "center",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={iconColor ?? "#fff"}
        />
        <Text
          style={{
            color: labelColor ?? "#fff",
            fontSize: 16,
            fontWeight: "600",
            marginLeft: 8,
          }}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{ fontSize: 16, fontWeight: "700", color: colorClass ?? "#fff" }}
      >
        {value}
      </Text>
    </View>
  );

  const getTimeString = (idx) => {
    const now = new Date();
    const futureTime = new Date(now.getTime() + idx * 60 * 60 * 1000);
    return futureTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const WaveHeightIndicator = ({ height }) => {
    const percentage = Math.min((height / 3) * 100, 100); // 3m as max height
    const color = getWaveColor(height);
    return (
      <View
        style={{
          height: 60,
          width: 8,
          backgroundColor: "#E5E7EB",
          borderRadius: 4,
          marginRight: 12,
        }}
      >
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${percentage}%`,
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </View>
    );
  };

  const renderHourly = () => {
    if (!marine?.hourly?.wave_height) return <Text>No hourly data</Text>;
    const hoursToShow = marine.hourly.wave_height.slice(0, 7);
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {hoursToShow.map((wave, idx) => (
          <Animatable.View key={idx} animation="fadeIn" delay={idx * 100}>
            <LinearGradient
              colors={["#636CCB", "#6E8CFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 170,
                margin: 6,
                padding: 14,
                borderRadius: 20,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <WaveHeightIndicator height={wave} />
                <View>
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    {getTimeString(idx)}
                  </Text>
                  <Text style={{ color: "#E5E7EB", fontSize: 12 }}>
                    {idx === 0 ? "Now" : `+${idx}h`}
                  </Text>
                </View>
              </View>
              <Row
                icon="waves"
                label="Waves"
                value={`${wave ?? "--"} m`}
                colorClass={getWaveColor(wave)}
              />
              <Row
                icon="navigation-variant"
                label="Current"
                value={`${marine.hourly.ocean_current_velocity[idx] ?? "--"} m/s`}
              />
              <Row
                icon="compass"
                label="Direction"
                value={`${marine.hourly.wave_direction[idx] ?? "--"}°`}
              />
            </LinearGradient>
          </Animatable.View>
        ))}
      </ScrollView>
    );
  };

  const getDayString = (idx) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date();
    const futureDate = new Date(today.getTime() + idx * 24 * 60 * 60 * 1000);
    return idx === 0 ? "Today" : days[futureDate.getDay()];
  };

  const renderDaily = () => {
    if (!marine?.daily?.wave_height_max) return <Text>No daily data</Text>;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {marine.daily.wave_height_max.map((waveMax, idx) => (
          <Animatable.View key={idx} animation="fadeIn" delay={idx * 100}>
            <LinearGradient
              colors={["#636CCB", "#6E8CFB"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 187,
                margin: 6,
                padding: 14,
                borderRadius: 20,
                elevation: 4,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <WaveHeightIndicator height={waveMax} />
                <View>
                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                  >
                    {getDayString(idx)}
                  </Text>
                  <Text style={{ color: "#E5E7EB", fontSize: 12 }}>
                    {idx === 0 ? "Today" : `Day ${idx + 1}`}
                  </Text>
                </View>
              </View>
              <Row
                icon="waves"
                label="Waves"
                value={`${waveMax} m`}
                colorClass={getWaveColor(waveMax)}
              />
              <Row
                icon="compass"
                label="Direction"
                value={`${marine.daily.wind_wave_direction_dominant[idx] ?? "--"}°`}
              />
              <Row
                icon="weather-windy"
                label="Wind Wave "
                value={`${marine.daily.wind_wave_height_max[idx] ?? "--"} m`}
              />
            </LinearGradient>
          </Animatable.View>
        ))}
      </ScrollView>
    );
  };

  const generateTips = () => {
    const tips = [];
    if (currentWeather?.windSpeed > 30) {
      tips.push({
        icon: "weather-windy",
        text: "Strong winds detected! Avoid sailing in high winds above 30 km/h.",
      });
    } else if (currentWeather?.windSpeed > 15) {
      tips.push({
        icon: "weather-windy",
        text: "Moderate winds — use smaller sails and stay close to shore.",
      });
    } else {
      tips.push({
        icon: "weather-windy",
        text: "Winds are calm — good conditions for short trips.",
      });
    }

    if (marine?.current?.wave_height > 2.5) {
      tips.push({
        icon: "waves",
        text: "High waves (over 2.5m)! Avoid departure until calmer seas.",
      });
    } else if (marine?.current?.wave_height > 1.5) {
      tips.push({
        icon: "waves",
        text: "Moderate waves — proceed with caution.",
      });
    } else {
      tips.push({ icon: "waves", text: "Wave conditions are calm and safe." });
    }

    if (currentWeather?.conditions?.toLowerCase().includes("rain")) {
      tips.push({
        icon: "weather-pouring",
        text: "Rainy conditions expected — ensure proper visibility gear.",
      });
    }

    tips.push({
      icon: "map-marker-alert",
      text: "Always log your route and check local alerts before departure.",
    });
    return tips;
  };

  const quickTips = generateTips();
  const toggleTips = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowTips(!showTips);
  };

  const GradientActionButton = ({ onPress, text }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={{
        borderRadius: 25,
        overflow: "hidden",
        elevation: 5,
        width: "100%",
        alignSelf: "center",
        marginVertical: 16,
      }}
    >
      <LinearGradient
        colors={["#6E8CFB", "#BABCFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 16,
          alignItems: "center",
          borderRadius: 25,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name="map-search-outline"
          size={22}
          color="#fff"
        />
        <Text
          style={{
            color: "#fff",
            fontWeight: "800",
            fontSize: 17,
            marginLeft: 8,
          }}
        >
          {text}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingTop: 48,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animatable.View
          animation="fadeIn"
          duration={800}
          style={{ width: "100%" }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#3C467B",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Forecast for {locationName}, Sri Lanka
          </Text>
        </Animatable.View>

        {(currentWeather?.windSpeed > 30 ||
          marine?.current?.wave_height > 2.5) && (
          <View
            style={{
              backgroundColor: "#EF4444",
              borderRadius: 16,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              ⚠️ Dangerous conditions ahead! Sail with caution
            </Text>
          </View>
        )}

        {/* Current Conditions */}
        <Animatable.View
          animation="fadeIn"
          duration={800}
          style={{
            backgroundColor: "#E0E7FF",
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
            borderWidth: 2,
            borderColor: "#3C467B",
            elevation: 4,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons
              name={
                currentWeather?.conditions?.toLowerCase().includes("rain")
                  ? "weather-pouring"
                  : currentWeather?.conditions?.toLowerCase().includes("cloud")
                    ? "weather-cloudy"
                    : "weather-sunny"
              }
              size={32}
              color="#3C467B"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "#3C467B",
                textAlign: "center",
              }}
            >
              Current Conditions
            </Text>
          </View>
          {lastUpdated && (
            <Text
              style={{
                textAlign: "center",
                color: "#6B7280",
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Text>
          )}
          <View
            style={{
              height: 1,
              backgroundColor: "#3C467B",
              opacity: 0.3,
              marginBottom: 12,
            }}
          />
          <Row
            icon="thermometer"
            label="Temperature"
            value={`${currentWeather?.temperature ?? "--"} °C`}
            labelColor="#3C467B"
            iconColor="#60A5FA"
            colorClass="#3C467B"
          />
          <Row
            icon="weather-windy"
            label="Wind Speed"
            value={`${currentWeather?.windSpeed ?? "--"} km/h`}
            colorClass={getWindColor(currentWeather?.windSpeed)}
            labelColor="#3C467B"
            iconColor="#60A5FA"
          />
          <Row
            icon="weather-cloudy"
            label="Sky"
            value={currentWeather?.conditions ?? "--"}
            labelColor="#3C467B"
            iconColor="#60A5FA"
            colorClass="#3C467B"
          />
          <Row
            icon="waves"
            label="Wave Height"
            value={`${marine?.current?.wave_height ?? "--"} m`}
            colorClass={getWaveColor(marine?.current?.wave_height)}
            labelColor="#3C467B"
            iconColor="#60A5FA"
          />
        </Animatable.View>

        {/* Forecast Type Tabs */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {["Hourly", "Daily"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setForecastType(type)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 8,
                borderRadius: 30,
                margin: 4,
                backgroundColor: forecastType === type ? "#50589C" : "#fff",
                borderWidth: forecastType === type ? 0 : 1,
                borderColor: "#50589C",
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  color: forecastType === type ? "#fff" : "#3C467B",
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Forecast Cards */}
        {forecastType === "Hourly" ? renderHourly() : renderDaily()}

        {/* Quick Tips */}
        <View
          style={{
            backgroundColor: "#50589C",
            borderRadius: 20,
            marginTop: 16,
            marginBottom: 16,
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={toggleTips}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="lightbulb-on-outline"
                size={22}
                color="#fff"
              />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                  marginLeft: 8,
                }}
              >
                {showTips ? "Hide Quick Tips" : "Show Quick Tips"}
              </Text>
            </View>
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {showTips ? "▼" : "▲"}
            </Text>
          </TouchableOpacity>

          {showTips && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
              {quickTips.map((tip, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name={tip.icon}
                    size={20}
                    color="#fff"
                  />
                  <Text style={{ color: "#fff", marginLeft: 8, fontSize: 14 }}>
                    {tip.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* View Route Hazard Map Button */}
        <GradientActionButton
          text="View Route Hazard Map"
          onPress={() => navigation.navigate("RouteHazardMap")}
        />
      </ScrollView>
    </View>
  );
}