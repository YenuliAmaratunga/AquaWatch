# 🚀 Quick Test Guide for Expo Go
## 5-Minute Setup & Demo

---

## ⚡ Super Quick Start

### 1. Start the App (30 seconds)
```bash
cd frontend/fishing-app
npx expo start
```

### 2. Open on Phone (30 seconds)
- Open **Expo Go** app on your phone
- Scan the QR code
- Wait for app to load

### 3. Navigate to AI Features (10 seconds)
Add this test button to any screen temporarily:

```jsx
<TouchableOpacity 
  onPress={() => navigation.navigate('AIFeaturesMenu')}
  style={{ 
    padding: 20, 
    backgroundColor: "#636CCB", 
    margin: 20, 
    borderRadius: 10 
  }}
>
  <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
    TEST AI FEATURES
  </Text>
</TouchableOpacity>
```

### 4. Test Each Screen (2 minutes each)

✅ **AIFeaturesMenu** - Should show 3 gradient cards  
✅ **RiskAssessmentDashboard** - Should show risk gauge  
✅ **TripSafetyValidator** - Should show form  
✅ **SafetyAnalytics** - Should show charts  

---

## 📱 Expo Go Installation

### Android:
1. Open Google Play Store
2. Search "Expo Go"
3. Install
4. Open app

### iOS:
1. Open App Store
2. Search "Expo Go"
3. Install
4. Open app

---

## 🧪 Testing Each Screen

### Test 1: AI Features Menu ✅
**Expected:**
- 3 gradient cards (purple, green, orange)
- Icons displayed correctly
- Info section at bottom
- Smooth animations

**Issues?**
- Restart app
- Check internet connection

---

### Test 2: Risk Assessment Dashboard ✅
**Expected:**
- Loading spinner appears
- Circular risk gauge shows
- Score between 0-100 displayed
- Boat information card
- Risk factors list
- Action buttons at bottom

**Issues?**
- **"No boats found"** → Need to register a boat first
- **Weather not loading** → Check internet, coordinates valid
- **Stuck loading** → Check API URLs are correct

---

### Test 3: Trip Safety Validator ✅
**Expected:**
- Form with multiple inputs
- Boat dropdown populated
- GPS location displays
- Validation button works
- Result modal appears after validation

**Test Steps:**
1. Select a boat from dropdown
2. Enter crew count: `4`
3. Enter life jackets: `4`
4. Enter fuel: `60`
5. Select engine status: `Good`
6. Enter destination (or use preset):
   - Lat: `6.9271`
   - Lon: `79.8612`
7. Click "Validate Trip Safety"
8. Wait for modal (3-5 seconds)
9. See risk score and recommendation

**Issues?**
- **Location permission denied** → Go to phone Settings → Apps → Expo Go → Permissions → Location
- **Validation fails** → Check all fields filled
- **Weather timeout** → Check internet

---

### Test 4: Safety Analytics ✅
**Expected:**
- 4 stat cards at top
- Pie chart (colorful circle)
- Line chart (trend line)
- Bar chart (vertical bars)
- Recent assessments table
- Insights card

**Issues?**
- **Charts not showing** → Run `npm install react-native-svg` and restart
- **White boxes instead of charts** → Restart Expo Go app

---

## 🐛 Common Issues & Fixes

### Issue: "Unable to resolve module"
```bash
npm install
npx expo start -c
```

### Issue: Charts showing as white boxes
```bash
npm install react-native-svg
npx expo start --clear
```

### Issue: Location permission denied
- **Android:** Settings → Apps → Expo Go → Permissions → Location → Allow
- **iOS:** Settings → Expo Go → Location → While Using

### Issue: API calls failing
- Check WiFi connected
- Verify API URLs:
  ```javascript
  const AUTH_BASE = "https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0";
  const WEATHER_BASE = "https://2b55f8fb-4fda-40b3-9a62-9282bf78e6c0-dev.e1-us-east-azure.choreoapis.dev/aquawatch/weather-service/v1.0";
  ```

### Issue: White screen
1. Open Expo Go developer menu (shake phone)
2. Click "Reload"
3. Or restart: `npx expo start -c`

---

## 📸 Screenshots to Take (Optional)

For your report/presentation:
1. AI Features Menu main screen
2. Risk gauge with score
3. Trip validation result modal
4. Charts on analytics screen
5. Risk breakdown cards

---

## 🎯 Quick Demo Script (2 minutes)

### "Let me show you the AI Safety features..."

1. **"First, here's the main menu"**
   - *Show AIFeaturesMenu with 3 cards*
   - "These are the 3 main AI-powered features"

2. **"The Risk Assessment Dashboard analyzes boats in real-time"**
   - *Open RiskAssessmentDashboard*
   - *Point to animated gauge*
   - "It fetches live weather data and calculates risk from 7 factors"
   - *Show risk breakdown*

3. **"The Trip Safety Validator checks if a trip is safe"**
   - *Open TripSafetyValidator*
   - *Fill form quickly (or pre-fill)*
   - *Click validate*
   - "It calculates distance, checks fuel, analyzes weather..."
   - *Show result modal*
   - "And gives approve or deny recommendation"

4. **"The Analytics Dashboard visualizes safety trends"**
   - *Open SafetyAnalytics*
   - "Pie chart shows risk distribution"
   - "Line chart shows trends over time"
   - "Bar chart shows top risk factors"

**Total time:** < 2 minutes!

---

## ✅ Pre-Demo Checklist

**5 Minutes Before:**
- [ ] Phone charged (>50%)
- [ ] Phone and laptop on same WiFi
- [ ] `npx expo start` running
- [ ] App loaded in Expo Go
- [ ] Test each screen once
- [ ] Location permission granted
- [ ] Know how to navigate between screens

**Backup Plan:**
- [ ] Screenshots of each screen saved
- [ ] Screen recording of full demo (optional)
- [ ] Code ready to show if needed

---

## 🎓 Key Points to Mention

During demo, emphasize:
- ✅ "All calculations done on frontend"
- ✅ "Uses existing APIs - no backend changes"
- ✅ "Real-time weather integration"
- ✅ "Dynamic risk scoring algorithm"
- ✅ "Data visualization with charts"
- ✅ "GPS location tracking"
- ✅ "100% Expo Go compatible"

---

## 🔥 Emergency Reset

If anything breaks during demo:

```bash
# Kill everything
Ctrl + C

# Nuclear option
rm -rf node_modules
npm install
npx expo start -c
```

Or just:
```bash
npx expo start -c
```

Then rescan QR code!

---

## 📞 Last-Minute Checks

**30 Seconds Before Demo:**
1. Phone unlocked
2. Expo Go open
3. App loaded
4. Internet working
5. Volume off (silence phone!)

**During Demo:**
- Speak clearly
- Show each screen briefly
- Explain what's happening
- Point out key features
- Stay calm if minor glitch

---

## 🎉 You Got This!

**Remember:**
- It's working code, not a presentation
- Show features, don't just talk about them
- If something glitches, reload quickly
- Confidence is key!

**Good luck!** 🚀📱✨

---

**Quick Access Navigation:**
```jsx
navigation.navigate('AIFeaturesMenu');          // Start here
navigation.navigate('RiskAssessmentDashboard'); // Dashboard
navigation.navigate('TripSafetyValidator');     // Validator
navigation.navigate('SafetyAnalytics');         // Analytics
```

