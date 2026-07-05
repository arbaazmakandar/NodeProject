const validator = require("validator");

const validateSignUp = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Invalid email address");
  }
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    );
  }
};

module.exports = { validateSignUp };
