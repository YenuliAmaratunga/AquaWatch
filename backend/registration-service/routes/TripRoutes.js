const express = require('express');
const route = express.Router();
const {registerTrip, getLatestTrip,getAllTripsByFisherman,endTrip,viewTrip} = require('../controllers/registerTrip'); 
const {authMiddleware}= require('../Authmiddleware/authMiddleware')


route.post('/registerTrip', authMiddleware, registerTrip);
route.get('/latestTrip', authMiddleware, getLatestTrip);
route.get("/myTrips", authMiddleware, getAllTripsByFisherman);
route.put("/end", authMiddleware, endTrip);
route.get("/view/:tripId", viewTrip);


module.exports = route;
