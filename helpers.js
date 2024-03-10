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

module.exports = {
  getUserByEmail
};