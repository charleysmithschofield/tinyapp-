// Import the express module from the library
const express = require("express");
// Import cookie-parser
const cookieParser = require("cookie-parser");
// Import bcrypt
const bcrypt = require("bcryptjs");


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
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "22@22.ca",
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "22@22.ca",
  },
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
const generateRandomString = function() {
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
const getUserById = function(userId) {
  // Check if the userId is not undefined and if the user with that ID exists
  if (userId && users[userId]) {
    // If found, return the user object
    return users[userId];
  }
  // If user is not found or userId is undefined, return null
  return null;
};

// Filter URLs by userID
const urlsForUser = function(userID) {
  // Initialize an empty object to store the user's URLs
  const userURLs = {};
  // Loop through all URLs in the database
  for (const shortURL in urlDatabase) {
    // Check if the userID matches the userID associated with the URL
    if (urlDatabase[shortURL].userID === userID) {
      // If it matches, add the URL to the userURLs object
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  // Return the URLs belonging to the user
  return userURLs;
};



// GETS HERE -------------------------------------------

// GET route for the root endpoint
app.get("/", (req, res) => {
  // Send "Hello!" as the response when a GET request is made to the root endpoint
  res.send("Hello!");
});



// GET route for /urls.json endpoint
app.get("/urls.json", (req, res) => {
  // Send the urlDatabase object as a JSON response when a GET request is made to the "/urls.json" endpoint
  res.json(urlDatabase);
});



// GET route for /hello endpoint
app.get("/hello", (req, res) => {
  // Send the HTML response with a greeting to the world
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// GET route for /urls endpoint
app.get("/urls", (req, res) => {
  // Retrieve the user object based on the user_id cookie
  const user = getUserById(req.cookies["user_id"]);

  // Check if the user is not logged in
  if (!user) {
    // If the user is not logged in, render an error message suggesting to log in or register first
    return res.status(401).send(`
    <h1>You must log in or register first to view your shortened URLs.</h1>
    <p><a href="/login">Log in</a> or <a href="/register">Register</a></>
  `);
  }

  // Filter URLs to display only the URLs belonging to the logged-in user
  const userURLs = urlsForUser(user.id);


  // Create template variable object to pass to he templateVars
  const templateVars = {
    user: user, // Pass the user object to the template
    urls: urlDatabase // Pass the urlDatabase object to the template
  };

  // Render the "urls_index" template with the template variables
  res.render("urls_index", templateVars);
});



// GET route for /urls/new
app.get("/urls/new", (req, res) => {
  // Retrieve the user object based on the user_id cookie
  const user = getUserById(req.cookies["user_id"]);

  // check if the user is not logged in
  if (!user) {
    // if user is not logged in redirect the user to the /login endpoint
    return res.redirect("/login");
  }

  // Provide the urlDatabase to the urls_index template
  const templateVars = {
    user: user, // Pass the user object to the template
    urls: urlDatabase
  };

  // Render the urls_new template for creating a new shortened URL
  res.render("urls_new", templateVars);
});



// GET route for the "/urls/:id" endpoint
app.get("/urls/:id", (req, res) => {
  // Fetch the short URL from the request parameters
  const shortURL = req.params.id;

  // Retrieve the user object based on the user_id cookie
  const user = getUserById(req.cookies["user_id"]);

  // Check if the short URL exists in the urlDatabase
  if (urlDatabase[shortURL]) {
    // Check if the user is logged in
    if (user) {
      // Check if the URL belongs to the logged-in user
      if (urlDatabase[shortURL].userID === user.id) {
        // Provide the id, longURL, and user_id to the urls_show template
        const templateVars = {
          id: shortURL,
          longURL: urlDatabase[shortURL].longURL,
          user: user
        };
        // Render the urls_show template
        res.render("urls_show", templateVars);
      } else {
        // If the URL does not belong to the logged-in user, send an error message
        res.status(403).send("You do not have permission to access this URL.");
      }
    } else {
      // If the user is not logged in, send a relevant error message
      res.status(401).send("You must be logged in to access this URL.");
    }
  } else {
    // If the short URL does not exist, send a 404 error message
    res.status(404).send("Shortened URL not found");
  }
});



// GET route for the "/register" endpoint
app.get("/register", (req, res) => {
  // Define the user object based on the user_id cookie
  const user = getUserById(req.cookies && req.cookies.user_id);

  // Check if the user is already logged in
  if (user) {
    // redirect to the GET /urls
    res.redirect("/urls");
  }

  // Render the register template for the registration form
  // Pass the user_id retrieved from cookies to the template
  res.render("register", { user: user });
});



// GET route for the "/login" endpoint
app.get('/login', (req, res) => {

  // Check if the user is already logged in
  const user = getUserById(req.cookies.user_id);
  if (user) {
    // If user is already logged in, redirect to the /urls page
    return res.redirect("/urls");
  }
  // If the user is not logged in, render the login page
  res.render('login', { user: req.user }); // Assuming user data is available in req.user
});


// POSTS HERE =======================================================


// POST route for the /urls endpoint
app.post("/urls", (req, res) => {
  // Define userID
  const userID = req.cookies.user_id;
  // Check if the user is logged in
  const user = getUserById(userID);
  if (!user) {
    // If the user is not logged in, display an HTML message stating they must be logged in to shorten URLs
    return res.status(403).send("<h1>You must be logged in to shorten URLs.</h1>");
  }

  // Retrieve longURL from the request body
  const longURL = req.body.longURL;

  // Generate shortURL
  const shortURL = generateRandomString();

  // Adjust the following line to include both longURL and userID in the structure
  urlDatabase[shortURL] = { longURL, userID };

  // Redirect to the new URL's page
  res.redirect(`/urls`);
});



// POST route to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  // Retrieve the URL ID from the request parameters
  const urlId = req.params.id;

  // Check if the user is logged in
  const userId = req.cookies.user_id;
  if (!userId) {
    // If user is not logged in, send an error message
    return res.status(401).send("Error: You are not authorized to delete this URL.");
  }

  // Check if the logged-in user is the owner of the URL
  if (urlDatabase[urlId].userID !== userId) {
    // If user is now the owner of the URL, send an error message
    return res.status(403).send("Error: You are not authorized to delete this URL.");
  }

  // Delete the URL from the urlDatabase
  delete urlDatabase[urlId];
  // Redirect back to the urls index page ("/urls")
  res.redirect("/urls");
});



// GET route for /u/:id endpoint
app.get("/u/:id", (req, res) => {
  // Fetch the long URL from the urlDatabase by providing the corresponding id
  const longURL = urlDatabase[req.params.id];

  // Check if the short URL exists in the urlDatabase
  if (longURL) {
    // If the short URL exists, redirect the user to the corresponding long URL
    res.redirect(longURL.longURL);
  } else {
    // If the short URL does not exist, send a 404 error response with a relevant message
    res.status(404).send("Shortened URL not found");
  }
});




// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  // Extract the URL ID from the request parameters
  const urlId = req.params.id;
  // Get the logged in user ID
  const userId = req.cookies.user_id;

  // Check if the URL ID exists in the urlDatabase
  if (!urlDatabase[urlId]) {
    return res.status(404).send("URL not found");
  }

  // Check if the user is logged in
  if (!userId) {
    return res.status(401).send("You must be logged in to update a URL");
  }
  // Check if the logged-in user owns the URL
  if (urlDatabase[urlId].userID !== userId) {
    return res.status(403).send("You are not authorized to update this URL");
  }
  // Retrieve the updated long URL from the request body
  const updatedLongURL = req.body.updatedLongURL;

  // Update the long URL in the urlDatabase with the new value
  urlDatabase[urlId].longURL = updatedLongURL;

  // Redirect the client back to the /urls page
  res.redirect("/urls");
});

// POST route to /login
app.post("/login", (req, res) => {
  // Retrieve the email and password from the request body
  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  const user = getUserByEmail(email);

  try {
    // Check if user exists and if the password matches
    if (user && bcrypt.compareSync(password, user.password)) {
      // Set a cookie named 'user_id' with the user's ID
      res.cookie('user_id', user.id);
      // Redirect the user back to the /urls page
      res.redirect('/urls');
    } else {
      // If user does not exist or password is incorrect, send error status code and error message
      res.status(403).send("Error: Incorrect email or password");
    }
  } catch (error) {
    // Handle errors thrown by bcrypt.compareSync
    console.error("Error:", error.message);
    res.status(500).send("Internal Server Error");
  }
});



// POST route to /logout
app.post("/logout", (req, res) => {
  // Clear the username cookie
  res.clearCookie('user_id');
  // Redirect the user back to the /urls page
  res.redirect('/login');
});


// Helper function to find user by email
const getUserByEmail = function(email) {
  // For in loop to iterate through the users
  for (const userId in users) {
    // Check if the email used matches an email already in the current users
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  // If user is not found, return null
  return null;
};



// POST route for the /register endpoint
app.post("/register", (req, res) => {

  // Retrieve email and password from the request body
  const email = req.body.email;
  const password = req.body.password;

  // Check if the email or password is an empty string
  if (email === "" || password === "") {
    // If either is empty, send a 400 Bad Request status code with error message indicating empty email or password
    return res.status(400).send("Error: Empty Email or Password");
  }

  // check if the email already exists
  if (getUserByEmail(email)) {
    // If the email already exists, send a 500 Bad Request status code with an error message indicating the email already exists
    return res.status(400).send("Error: Email already exists");
  }

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Continue with registration process
  // Generate a random user object
  const userId = generateRandomString();
  
  // Create a new user object
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword
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