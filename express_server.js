// Imports
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { urlDatabase, users, getUserByEmail, generateRandomString, getUserById, requireLogin, urlsForUser} = require('./helpers');

// Sets view engine to ejs
app.set("view engine", "ejs");

// Middle-ware to parse the URL-encoded form data
app.use(express.urlencoded({ extended: true }));
// Middle-ware to use json
app.use(express.json());
// Middle-ware to encrypt cookie using cookieSession
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


// GETS HERE -------------------------------------------

// GET route for the root endpoint
app.get("/", (req, res) => {
  // Check if the user is not logged in
  if (!req.session.user_id) {
    // If the user is not logged in, redirect to the login page
    return res.redirect("/login");
  }
  // If the user is logged in, redirect to /urls page
  res.redirect("/urls");
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
app.get("/urls", requireLogin, (req, res) => {
  // Retrieve the user object based on the user_id session
  const user = getUserById(req.session.user_id);

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
app.get("/urls/new", requireLogin, (req, res) => {
  // Retrieve the user object based on the user_id
  const user = getUserById(req.session.user_id);

  // Provide the urlDatabase to the urls_index template
  const templateVars = {
    user: user, // Pass the user object to the template
    urls: urlDatabase
  };
  // Render the urls_new template for creating a new shortened URL
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", requireLogin, (req, res) => {
  const shortURL = req.params.id;

  // Check if the short URL exists in the urlDatabase
  if (urlDatabase[shortURL]) {
    // If the URL exists, render the urls_show template with appropriate data
    const userId = req.session.user_id;
    if (userId) {
      if (urlDatabase[shortURL].userID === userId) {
        const templateVars = {
          id: shortURL,
          longURL: urlDatabase[shortURL].longURL,
          user: getUserById(userId) // You might want to fetch the user object here for rendering purposes
        };
        res.render("urls_show", templateVars);
      } else {
        res.status(403).send("You do not have permission to access this URL.");
      }
    } else {
      res.status(403).send("You must be logged in to access this URL.");
    }
  } else {
    // If the URL does not exist, send a status code of 404
    res.status(404).send("Shortened URL not found");
  }
});


// GET route for the "/register" endpoint
app.get("/register", (req, res) => {
  // Define the user object based on the user_id
  const user = getUserById(req.session.user_id);

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
  const user = getUserById(req.session.user_id);
  if (user) {
    // If user is already logged in, redirect to the /urls page
    return res.redirect("/urls");
  }
  // If the user is not logged in, render the login page
  res.render('login', { user: req.user }); // Assuming user data is available in req.user
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



// POSTS HERE =======================================================

// POST route for the /urls endpoint
app.post("/urls", (req, res) => {
  // Retrieve the user object based on the user_id session
  const user = getUserById(req.session.user_id);

  // Check if the user is not logged in
  if (!user) {
    // If the user is not logged in, respond with an HTML message explaining why they cannot shorten URLs
    return res.status(401).send(`
      <h1>You must log in to create a new URL.</h1>
      <p><a href="/login">Log in</a></p>
    `);
  }

  // Retrieve longURL from the request body
  const longURL = req.body.longURL;

  // Generate shortURL
  const shortURL = generateRandomString();

  // Store the URL in the database along with the user ID only if the user is logged in
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id }; // Assuming the user_id is stored in the session

  // Redirect to the /urls page
  res.redirect(`/urls`);
});


// POST route to delete a URL
app.post("/urls/:id/delete", (req, res) => {
  // Check if the user is logged in
  const userId = req.session.user_id;
  // Retrieve the URL ID from the request parameters
  const urlId = req.params.id;

  if (!userId) {
    // If user is not logged in, send an error message
    return res.status(401).send("Error: You are not authorized to delete this URL.");
  }
  
  // Check if the URL ID exists in the database
  if (!urlDatabase[urlId]) {
    // If the URL does not exist, send an error message
    return res.status(404).send("Error: URL not found.");
  }

  // Check if the logged-in user is the owner of the URL
  if (urlDatabase[urlId].userID !== userId) {
    // If user is not the owner of the URL, send an error message
    return res.status(403).send("Error: You are not authorized to delete this URL.");
  }
  // Delete the URL from the urlDatabase
  delete urlDatabase[urlId];
  // Redirect back to the urls index page ("/urls")
  res.redirect("/urls");
});


// POST route to update a URL
app.post("/urls/:id", (req, res) => {
  // Extract the URL ID from the request parameters
  const urlId = req.params.id;
  // Get the logged in user ID from session
  const userId = req.session.user_id;

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
  const user = getUserByEmail(email, users);

  try {
    // Check if user exists and if the password matches
    if (user && bcrypt.compareSync(password, user.password)) {
      // Set a cookie named 'user_id' with the user's ID
      req.session.user_id = user.id;
      // Redirect the user back to the /urls page
      res.redirect('/urls');
    } else {
      // If user does not exist or password is incorrect, send error status code and error message
      res.status(403).send("Error: Incorrect email or password");
    }
  } catch (error) {
    // Handle errors thrown by bcrypt.compareSync
    console.error("Error:", error.message);
    res.status(500).send("An unexpected error occurred. Please try again later.");
  }
});


// POST route to /logout
app.post("/logout", (req, res) => {
  // Clear the username cookie
  req.session.user_id = null;
  // Redirect the user back to the /urls page
  res.redirect('/login');
});


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
  if (getUserByEmail(email, users)) {
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
  req.session.user_id = userId;
  
  // Redirect user to the /urls page
  res.redirect("/urls");
});


// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  // Log a message indicating that the server is running and listening on the specified port
  console.log(`Example app listening on port: ${PORT}`);
});