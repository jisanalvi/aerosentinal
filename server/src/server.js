const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const cors = require("cors");
require("dotenv").config();

const Sensor = require("./models/Sensor");

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

    client.subscribe("aerosentinal/test", (err) => {
        if (err) {
            console.log("MQTT subscription error:", err);
        } else {
            console.log("Subscribed to AeroSentinal topic");
        }
    });
});

// Receive and save sensor data
client.on("message", async (topic, message) => {
    console.log("Received:", message.toString());

    try {
        const data = JSON.parse(message.toString());

        if (
            typeof data.temperature !== "number" ||
            typeof data.humidity !== "number" ||
            typeof data.gasLevel !== "number"
        ) {
            console.log("Invalid sensor data. Skipping save.");
            return;
        }

        const newReading = new Sensor({
            temperature: data.temperature,
            humidity: data.humidity,
            gasLevel: data.gasLevel,
            airQuality: data.airQuality || "Unknown",
            deviceId: data.deviceId || "ESP8266_01"
        });

        await newReading.save();

        console.log("Sensor data saved to MongoDB!");

    } catch (error) {
        console.log("Could not process message:", error.message);
    }
});

// Test API
app.get("/", (req, res) => {
    res.send("MERN + MQTT Backend is running!");
});

// Get sensor readings
app.get("/api/sensors", async (req, res) => {
    try {
        const sensors = await Sensor.find()
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(sensors);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Publish MQTT message
app.post("/api/mqtt/publish", (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({
            error: "Message is required"
        });
    }

    client.publish("aerosentinal/test", message);

    res.json({
        success: true,
        message
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});