const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log("MongoDB error:", err));

// MQTT connection
const client = mqtt.connect(process.env.MQTT_URL);

client.on("connect", () => {
    console.log("MQTT connected");
    client.subscribe("demo/messages");
});

// Receive MQTT messages
client.on("message", (topic, message) => {
    console.log("Received:", message.toString());
});

// Test API
app.get("/", (req, res) => {
    res.send("MERN + MQTT Backend is running!");
});

// Publish MQTT message
app.post("/api/mqtt/publish", (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    client.publish("demo/messages", message);
    res.json({ success: true, message });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});