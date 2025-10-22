# 🔗 Quick Integration Guide
## How to Add AI Features to Your Existing App

---

## Option 1: Add Button to FishermanLandingScreen

Open `frontend/fishing-app/src/screens/FishermanLandingScreen.js` and add this button:

```jsx
import { Ionicons } from "@expo/vector-icons";

// Inside your render/return, add this button:
<TouchableOpacity
  style={{
    backgroundColor: "#636CCB",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 15,
  }}
  onPress={() => navigation.navigate('AIFeaturesMenu')}
>
  <Ionicons name="brain" size={24} color="#fff" />
  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 10 }}>
    AI Safety Features
  </Text>
</TouchableOpacity>
```

---

## Option 2: Add to HomeScreen

Open `frontend/fishing-app/src/screens/HomeScreen.js` and add:

```jsx
<TouchableOpacity
  onPress={() => navigation.navigate('AIFeaturesMenu')}
  style={{
    backgroundColor: "#636CCB",
    padding: 20,
    borderRadius: 15,
    margin: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  }}
>
  <Ionicons name="shield-checkmark" size={30} color="#fff" />
  <View style={{ marginLeft: 15, flex: 1 }}>
    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
      AI Safety Check
    </Text>
    <Text style={{ color: "#fff", fontSize: 12, opacity: 0.9 }}>
      Validate trips & view risk analytics
    </Text>
  </View>
  <Ionicons name="chevron-forward" size={24} color="#fff" />
</TouchableOpacity>
```

---

## Option 3: Replace Static RiskScreen Tab

In `frontend/fishing-app/src/navigation/AppNavigator.js`, update the MainTabs function:

```jsx
// Change this line:
<Tab.Screen name="Risk" component={RiskScreen} />

// To this:
<Tab.Screen name="Risk" component={AIFeaturesMenu} />
```

This replaces your static risk screen with the dynamic AI features menu!

---

## Option 4: Add Menu Item to Existing Menu

If you have a menu/settings screen, add:

```jsx
const menuItems = [
  {
    title: "AI Safety Features",
    icon: "analytics",
    screen: "AIFeaturesMenu",
    color: "#636CCB"
  },
  // ... your other menu items
];

// Then render:
{menuItems.map(item => (
  <TouchableOpacity
    key={item.title}
    onPress={() => navigation.navigate(item.screen)}
  >
    <View style={styles.menuItem}>
      <Ionicons name={item.icon} size={24} color={item.color} />
      <Text>{item.title}</Text>
    </View>
  </TouchableOpacity>
))}
```

---

## Quick Test Navigation

To test the screens directly, you can navigate from any screen:

```jsx
// Test Risk Assessment Dashboard
navigation.navigate('RiskAssessmentDashboard');

// Test Trip Safety Validator
navigation.navigate('TripSafetyValidator');

// Test Safety Analytics
navigation.navigate('SafetyAnalytics');

// Test AI Features Menu (recommended starting point)
navigation.navigate('AIFeaturesMenu');
```

---

## Backend Setup

1. **Navigate to AI service:**
   ```bash
   cd backend/ai-service
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

   Server will run on `http://localhost:5000`

4. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:5000/health
   
   # Calculate trip risk
   curl -X POST http://localhost:5000/api/risk/calculate-trip-risk \
     -H "Content-Type: application/json" \
     -d '{
       "boatAge": 8,
       "fuelAmount": 60,
       "fuelEfficiency": 3.5,
       "crewCount": 4,
       "lifeJacketsCount": 4,
       "engineStatus": "Good",
       "startLat": 6.9271,
       "startLon": 79.8612,
       "destLat": 7.8731,
       "destLon": 80.7718
     }'
   ```

---

## Frontend Setup

1. **Install chart dependencies (if not installed):**
   ```bash
   cd frontend/fishing-app
   npm install react-native-chart-kit react-native-svg
   ```

2. **Clear cache and restart:**
   ```bash
   npx expo start -c
   ```

3. **Test on device/emulator**

---

## Minimal Integration (Just Add 3 Lines!)

**Easiest way:** Just add this to your existing RiskScreen or HomeScreen:

```jsx
// At the top with imports
import { useNavigation } from "@react-navigation/native";

// Inside component
const navigation = useNavigation();

// Add this button anywhere in your JSX
<TouchableOpacity 
  onPress={() => navigation.navigate('AIFeaturesMenu')}
  style={{ padding: 15, backgroundColor: "#636CCB", borderRadius: 10 }}
>
  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
    🤖 Open AI Features
  </Text>
</TouchableOpacity>
```

That's it! Users can now access all AI features! 🎉

---

## What You Get:

✅ **4 New Screens** (Menu, Dashboard, Validator, Analytics)  
✅ **Dynamic Risk Calculations** with live weather data  
✅ **Beautiful Charts** showing trends and statistics  
✅ **Real-time API Integration** (Weather + Boat data)  
✅ **GPS Location Tracking** for trip validation  
✅ **Backend REST API** with 4 endpoints  
✅ **Zero changes** to your existing code!  

---

## Quick Demo Flow for Viva:

1. **Open App** → Navigate to AI Features Menu
2. **Show Menu** → Point out 3 feature cards
3. **Open Dashboard** → Show real-time risk calculation for a boat
4. **Open Validator** → Fill form, show trip validation
5. **Show Result** → Explain approve/deny logic
6. **Open Analytics** → Show charts and statistics
7. **Explain Algorithm** → Reference README for details

---

## Need Help?

Check `AI_FEATURES_README.md` for complete documentation!

