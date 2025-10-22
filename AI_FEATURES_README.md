# 🤖 AI Safety & Risk Analysis Features
## Member 3 (IT22088550) - AI Safety & Risk Analysis Component

---

## 📋 Overview

This document describes the **AI-powered Safety & Risk Analysis features** added to the AquaWatch application. These features go beyond basic backend validation to provide **dynamic, real-time risk assessments** with API integrations, data visualizations, and comprehensive analytics.

---

## ✨ Features Implemented

### 1. **Risk Assessment Dashboard** 🎯
**File:** `frontend/fishing-app/src/screens/RiskAssessmentDashboard.js`

**What it does:**
- **Real-time risk calculation** for registered boats
- Fetches boat data from registration service
- **Integrates weather API** to calculate weather-based risk
- Dynamic risk gauge showing score from 0-100
- Color-coded risk levels (Low/Moderate/High/Critical)
- Detailed risk factor breakdown
- Personalized safety recommendations
- Approve/Deny trip recommendations

**Key Features:**
- ✅ Animated risk gauge with real-time updates
- ✅ Boat information display
- ✅ Risk factor cards with status indicators
- ✅ Priority-based safety recommendations
- ✅ Navigation to other AI features

**API Integrations:**
- Registration Service API (boat data)
- Weather Service API (live weather conditions)

---

### 2. **Trip Safety Validator** 🛡️
**File:** `frontend/fishing-app/src/screens/TripSafetyValidator.js`

**What it does:**
- **Pre-trip validation form** with comprehensive checks
- Dynamic risk calculation based on user inputs
- Real-time weather fetching for destination
- Distance calculation between start and destination
- Fuel sufficiency analysis
- Life jacket compliance checking
- Engine status validation
- Full-screen result modal with detailed breakdown

**Key Features:**
- ✅ Form with boat selection, crew count, fuel, engine status
- ✅ Destination coordinate input with quick presets
- ✅ **Live location tracking** (current GPS position)
- ✅ **Distance calculation** using Haversine formula
- ✅ **Weather API integration** for destination forecast
- ✅ Risk score calculation with factor breakdown
- ✅ Approve/Deny/Caution recommendations
- ✅ Beautiful modal with result visualization

**API Integrations:**
- Registration Service API (boat list)
- Weather Service API (destination weather)
- Expo Location API (GPS positioning)

---

### 3. **Safety Analytics Dashboard** 📊
**File:** `frontend/fishing-app/src/screens/SafetyAnalyticsScreen.js`

**What it does:**
- **Data visualization** with charts and graphs
- Historical risk trends analysis
- Statistical insights and patterns
- Risk factor distribution
- Recent assessment history
- Key insights and recommendations

**Key Features:**
- ✅ **4 Key Stat Cards:** Total assessments, avg risk, approval/denial rates
- ✅ **Pie Chart:** Risk level distribution (Low/Moderate/High/Critical)
- ✅ **Line Chart:** Monthly risk score trends
- ✅ **Bar Chart:** Top risk factors analysis
- ✅ **Recent Assessments Table:** Last 5 trip validations
- ✅ **AI-generated insights** with actionable recommendations
- ✅ Period selector (1M/3M/6M/1Y)

**Charts Used:**
- `react-native-chart-kit` library
- PieChart, LineChart, BarChart

---

### 4. **AI Features Menu** 🧠
**File:** `frontend/fishing-app/src/screens/AIFeaturesMenu.js`

**What it does:**
- Central hub for all AI features
- Quick access to all three screens
- Feature descriptions and icons
- Information about AI capabilities

**Key Features:**
- ✅ Beautiful gradient cards for each feature
- ✅ Feature descriptions
- ✅ About AI Features section
- ✅ Animated entrance effects

---

### 5. **Risk Calculator Utilities** 🧮
**File:** `frontend/fishing-app/src/utils/riskCalculator.js`

**What it does:**
- Comprehensive risk calculation algorithms
- Weather risk analysis
- Distance calculation (Haversine formula)
- Risk level categorization
- Trip recommendation logic
- Risk breakdown generation
- Safety recommendations generation

**Functions:**
- `calculateOverallRisk()` - Master risk score calculator
- `calculateWeatherRisk()` - Weather-specific risk
- `getRiskLevel()` - Risk categorization
- `getTripRecommendation()` - Approve/Deny logic
- `calculateDistance()` - GPS distance calculator
- `getRiskBreakdown()` - Detailed factor analysis
- `generateSafetyRecommendations()` - AI recommendations

---

### 6. **Backend API Routes** 🔧
**Files:** 
- `backend/ai-service/routes/riskRoutes.js`
- `backend/ai-service/controllers/riskController.js`

**Endpoints:**

#### POST `/api/risk/calculate-trip-risk`
Calculate comprehensive trip risk with weather integration

**Request Body:**
```json
{
  "boatAge": 8,
  "fuelAmount": 60,
  "fuelEfficiency": 3.5,
  "crewCount": 4,
  "lifeJacketsCount": 4,
  "engineStatus": "Good",
  "startLat": 6.9271,
  "startLon": 79.8612,
  "destLat": 7.8731,
  "destLon": 80.7718,
  "boatCapacity": 10,
  "pastViolations": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskScore": 32,
    "riskLevel": "MODERATE",
    "recommendation": "APPROVED",
    "distance": "120.45",
    "requiredFuel": "42.0",
    "riskFactors": [...],
    "weatherData": {...}
  }
}
```

#### GET `/api/risk/boat-profile/:boatId`
Get risk profile for specific boat

#### GET `/api/risk/analytics`
Get overall analytics and statistics

#### GET `/api/risk/history/:userId`
Get user's risk assessment history

---

## 🎨 UI/UX Highlights

### Design Features:
- ✅ **Gradient backgrounds** (LinearGradient)
- ✅ **Animated components** (react-native-animatable)
- ✅ **Icon integration** (Ionicons)
- ✅ **Color-coded status** (Green/Yellow/Orange/Red)
- ✅ **Smooth animations** (fadeIn, slideUp, pulse)
- ✅ **Professional cards** with elevation/shadows
- ✅ **Responsive layouts**
- ✅ **Loading states** with spinners
- ✅ **Modal dialogs** for results

### Color Scheme:
- Primary: `#636CCB` (Purple/Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Orange)
- Danger: `#EF4444` (Red)
- Info: `#FBBF24` (Yellow)

---

## 📊 Risk Calculation Algorithm

### Risk Score Breakdown (0-100 scale):

1. **Boat Age** (0-20 points)
   - 0-5 years: 3 points
   - 5-10 years: 8 points
   - 10-15 years: 15 points
   - 15+ years: 20 points (CRITICAL)

2. **Fuel Adequacy** (0-15 points)
   - Calculates required fuel with 20% buffer
   - < 70% required: 15 points (CRITICAL)
   - < 100% required: 10 points (HIGH)
   - < 110% required: 5 points (MODERATE)
   - > 110% required: 0 points (SAFE)

3. **Life Jackets** (0-15 points)
   - Less than crew count: 15 points (CRITICAL)
   - Equal to crew count: 3 points (SAFE)
   - More than crew count: 0 points (SAFE)

4. **Engine Status** (0-20 points)
   - Critical: 20 points
   - Needs Maintenance: 12 points
   - Good: 2 points

5. **Weather Conditions** (0-25 points)
   - Wind speed analysis (0-10 points)
   - Wave height analysis (0-15 points)
   - Combined score capped at 25

6. **Boat Capacity** (0-5 points)
   - Over capacity: 5 points (CRITICAL)
   - Within capacity: 0 points

7. **Past Violations** (0-10 points)
   - 2 points per violation (capped at 10)

### Risk Levels:
- **0-29:** LOW (🟢 Green) - APPROVED
- **30-49:** MODERATE (🟡 Yellow) - APPROVED with caution
- **50-69:** HIGH (🟠 Orange) - CAUTION
- **70-100:** CRITICAL (🔴 Red) - DENIED

---

## 🚀 How to Access Features

### Option 1: Direct Navigation
From any screen with navigation access:
```javascript
navigation.navigate('AIFeaturesMenu');
// OR directly to specific features
navigation.navigate('RiskAssessmentDashboard');
navigation.navigate('TripSafetyValidator');
navigation.navigate('SafetyAnalytics');
```

### Option 2: Add to Home Screen
Add a button to your home screen:
```jsx
<TouchableOpacity 
  onPress={() => navigation.navigate('AIFeaturesMenu')}
>
  <Text>AI Safety Features</Text>
</TouchableOpacity>
```

### Option 3: Add to Bottom Tab
Update `AppNavigator.js` MainTabs to include AI features:
```javascript
<Tab.Screen name="AI" component={AIFeaturesMenu} />
```

---

## 📦 Dependencies Used

### Frontend:
```json
{
  "@react-navigation/native": "^6.x",
  "react-native-animatable": "^1.x",
  "react-native-chart-kit": "^6.x",
  "expo-linear-gradient": "^12.x",
  "@expo/vector-icons": "^13.x",
  "axios": "^1.x",
  "expo-location": "^16.x",
  "@react-native-picker/picker": "^2.x"
}
```

### Backend:
```json
{
  "express": "^4.x",
  "axios": "^1.x",
  "mongoose": "^7.x",
  "cors": "^2.x"
}
```

---

## 🔌 API Configuration

### Frontend API URLs:
Update in each screen if your endpoints change:

```javascript
const AUTH_BASE = 
  "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";

const WEATHER_BASE = 
  "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0";
```

### Backend Server:
The AI service backend runs on:
```
http://localhost:5000
```

Start the server:
```bash
cd backend/ai-service
npm install
npm start
```

---

## 📸 Screenshots & Demo Flow

### User Flow:
1. **User opens AIFeaturesMenu** → Sees 3 feature cards
2. **Clicks "Risk Assessment Dashboard"** → Views real-time risk for their boat
3. **Clicks "Validate New Trip"** → Opens TripSafetyValidator
4. **Fills in trip details** → Validates safety
5. **Views Result** → Gets approve/deny recommendation
6. **Clicks "View Analytics"** → Opens SafetyAnalyticsScreen
7. **Reviews trends** → Sees charts and insights

---

## 🎯 What Makes This "Dynamic" and NOT Just Backend Logic

### ✅ Dynamic Elements:

1. **Real-Time API Calls:**
   - Weather API fetching live conditions
   - Boat data fetching from registration service
   - GPS location tracking
   - Distance calculations on-the-fly

2. **Interactive UI:**
   - Animated risk gauges that update in real-time
   - Form inputs that trigger immediate calculations
   - Charts that visualize data trends
   - Modal dialogs with results

3. **Data Visualization:**
   - Pie charts showing risk distribution
   - Line charts showing trends over time
   - Bar charts showing top risk factors
   - Color-coded status indicators

4. **User Input Processing:**
   - Form validation
   - Distance calculation from coordinates
   - Fuel adequacy calculations
   - Risk score computation with visual feedback

5. **Navigation Flow:**
   - Screen-to-screen navigation
   - Deep linking between features
   - Modal overlays
   - Tab navigation integration

---

## 🏆 Why This is Perfect for Your Viva

### Demonstrates:
✅ **API Integration** - Multiple external APIs (Weather, Registration, Location)  
✅ **Dynamic Calculations** - Real-time risk scoring with live data  
✅ **Data Visualization** - Charts, graphs, and analytics  
✅ **Mobile Development** - React Native best practices  
✅ **UX Design** - Beautiful, intuitive interfaces  
✅ **Backend Development** - RESTful API endpoints  
✅ **Algorithm Design** - Custom risk calculation logic  
✅ **State Management** - React hooks and async operations  
✅ **Error Handling** - Graceful fallbacks and user feedback  
✅ **Code Organization** - Modular, reusable components  

---

## 🐛 Troubleshooting

### Common Issues:

1. **Weather API not working:**
   - Check API URL is correct
   - Verify network connectivity
   - Check coordinates are valid

2. **Charts not rendering:**
   - Install: `npm install react-native-chart-kit react-native-svg`
   - Restart metro bundler

3. **Navigation errors:**
   - Ensure all screens are imported in AppNavigator.js
   - Check screen names match exactly

4. **Location permissions:**
   - Grant location permissions in app settings
   - Test on physical device for accurate GPS

---

## 📝 Future Enhancements

Potential additions for even more features:
- 🔮 Machine learning model for predictive risk
- 📷 Image recognition for safety equipment verification
- 🗺️ Route optimization with risk zones
- 📱 Push notifications for weather alerts
- 💾 Local database for offline risk assessment
- 🔐 User authentication for personalized history
- 📊 Export analytics as PDF reports
- 🌐 Multi-language support

---

## 👨‍💻 Author

**Member 3: IT22088550**  
**Component:** AI Safety & Risk Analysis  
**Project:** AquaWatch - SDG 14 (Life Below Water)  
**Course:** SE3050 - User Experience Engineering  
**Year:** 3, Semester 2, 2024

---

## 📞 Support

For questions about these features:
1. Check this README
2. Review code comments in files
3. Test each screen individually
4. Check console logs for errors

---

## ✅ Checklist for Viva

- [ ] All 4 screens working (Menu, Dashboard, Validator, Analytics)
- [ ] Weather API integration functional
- [ ] Charts displaying data correctly
- [ ] Navigation between screens smooth
- [ ] Backend API routes responding
- [ ] Location permissions granted
- [ ] Risk calculations accurate
- [ ] UI animations smooth
- [ ] Error handling working
- [ ] Code is well-commented

---

**Good luck with your viva! 🚀**

