const express = require('express');
const route = express.Router();
const {registerTrip, getLatestTrip} = require('../controllers/registerTrip'); 
const {authMiddleware}= require('../Authmiddleware/authMiddleware')


route.post('/registerTrip', authMiddleware, registerTrip);
route.get('/latestTrip', authMiddleware, getLatestTrip);
route.get("/myTrips", authMiddleware, tripController.getAllTripsByFisherman);
route.put("/end", authMiddleware, tripController.endTrip);

module.exports = route;
