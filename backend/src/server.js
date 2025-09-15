// backend/src/server.js
require("dotenv").config();
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("🚀 API funcionando");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
