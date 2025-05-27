const express = require('express');
const http = require('http');
const path = require("path");
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);

const uri = "mongodb+srv://s3844510:Khaying08@cluster0.pe4svkr.mongodb.net/";

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname));

// Homepage
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Property search
app.post('/item', async function(req, res) {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('sample_airbnb');
    const listings = database.collection('listingsAndReviews');

    // Build query based on form input
    let query = {};
    if (req.body.location) {
      query["address.market"] = req.body.location;
    }
    if (req.body.property_type) {
      query["property_type"] = req.body.property_type;
    }
    if (req.body.bedrooms) {
      query["bedrooms"] = parseInt(req.body.bedrooms);
    }

    // Find up to 5 listings matching the query
    const results = await listings.find(query).limit(5).toArray();

    // Render only selected fields for each listing
        // Create styled HTML results
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Search Results</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Search Results</h2>
      <ol>
        ${results.length === 0
          ? `<li>No listings found.</li>`
          : results.map(listing => `
            <li>
              <a href="/bookings.html?listing_id=${listing._id}" target="_blank">
                <strong>${listing.name || "No Name"}</strong>
              </a><br>
              Summary: ${listing.summary || "N/A"}<br>
              Daily Price: $${listing.price?.$numberDecimal || listing.price || "N/A"}<br>
              Review Score: ${listing.review_scores?.review_scores_rating || "N/A"}<br>
              <form action="/bookings.html" method="get" style="display:inline;">
                <input type="hidden" name="listing_id" value="${listing._id}">
                <button type="submit">Book</button>
              </form>
            </li>
        `).join('')}
      </ol>
      <a href="/index.html">Back to Search</a>
    </body>
    </html>
    `;

    res.status(200).setHeader('Content-Type', 'text/html').end(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database error');
  } finally {
    if (client) await client.close();
  }
});

// Serve the bookings page
app.get('/bookings.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'bookings.html'));
});

// Handle booking form submission
app.post('/bookings', async function(req, res) {
  let client;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('sample_airbnb');
    const bookings = database.collection('bookings');

    // Save booking
    const booking = {
      listing_id: req.body.listing_id,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      client_name: req.body.client_name,
      email: req.body.email,
      daytime_phone: req.body.daytime_phone,
      mobile_phone: req.body.mobile_phone,
      postal_address: req.body.postal_address,
      home_address: req.body.home_address,
      created_at: new Date()
    };
    await bookings.insertOne(booking);

    // Render confirmation page with booking info
      res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Booking Confirmation</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <h2>Booking Confirmed!</h2>
      <p>Thank you, <strong>${booking.client_name}</strong>!</p>
      <ul>
        <li><strong>Listing ID:</strong> ${booking.listing_id}</li>
        <li><strong>Start Date:</strong> ${booking.start_date}</li>
        <li><strong>End Date:</strong> ${booking.end_date}</li>
        <li><strong>Email:</strong> ${booking.email}</li>
        <li><strong>Daytime Phone:</strong> ${booking.daytime_phone}</li>
        <li><strong>Mobile Phone:</strong> ${booking.mobile_phone}</li>
        <li><strong>Postal Address:</strong> ${booking.postal_address}</li>
        <li><strong>Home Address:</strong> ${booking.home_address}</li>
      </ul>
      <a href="/index.html">Return to Homepage</a>
    </body>
    </html>
  `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Booking failed');
  } finally {
    if (client) await client.close();
  }
});

// Serve confirmation page (if you want a static one)
app.get('/confirmation.html', function(req, res) {
  res.sendFile(path.join(__dirname, 'confirmation.html'));
});

server.listen(3000, function() {
  console.log("Server listening on port: 3000");
});