const { AuthenticationError } = require("apollo-server");

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

module.exports = (context) => {
  // Get auth string from header
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    // Retrieve the token value from string (Bearer <token>)
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        // Verify token with jsonwebtoken then return user.
        const user = jwt.verify(token, SECRET_KEY);
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]");
  }
  throw new Error("Authorisation header must be provided");
};
