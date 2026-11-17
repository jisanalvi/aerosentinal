// const express = require("express");
// const mongoose = require("mongoose");
// const mqtt = require("mqtt");
// const cors = require("cors");
// require("dotenv").config();

// const Sensor = require("./models/Sensor");

// const app = express();

// app.use(cors());
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log("MongoDB connected"))
//     .catch(err => console.log("MongoDB error:", err));

// // MQTT connection
// const client = mqtt.connect(process.env.MQTT_URL);

// client.on("connect", () => {
//     console.log("MQTT connected");

//     client.subscribe("aerosentinal/test", (err) => {
//         if (err) {
//             console.log("MQTT subscription error:", err);
//         } else {
//             console.log("Subscribed to AeroSentinal topic");
//         }
//     });
// });

// // Receive and save sensor data
// client.on("message", async (topic, message) => {
//     console.log("Received:", message.toString());

//     try {
//         const data = JSON.parse(message.toString());

//         if (
//             typeof data.temperature !== "number" ||
//             typeof data.humidity !== "number" ||
//             typeof data.gasLevel !== "number"
//         ) {
//             console.log("Invalid sensor data. Skipping save.");
//             return;
//         }

//         const newReading = new Sensor({
//             temperature: data.temperature,
//             humidity: data.humidity,
//             gasLevel: data.gasLevel,
//             airQuality: data.airQuality || "Unknown",
//             deviceId: data.deviceId || "ESP8266_01"
//         });

//         await newReading.save();

//         console.log("Sensor data saved to MongoDB!");

//     } catch (error) {
//         console.log("Could not process message:", error.message);
//     }
// });

// // Test API
// app.get("/", (req, res) => {
//     res.send("MERN + MQTT Backend is running!");
// });

// // Get sensor readings
// app.get("/api/sensors", async (req, res) => {
//     try {
//         const sensors = await Sensor.find()
//             .sort({ timestamp: -1 })
//             .limit(50);

//         res.json(sensors);

//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Publish MQTT message
// app.post("/api/mqtt/publish", (req, res) => {
//     const { message } = req.body;

//     if (!message) {
//         return res.status(400).json({
//             error: "Message is required"
//         });
//     }

//     client.publish("aerosentinal/test", message);

//     res.json({
//         success: true,
//         message
//     });
// });

// // Start server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });




const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const cors = require("cors");
require("dotenv").config();

const Sensor = require("./models/Sensor");

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// 1. CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const MQTT_TOPIC = "aerosentinal/test";

// =====================================================
// 2. MONGODB ATLAS CONNECTION
// =====================================================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("[MongoDB] Connected to MongoDB Atlas");
    })
    .catch(err => {
        console.error("[MongoDB] Connection error:", err.message);
    });

// =====================================================
// 3. EMQX CLOUD MQTT CONNECTION
// =====================================================

const client = mqtt.connect(process.env.MQTT_URL, {

    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,

    reconnectPeriod: 5000,
    connectTimeout: 30000,

    clean: true,
    keepalive: 60
});

// MQTT Connected
client.on("connect", () => {

    console.log("[MQTT] Connected to EMQX Cloud");

    client.subscribe(MQTT_TOPIC, (err) => {

        if (err) {
            console.error("[MQTT] Subscription error:", err.message);
        } else {
            console.log("[MQTT] Subscribed to:", MQTT_TOPIC);
        }

    });

});

// MQTT Error
client.on("error", (err) => {

    console.error("[MQTT] Connection error:", err.message);

});

// MQTT Reconnecting
client.on("reconnect", () => {

    console.log("[MQTT] Reconnecting to EMQX Cloud...");

});

// MQTT Offline
client.on("offline", () => {

    console.log("[MQTT] Client is offline");

});

// =====================================================
// 4. RECEIVE SENSOR DATA
// =====================================================

client.on("message", async (topic, message) => {

    console.log("[MQTT] Received topic:", topic);
    console.log("[MQTT] Payload:", message.toString());

    try {

        const data = JSON.parse(message.toString());

        // Validate incoming sensor data
        if (
            typeof data.temperature !== "number" ||
            typeof data.humidity !== "number" ||
            typeof data.gasLevel !== "number"
        ) {

            console.log("[MQTT] Invalid sensor data. Skipping save.");

            return;
        }

        // Create database document
        const newReading = new Sensor({

            temperature: data.temperature,
            humidity: data.humidity,
            gasLevel: data.gasLevel,

            airQuality: data.airQuality || "Unknown",

            deviceId: data.deviceId || "ESP8266_01"

        });

        // Save to MongoDB Atlas
        await newReading.save();

        console.log("[MongoDB] Sensor data saved successfully!");

    } catch (error) {

        console.error("[MQTT] Could not process message:", error.message);

    }

});

// =====================================================
// 5. TEST API
// =====================================================

app.get("/", (req, res) => {

    res.send("AeroSentinel Cloud Backend is running!");

});

// =====================================================
// 6. GET SENSOR READINGS
// =====================================================

app.get("/api/sensors", async (req, res) => {

    try {

        const sensors = await Sensor.find()
            .sort({ timestamp: -1 })
            .limit(50);

        res.json(sensors);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

// =====================================================
// 7. PUBLISH MQTT MESSAGE
// =====================================================

app.post("/api/mqtt/publish", (req, res) => {

    const { message } = req.body;

    if (!message) {

        return res.status(400).json({
            error: "Message is required"
        });

    }

    if (!client.connected) {

        return res.status(503).json({
            error: "MQTT broker is not connected"
        });

    }

    client.publish(MQTT_TOPIC, message, (err) => {

        if (err) {

            return res.status(500).json({
                error: err.message
            });

        }

        res.json({

            success: true,
            topic: MQTT_TOPIC,
            message: message

        });

    });

});

// =====================================================
// 8. START SERVER
// =====================================================

app.listen(PORT, () => {

    console.log(`[Server] AeroSentinel running on port ${PORT}`);

});