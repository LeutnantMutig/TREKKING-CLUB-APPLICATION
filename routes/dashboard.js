const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('querystring'); //
const db = require("../models/User")
// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {

    return res.redirect('/auth/login');
  }

  next();
};

router.get('/', isAuthenticated, (req, res) => {
  res.render('dashboard');
});

router.get('/btn-page', isAuthenticated, (req, res) => {
  res.render('button');
});


router.get('/action/:type', isAuthenticated, (req, res) => {


  switch (req.params.type) {
    case "TRACK":
      return track(req, res);
    case "CALL":
      // Handle CALL action
      break;
    case "CHAT":
      return chat(req, res)
      // return res.render("chat")
      // break;
    case "SOS":
      return track(req, res, "sos");
      // Handle SOS action
      break;
    default:
      return res.status(400).json({ message: "Invalid action type" });
  }

});


async function track(req, res, type) {
  console.log(req.session.userId);

  var x = await db.findById(req.session.userId)
  if (!x) {
    return res.status(401).json({ message: "User not logged in" });
  }

  // Get data from frontend

  const phone_number = x.number || '9714076539'; // Default if not provided
  const lat = 21.498444;
  const lon = 73.008;

  // Construct Google Maps link
  const maps_link = `https://www.google.com/maps/?q=${lat},${lon}`;
  var message = (type === "sos") ? "HELP I AM IN TROUBLE" : `I AM HERE. Check my location: ${maps_link}`;

  if (!phone_number) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Fast2SMS API integration
  const url = "https://www.fast2sms.com/dev/bulkV2";
  const payload = qs.stringify({
    message: message,
    language: 'english',
    route: 'q',
    numbers: phone_number
  });
  const headers = {
    'authorization': "",
    'Content-Type': "application/x-www-form-urlencoded",
    'Cache-Control': "no-cache"
  };

  try {
    console.log(url, payload, { headers });

    // Make POST request to Fast2SMS
    const response = await axios.post(url, payload, { headers });

    if (response.status === 200) {
      // If using a database, save the message (here's a placeholder)
      // await TrackMessage.create({ phone_number, message, lat, lon });
      if (type === "sos") {
        return res.status(200).json({ message: "Track message sent successfully" });
      }else{
        return res.status(200).json({ message: "Track message sent successfully", maps_link });

      }
    } else {
      return res.status(500).json({ message: "Failed to send SMS", error: response.data });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
}
// router.options('/action/:type', isAuthenticated, (req, res) => {
//   res.json({ body: req.params.type })
// }); router.post('/action/:type', isAuthenticated, (req, res) => {
//   res.json({ body: req.params.type })
// });
module.exports = router;
