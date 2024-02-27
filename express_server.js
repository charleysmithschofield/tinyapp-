// Import the express module from the library
const express = require("express");
// Create an instance of Express
const app = express();
// Define the port number for the server to listen on (8080 default port)
const PORT = 8080;

// A database storing shortened URLs as key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Route handler for the root endpoint
app.get("/", (req, res) => {
  // Send "Hello!" as the response when a GET request is made to the root endpoint
  res.send("Hello!");
});
// Route handler for the "/urls.json" endpoint
app.get("/urls.json", (req, res) => {
  // Send the urlDatabase object as a JSON response when a GET request is made to the "/urls.json" endpoint
  res.json(urlDatabase);
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message indicatign that the server is running and listening on the specified port
  console.log(`Example app listening on port: ${PORT}`);
});