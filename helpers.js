// urlDatabase object to store URL info
let urlDatabase = {
  b6UTxQ: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "22@22.ca",
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "22@22.ca",
  },
};

// User object to store users
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


// Function to generate a string to create shortURL ID
const generateRandomString = function() {
  // Variable called randomString to store the shortURL ID
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

// Function to get user by email
const getUserByEmail = function(email, users) {
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

// Check if user is logged in (middleware)
const checkIfLoggedIn = function (req, res, next) {
  // Check if user_id cookie is already stored
  if (req.session.user_id) {
    // If cookie is found, user is logged in, continue to the next middleware or route handler
    next();
  } else {
    // If cookie is not found, user is not logged in, redirect to the /login page
    res.redirect('/login');
  }
};

// Check if user is not logged in (helper function)
const checkIfNotLoggedIn = function (req, res, next) {
  // Check if the user_id cookie is not already stored
  if (!req.session.user_id) {
    // If the user is not logged in, continue to the next middleware or route handler
    next();
  } else {
    // If the user is logged in, redirect to the /urls page
    res.redirect('/urls');
  }
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

module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  getUserByEmail,
  getUserById,
  checkIfLoggedIn,
  checkIfNotLoggedIn,
  urlsForUser
};