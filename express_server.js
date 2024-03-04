// Import the express module from the library
const express = require("express");

// Import cookie-parser
const cookieParser = require("cookie-parser");

// Create an instance of Express
const app = express();
// Define the port number for the server to listen on (8080 default port)
const PORT = 8080;

// Middle-ware to parse the URL-encoded form data
app.use(express.urlencoded({ extended: true }));
// Middle-ware to parse the cookies
app.use(cookieParser());

// Sets view engine to ejs
app.set("view engine", "ejs");

// Database to store shortened URLs as key-value pairs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Database to store users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
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

// Function to retireve user object by user ID
function getUserById(userId) {
  // Loop through the users object to find the user with the matching ID
  for (const userIdKey in users) {
    // Check if the user ID matches the provided userId
    if (userId === users[userIdKey].id) {
      // If found, return the user object
      return users[userIdKey];
    }
  }
  // If user is not found, return null
  return null;
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
  // Retrieve the user object based on the user_id cookie
  const user = getUserById(req.cookies["user_id"]);

  // Create template variable object to pass to he templateVars
  const templateVars = {
    user: user, // Pass the user object to the template
    urls: urlDatabase // Pass the urlDatabase object to the template
  };

  // Render the "urls_index" template with the template variables
  res.render("urls_index", templateVars);
});

// Route handler for URLs new page
app.get("/urls/new", (req, res) => {
  // Provide the urlDatabase to the urls_index template
  const templateVars = {
    user_id: req.cookies["user_id"], // Access user_id from cookies
    urls: urlDatabase
  };
  // Render the urls_new template for creating a new shortened URL
  res.render("urls_new", templateVars);
});

// Route handler for the "/urls/:id" endpoint
app.get("/urls/:id", (req, res) => {
  // Fetch the long URL from the urlDatabase by providing the corresponding id
  const longURL = urlDatabase[req.params.id];
  // Provide the id, longURL, and user_id to the urls_show template
  const templateVars = {
    id: req.params.id,
    longURL: longURL,
    user_id: req.cookies["user_id"] // Access user_id from cookies
  };
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
  res.redirect(`/urls`);
});

// POST route to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const urlId = req.params.id;
  // Check if the URL exists in the urlDatabase
  if (urlDatabase[urlId]) {
    // Delete the URL from the urlDatabase
    delete urlDatabase[urlId];
    // Redirect back to the urls index page ("/urls")
    res.redirect("/urls");
  } else {
    res.status(404).send("URL not found");
  }
});

// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  // Extract the URL ID from the request parameters
  const urlId = req.params.id;
  
  // Retrieve the updated long URL from the request body
  const updatedLongURL = req.body.updatedLongURL;

  // Check if the URL ID exists in the urlDatabase
  if (urlDatabase[urlId]) {
    // Update the long URL in the urlDatabase with the new value
    urlDatabase[urlId] = updatedLongURL;
    
    // Redirect the client back to the /urls page
    res.redirect("/urls");
  } else {
    // If the URL ID doesn't exist, send a 404 error response
    res.status(404).send("URL not found");
  }
});

// POST route to log in
app.post("/login", (req, res) => {
  // Retrieve the username from the requst body
  const username = req.body.userId;

  // Set a cookie named 'username' with the value submitted from the request body
  res.cookie('user_id', username);

  // Redirect the user back to the /urls page
  res.redirect('/urls');
});

// POST route to log out
app.post("/logout", (req, res) => {
  // Clear the username cookie
  res.clearCookie('user_id');
  // Redirect the user back to the /urls page
  res.redirect('/urls');
});

// GET route for the /register endpoint
app.get("/register", (req, res) => {
  // Define user_id variable based on the user_id cookie
  const user_id = req.cookies.user_id;

  // Define the user object based on the user_id
  const user = getUserById(user_id);

  // Render the register template for the registration form
  // Pass the user_id retrieved from cookies to the template
  res.render("register", { user: user });
});


// POST route for the /register endpoint
app.post("/register", (req, res) => {

  // Generate a random user object
  const userId = generateRandomString();
  
  // Create a new user object
  const newUser = {
    id: userId,
    email: req.body.email,
    password: req.body.password
  };
  
  // Add the new user to the users object
  users[userId] = newUser;
  
  // Log the new user for testing
  console.log("New user registered:", newUser);
  
  // Set a user_id cookie containing the user's new generated ID
  res.cookie('user_id', userId);
  
  // Redirect user to the /urls page
  res.redirect("/urls");
});

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message indicating that the server is running and listening on the specified port
  console.log(`Example app listening on port: ${PORT}`);
});