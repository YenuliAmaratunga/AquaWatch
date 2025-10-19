const Trip = require('../models/TripSchema');
const User = require('../models/UserSchema');
const Boat = require('../models/BoatSchema');
const crypto = require('crypto');

exports.registerTrip = async (req, res) => {
  try {
    const {
      boat,
      numberOfParticipants,
      participantIds: participantNationalIds,
      startingLocation,
      heading,
    } = req.body;

    const errors = [];

    if (!boat || !numberOfParticipants || !participantNationalIds || !startingLocation || heading === undefined) {
      errors.push("Missing required fields");
    }

    if (participantNationalIds && participantNationalIds.length !== numberOfParticipants) {
      errors.push("Number of participants does not match number of IDs");
    }

    // Verify participant national IDs
    let participantObjectIds = [];
    if (participantNationalIds?.length > 0) {
      const users = await User.find({ nationalId: { $in: participantNationalIds } });
      if (users.length !== participantNationalIds.length) {
        errors.push("One or more participant national IDs are invalid or not registered");
      } else {
        participantObjectIds = users.map((u) => u._id);
      }
    }

    // Verify boat
    const existingBoat = await Boat.findById(boat);
    if (!existingBoat) errors.push("Boat is not registered in the system");

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const now = new Date();
    const shareToken = crypto.randomBytes(8).toString("hex");

    // 1️⃣ Save trip first without QR data
    let newTrip = new Trip({
      fishermanId: req.user.id,
      boat,
      numberOfParticipants,
      participantIds: participantObjectIds,
      startingLocation,
      heading,
      startDate: now,
      startTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      shareToken,
      qrGeneratedAt: new Date(),
    });

    const savedTrip = await newTrip.save();

    // 2️⃣ Now generate QR using the actual MongoDB _id
    const qrData = `https://10b8c329-d78f-4b7f-8cd9-448ba1dae2e2-dev.e1-us-east-azure.choreoapis.dev/aquawatchapp/registration-service/v1.0/api/Trip/view/${savedTrip._id}?token=${shareToken}`;

    // 3️⃣ Update the record
    savedTrip.qrData = qrData;
    await savedTrip.save();

    return res.status(201).json({
      message: "Fishing trip registered successfully",
      trip: savedTrip,
    });
  } catch (error) {
    console.error("Error registering trip:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ New Endpoint — Get Latest Trip for Logged-in Fisherman
exports.getLatestTrip = async (req, res) => {
  try {
    const fishermanId = req.user.id;

    const latestTrip = await Trip.findOne({ fishermanId })
      .sort({ createdAt: -1 }) // needs timestamps in schema
      .populate('boat participantIds', 'name registrationNumber nationalId')
      .exec();

    if (!latestTrip) {
      return res.status(404).json({
        message: "No trips found for this fisherman",
      });
    }

    return res.status(200).json({
      message: "Latest trip fetched successfully",
      trip: latestTrip,
    });

  } catch (error) {
    console.error("Error fetching latest trip:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get all trips for a specific fisherman
exports.getAllTripsByFisherman = async (req, res) => {
  try {
    const fishermanId = req.user.id; 

    const trips = await Trip.find({ fishermanId })
      .sort({ startDate: -1 }) 
      .populate("boat", "boatName registrationNumber")
      .populate("participantIds", "name nationalId")
      .exec();

    if (!trips || trips.length === 0) {
      return res.status(404).json({
        message: "No trips found for this fisherman",
      });
    }

    return res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ✅ End a trip (automatically capture end date/time)
exports.endTrip = async (req, res) => {
  try {
    const { tripId } = req.body;

    const now = new Date();

    const trip = await Trip.findOneAndUpdate(
      { _id: tripId, fishermanId: req.user.id },
      {
        endDate: now,
        endTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json({
      message: "Trip ended successfully",
      trip,
    });
  } catch (error) {
    console.error("Error ending trip:", error);
    return res.status(500).json({ message: "Server error", error: error.message });

    
  }
};


exports.viewTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { token } = req.query;

    const trip = await Trip.findOne({ _id: tripId, shareToken: token })
      .populate("boat")
      .populate("participantIds", "name nationalId");

    if (!trip) {
      return res.status(404).send("<h2>Trip not found or invalid token</h2>");
    }

    // Return dynamic map HTML
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fishing Trip Live View</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { font-family: Arial; background-color: #eef6fb; margin: 0; padding: 0; }
          .info { padding: 15px; background: white; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          #map { height: 500px; width: 100%; }
          h2 { color: #007bff; }
          p { margin: 6px 0; }
        </style>
      </head>
      <body>
        <div class="info">
          <h2>Fishing Trip: ${trip.boat.boatName}</h2>
          <p><b>Registration:</b> ${trip.boat.registrationNumber}</p>
          <p><b>Participants:</b> ${trip.numberOfParticipants}</p>
          <p><b>Heading:</b> ${trip.heading}°</p>
        </div>

        <div id="map"></div>

        <script>
          const map = L.map('map').setView([${trip.startingLocation.latitude}, ${trip.startingLocation.longitude}], 8);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Starting point
          L.marker([${trip.startingLocation.latitude}, ${trip.startingLocation.longitude}])
            .addTo(map)
            .bindPopup('Starting Point').openPopup();

          // Get current user (scanner) location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                L.marker([lat, lon], { icon: L.icon({
                  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                  iconSize: [28, 28],
                })}).addTo(map).bindPopup('Your Current Location');
                map.setView([lat, lon], 10);
              },
              (err) => console.warn("GPS permission denied", err)
            );
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error in viewTrip:", error);
    res.status(500).send("<h2>Server error retrieving trip details</h2>");
  }
};
