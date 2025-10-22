import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

// Mock analytics data - in production, this would come from your backend
const generateMockAnalytics = () => {
  return {
    totalTripsAnalyzed: 127,
    averageRiskScore: 32,
    approvalRate: 89,
    denialRate: 11,
    riskDistribution: {
      low: 64,
      moderate: 32,
      high: 21,
      critical: 10,
    },
    monthlyTrends: [
      { month: "Jan", avgRisk: 28, trips: 18 },
      { month: "Feb", avgRisk: 35, trips: 22 },
      { month: "Mar", avgRisk: 31, trips: 20 },
      { month: "Apr", avgRisk: 38, trips: 25 },
      { month: "May", avgRisk: 29, trips: 19 },
      { month: "Jun", avgRisk: 33, trips: 23 },
    ],
    topRiskFactors: [
      { factor: "Weather Conditions", percentage: 43, count: 54 },
      { factor: "Boat Age", percentage: 28, count: 36 },
      { factor: "Insufficient Fuel", percentage: 19, count: 24 },
      { factor: "Engine Issues", percentage: 10, count: 13 },
    ],
    recentAssessments: [
      {
        id: 1,
        boatName: "Sea Breeze",
        date: "2024-10-20",
        riskScore: 25,
        status: "Approved",
      },
      {
        id: 2,
        boatName: "Ocean Pearl",
        date: "2024-10-19",
        riskScore: 68,
        status: "Denied",
      },
      {
        id: 3,
        boatName: "Blue Horizon",
        date: "2024-10-18",
        riskScore: 42,
        status: "Approved",
      },
      {
        id: 4,
        boatName: "Wave Runner",
        date: "2024-10-17",
        riskScore: 31,
        status: "Approved",
      },
      {
        id: 5,
        boatName: "Coral Dream",
        date: "2024-10-16",
        riskScore: 55,
        status: "Caution",
      },
    ],
  };
};

export default function SafetyAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("6M"); // 1M, 3M, 6M, 1Y

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAnalytics(generateMockAnalytics());
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color, delay }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={[styles.statCard, { borderLeftColor: color }]}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </Animatable.View>
  );

  const RiskDistributionPie = () => {
    const data = [
      {
        name: "Low",
        population: analytics.riskDistribution.low,
        color: "#10B981",
        legendFontColor: "#1F2937",
      },
      {
        name: "Moderate",
        population: analytics.riskDistribution.moderate,
        color: "#FBBF24",
        legendFontColor: "#1F2937",
      },
      {
        name: "High",
        population: analytics.riskDistribution.high,
        color: "#F59E0B",
        legendFontColor: "#1F2937",
      },
      {
        name: "Critical",
        population: analytics.riskDistribution.critical,
        color: "#EF4444",
        legendFontColor: "#1F2937",
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Risk Level Distribution</Text>
        <PieChart
          data={data}
          width={width - 60}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    );
  };

  const MonthlyTrendsLine = () => {
    const data = {
      labels: analytics.monthlyTrends.map((m) => m.month),
      datasets: [
        {
          data: analytics.monthlyTrends.map((m) => m.avgRisk),
          color: (opacity = 1) => `rgba(99, 108, 203, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Average Risk Score Trends</Text>
        <LineChart
          data={data}
          width={width - 60}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(99, 108, 203, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#636CCB",
            },
          }}
          bezier
          style={{
            borderRadius: 16,
          }}
        />
      </View>
    );
  };

  const TopRiskFactorsBar = () => {
    const data = {
      labels: analytics.topRiskFactors.map((f) => f.factor.split(" ")[0]),
      datasets: [
        {
          data: analytics.topRiskFactors.map((f) => f.percentage),
        },
      ],
    };

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Top Risk Factors (%)</Text>
        <BarChart
          data={data}
          width={width - 60}
          height={220}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            borderRadius: 16,
          }}
          showValuesOnTopOfBars
        />
        <View style={styles.factorsLegend}>
          {analytics.topRiskFactors.map((factor, index) => (
            <View key={index} style={styles.factorLegendItem}>
              <Text style={styles.factorLegendText}>
                {factor.factor}: {factor.count} cases
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const RecentAssessmentsTable = () => (
    <View style={styles.tableContainer}>
      <Text style={styles.chartTitle}>Recent Safety Assessments</Text>
      {analytics.recentAssessments.map((assessment) => {
        const getStatusColor = (status) => {
          if (status === "Approved") return "#10B981";
          if (status === "Denied") return "#EF4444";
          return "#F59E0B";
        };

        const getRiskColor = (score) => {
          if (score >= 70) return "#EF4444";
          if (score >= 50) return "#F59E0B";
          if (score >= 30) return "#FBBF24";
          return "#10B981";
        };

        return (
          <Animatable.View
            key={assessment.id}
            animation="fadeInUp"
            delay={assessment.id * 50}
            style={styles.tableRow}
          >
            <View style={styles.tableRowMain}>
              <View style={styles.tableRowLeft}>
                <Ionicons name="boat" size={20} color="#636CCB" />
                <View style={styles.tableRowInfo}>
                  <Text style={styles.tableRowBoat}>{assessment.boatName}</Text>
                  <Text style={styles.tableRowDate}>{assessment.date}</Text>
                </View>
              </View>
              <View style={styles.tableRowRight}>
                <View
                  style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(assessment.riskScore) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.riskBadgeText,
                      { color: getRiskColor(assessment.riskScore) },
                    ]}
                  >
                    {assessment.riskScore}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(assessment.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{assessment.status}</Text>
                </View>
              </View>
            </View>
          </Animatable.View>
        );
      })}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <Ionicons name="bar-chart" size={70} color="#636CCB" />
        </Animatable.View>
        <Text style={styles.loadingText}>Loading Analytics...</Text>
        <ActivityIndicator size="large" color="#636CCB" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={70} color="#EF4444" />
        <Text style={styles.loadingText}>No Data Available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={["#636CCB", "#8B93FF"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown">
          <Ionicons
            name="analytics"
            size={50}
            color="#fff"
            style={{ alignSelf: "center", marginBottom: 10 }}
          />
          <Text style={styles.headerTitle}>Safety Analytics</Text>
          <Text style={styles.headerSubtitle}>
            AI-powered insights and trends
          </Text>
        </Animatable.View>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {["1M", "3M", "6M", "1Y"].map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Statistics */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="checkmark-done-circle"
          title="Total Assessments"
          value={analytics.totalTripsAnalyzed}
          subtitle="trips analyzed"
          color="#636CCB"
          delay={100}
        />
        <StatCard
          icon="speedometer"
          title="Avg Risk Score"
          value={analytics.averageRiskScore}
          subtitle="out of 100"
          color="#F59E0B"
          delay={200}
        />
        <StatCard
          icon="shield-checkmark"
          title="Approval Rate"
          value={`${analytics.approvalRate}%`}
          subtitle="trips approved"
          color="#10B981"
          delay={300}
        />
        <StatCard
          icon="close-circle"
          title="Denial Rate"
          value={`${analytics.denialRate}%`}
          subtitle="trips denied"
          color="#EF4444"
          delay={400}
        />
      </View>

      {/* Charts Section */}
      <Animatable.View animation="fadeInUp" delay={500}>
        <RiskDistributionPie />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={600}>
        <MonthlyTrendsLine />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={700}>
        <TopRiskFactorsBar />
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={800}>
        <RecentAssessmentsTable />
      </Animatable.View>

      {/* Insights Card */}
      <Animatable.View animation="fadeInUp" delay={900} style={styles.insightsCard}>
        <View style={styles.insightsHeader}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <Text style={styles.insightsTitle}>Key Insights</Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightText}>
            • Weather conditions remain the leading risk factor (43%)
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightText}>
            • Average risk scores increased by 12% in April due to monsoon season
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightText}>
            • 89% approval rate indicates strong safety compliance
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Text style={styles.insightText}>
            • Recommend increased maintenance checks for boats over 10 years old
          </Text>
        </View>
      </Animatable.View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#636CCB",
    marginTop: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
    marginHorizontal: 20,
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  periodButtonActive: {
    backgroundColor: "#636CCB",
    borderColor: "#636CCB",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 10,
    gap: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: (width - 40) / 2 - 5,
    elevation: 3,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statContent: {},
  statTitle: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
  },
  statSubtitle: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 15,
  },
  factorsLegend: {
    marginTop: 15,
  },
  factorLegendItem: {
    marginBottom: 5,
  },
  factorLegendText: {
    fontSize: 12,
    color: "#6B7280",
  },
  tableContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
  tableRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tableRowMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tableRowInfo: {
    marginLeft: 10,
  },
  tableRowBoat: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  tableRowDate: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  tableRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  insightsCard: {
    backgroundColor: "#FFF7ED",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  insightsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginLeft: 10,
  },
  insightItem: {
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    color: "#92400E",
    lineHeight: 20,
  },
});

