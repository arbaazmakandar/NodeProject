const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const { validateSignUp } = require("./utils/validation");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express(); // Instance of expressJS application

// app.get("/getUserData", (req, res) => {
//   throw new Error("Error in getUserData");
// });

// app.use("/", (err, req, res, next) => {
//   if (err) {
//     console.log("Error is handled");
//     res.status(500).send("Error is handled");
//   }
// });

// app.get("/user", (req, res) => {
//   res.send({ firstName: "John", lastName: "Doe" });
// });

// app.post("/user", (req, res) => {
//   console.log("Data is posted successfully");
//   res.send("Data is posted successfully");
// });

// app.delete("/user", (req, res) => {
//   res.send("Data is deleted successfully");
// });

//Order matters in expressJS,
// app.use("/hello/2", (req, res) => {
//   res.send("Hello 2");
// });

// app.use("/hello", (req, res) => {
//   res.send("Hello ");
// });

//This function is called as request handler
// app.use("/test", (req, res) => {
//   res.send("test");
// });

//This will match to all GET,POST,PUT,DELETE requests to the root path
// app.use("/", (req, res) => {
//   res.send("dashboard");
// });
app.use(express.json()); // Middleware to parse JSON request body, as we have not given any route it applies to all the routes
app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  try {
    validateSignUp(req); // Validate the request body
    const encryptedPassword = await bcrypt.hash(password, 10); // Encrypt the password
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: encryptedPassword,
    });
    await user.save();
    res.send("User data is saved successfully");
  } catch (error) {
    res.status(400).send("Error saving user data" + error.message);
  }
});

app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user || user.length === 0) {
      return res.status(404).send("Invalid Credentials");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).send("Invalid Credentials");
    }
    const token = jwt.sign({ userId: user._id }, "your_secret_key", {
      expiresIn: "1h",
    }); // Generate JWT token with user ID and secret key
    res.cookie("token", token); // Set the token in a cookie
    res.send("Login successful");
  } catch (error) {
    res.status(500).send("Error during login: " + error.message);
  }
});

app.use(cookieParser()); // Middleware to parse cookies

app.get("/profile", (req, res) => {
  const cookies = req.cookies; // Access cookies from the request
  console.log("Cookies:", cookies);
  res.send("Profile data retrieved successfully");
});

//get user by emailId
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId; // Get emailId from query parameters

  console.log("Received emailId:", userEmail); // Log the received emailId
  try {
    const user = await User.find({ emailId: userEmail });
    if (!user || user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.json(user);
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

//Feed API:- GET /feed - get all users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.json(users); // Send the users as JSON response
  } catch (error) {
    console.error("Error retrieving feed data:", error);
    res.status(500).send("Error retrieving feed data");
  }
});

//findById
app.get("/userId", async (req, res) => {
  const userId = req.body._id; // Get userId from request body
  try {
    const user = await User.findById(userId); // Find user by ID
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.json(user); // Send the user as JSON response
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

//Delete the User from DB

app.delete("/user", async (req, res) => {
  const userId = req.body._id; // Get userId from request body
  try {
    const deletedUser = await User.findByIdAndDelete(userId); // Find user by ID and delete
    if (!deletedUser) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    console.error("Error deleting user data:", error);
    res.status(500).send("Error deleting user data");
  }
});

//Update User

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId; // Get userId from request parameters
  const updatedData = req.body; // Get updated data from request body

  try {
    const allowedUpdates = ["photoUrl", "about", "age", "gender", "skills"];
    const isValidUpdate = Object.keys(updatedData).every((key) =>
      allowedUpdates.includes(key),
    );

    if (!isValidUpdate) {
      return res.status(400).send("Invalid updates");
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      returnDocument: "after", // Return the updated document
      runValidators: true, // Validate the updated data before saving
    }); // Find user by ID and update
    if (!updatedUser) {
      res.status(404).send("User not found");
    } else {
      res.json(updatedUser); // Send the updated user as JSON response
    }
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Error updating user data");
  }
});

connectDB()
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port", 3000);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
