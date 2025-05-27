# Property Listings & Booking Application

## How to Run

1. **Install dependencies**  
   In the project directory, run:

   ```
   npm install express mongodb body-parser
   ```

2. **Start the server**  
   In the `/root/database/final/public` directory, run:

   ```
   node server.js
   ```

3. **Access the application**  
   Open your browser and go to:
   ```
   http://localhost:3000/index.html
   ```

## Port Number

- The application runs on **port 3000**.

## Required Libraries

- express
- mongodb
- body-parser

(Install with `npm install express mongodb body-parser`)

## Notes

- Ensure your MongoDB Atlas connection string in `server.js` is valid and accessible.
- All static files (`index.html`, `bookings.html`, CSS) should be in the same directory as `server.js`.
- The server must be running for all booking and search features to work.
- If you encounter a "site can't be reached" error, make sure the server is running and you are using the correct port.
