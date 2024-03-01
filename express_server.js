// Import the express module from the library
const express = require("express");
// Create an instance of Express
const app = express();
// Define the port number for the server to listen on (8080 default port)
const PORT = 8080;

app.set("view engine", "ejs");

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

// Route handler for the "/hello" endpoint
app.get("/hello", (req, res) => {
  // Send the HTML resoibse with a greeting to the world
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route handler for the "/urls" endpoint
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Route handler for the "urls/:id"
app.get("/urls/:id", (req, res) => {
  // Fetch the long URL from the urlDatabase by providing the corresponding id
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message indicatign that the server is running and listening on the specified port
  console.log(`Example app listening on port: ${PORT}`);
});