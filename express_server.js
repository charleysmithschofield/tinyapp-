// Import the express module from the library
const express = require("express");

// Create an instance of Express
const app = express();

// Define the port number for the server to listen on (8080 default port)
const PORT = 8080;

// Middle-ware to parse the URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Sets view engine to ejs
app.set("view engine", "ejs");

// A database storing shortened URLs as key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Function to generate a string of 6 random alphanumeric characters
function generateRandomString() {
  // Variable called randomString to store the random alphanumeric string
  let randomString = '';
  // Variable called characters containing the alphabet in lower and uppercase, as well as, the numbers from 0 to 9
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV0123456789';
  // For loop to iterate the characters
  for (let i = 0; i < 6; i++) {
    // add random characters to the randomString. Use .charAt, Math.floor and Math.random to generate random characters
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
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
  // Send the HTML response with a greeting to the world
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Route handler for the "/urls" endpoint
app.get("/urls", (req, res) => {
  // Provide the urlDatabase to the urls_index template
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Route handler for URLs new page
app.get("/urls/new", (req, res) => {
  // Render the urls_new template for creating a new shortened URL
  res.render("urls_new");
});

// Route handler for the "/urls/:id" endpoint
app.get("/urls/:id", (req, res) => {
  // Fetch the long URL from the urlDatabase by providing the corresponding id
  const longURL = urlDatabase[req.params.id];
  // Provide the id and longURL to the urls_show template
  const templateVars = { id: req.params.id, longURL: longURL };
  res.render("urls_show", templateVars);
});

// Route handler for the "/urls" endpoint to handle POST requests
app.post("/urls", (req, res) => {
  // Retrieve longURL from the request body
  const longURL = req.body.longURL;

  // Generate shortURL
  const shortURL = generateRandomString();

  // Add shortURL and longURL to urlDatabase
  urlDatabase[shortURL] = longURL;
  
  // Redirect to the new URL's page
  res.redirect(`/urls/${shortURL}`);
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message indicating that the server is running and listening on the specified port
  console.log(`Example app listening on port: ${PORT}`);
});
