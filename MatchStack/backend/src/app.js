const express = require("express");

const app = express(); // Instance of expressJS application

app.use((req, res) => {
  res.send("Hello from expressJS");
});

app.get("/user", (req, res) => {
  res.send({ firstName: "John", lastName: "Doe" });
});

app.post("/user", (req, res) => {
  console.log("Data is posted successfully");
  res.send("Data is posted successfully");
});

app.delete("/user", (req, res) => {
  res.send("Data is deleted successfully");
});

//Order matters in expressJS,
app.use("/hello/2", (req, res) => {
  res.send("Hello 2");
});

app.use("/hello", (req, res) => {
  res.send("Hello ");
});

//This function is called as request handler
app.use("/test", (req, res) => {
  res.send("test");
});

//This will match to all GET,POST,PUT,DELETE requests to the root path
app.use("/", (req, res) => {
  res.send("dashboard");
});

app.listen(3000, () => {
  console.log("Server is successfully listening on port", 3000);
});
