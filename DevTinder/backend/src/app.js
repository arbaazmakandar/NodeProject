const express = require("express");

const app = express(); // Instance of expressJS application

//This function is called as request handler
app.use("/test", (req, res) => {
  res.send("Hello from the server2");
});

app.listen(3000, () => {
  console.log("Server is successfully listening on port", 3000);
});
