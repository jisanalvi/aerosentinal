// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Sensor model
// const Sensor = mongoose.model('Sensor', {
//   topic: String,
//   payload: String,
//   receivedAt: Date
// });

// // Test API
// app.get('/', (req, res) => {
//   res.send('AeroSentinel Backend is Running!');
// });

// // Get all sensor records
// app.get('/api/sensors', async (req, res) => {
//   try {
//     const data = await Sensor.find().sort({ receivedAt: -1 });
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Get latest sensor record
// app.get('/api/sensors/latest', async (req, res) => {
//   try {
//     const data = await Sensor.findOne().sort({ receivedAt: -1 });
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Connect to MongoDB Atlas and start server
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB Atlas Connected!');

//     const PORT = process.env.PORT || 5000;

//     app.listen(PORT, () => {
//       console.log(`AeroSentinel API running on port ${PORT}`);
//     });
//   })
//   .catch(err => {
//     console.error('MongoDB Connection Error:', err.message);
//   });


require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// 1. CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;

const MQTT_TOPIC = process.env.MQTT_TOPIC || "aerosentinal/test";

// =====================================================
// 2. SENSOR DATABASE MODEL
// =====================================================

const Sensor = mongoose.model("Sensor", {
    topic: String,
    payload: String,
    receivedAt: Date
});

// =====================================================
// 3. API ROUTES
// =====================================================

// Backend health check
app.get("/", (req, res) => {
    res.send("AeroSentinel Cloud Backend is Running!");
});

// Get all sensor records
app.get("/api/sensors", async (req, res) => {
    try {
        const data = await Sensor.find()
            .sort({ receivedAt: -1 })
            .limit(100);

        res.json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// Get latest sensor record
app.get("/api/sensors/latest", async (req, res) => {
    try {
        const data = await Sensor.findOne()
            .sort({ receivedAt: -1 });

        res.json(data);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});

// =====================================================
// 4. EMQX CLOUD MQTT CONNECTION
// =====================================================

function connectMQTT() {

    if (!process.env.MQTT_URL) {
        console.error("[MQTT] MQTT_URL is missing!");
        return;
    }

    const client = mqtt.connect(process.env.MQTT_URL, {

        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,

        reconnectPeriod: 5000,
        connectTimeout: 30000,

        clean: true,
        keepalive: 60

    });

    // Successful connection
    client.on("connect", () => {

        console.log("[MQTT] Connected to EMQX Cloud!");

        client.subscribe(MQTT_TOPIC, (err) => {

            if (err) {
                console.error(
                    "[MQTT] Subscription error:",
                    err.message
                );
            } else {
                console.log(
                    "[MQTT] Subscribed to:",
                    MQTT_TOPIC
                );
            }

        });

    });

    // Receive sensor messages
    client.on("message", async (topic, message) => {

        const payload = message.toString();

        console.log("[MQTT] Message received!");
        console.log("[MQTT] Topic:", topic);
        console.log("[MQTT] Payload:", payload);

        try {

            // Save raw sensor payload to MongoDB Atlas
            const newSensor = new Sensor({

                topic: topic,

                payload: payload,

                receivedAt: new Date()

            });

            await newSensor.save();

            console.log(
                "[MongoDB] Sensor data saved successfully!"
            );

        } catch (err) {

            console.error(
                "[MongoDB] Save error:",
                err.message
            );

        }

    });

    // Connection errors
    client.on("error", (err) => {

        console.error(
            "[MQTT] Connection error:",
            err.message
        );

    });

    // Reconnection
    client.on("reconnect", () => {

        console.log(
            "[MQTT] Reconnecting to EMQX Cloud..."
        );

    });

    // Offline
    client.on("offline", () => {

        console.log("[MQTT] Client offline");

    });

    return client;
}

// =====================================================
// 5. START DATABASE AND SERVER
// =====================================================

async function startServer() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log(
            "[MongoDB] Connected to MongoDB Atlas!"
        );

        app.listen(PORT, () => {

            console.log(
                `[Server] AeroSentinel running on port ${PORT}`
            );

            // Connect MQTT after database is ready
            connectMQTT();

        });

    } catch (err) {

        console.error(
            "[Startup] MongoDB connection failed:",
            err.message
        );

        process.exit(1);

    }

}

startServer();