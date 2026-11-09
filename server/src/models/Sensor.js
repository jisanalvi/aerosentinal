const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    gasLevel: {
        type: Number,
        required: true
    },
    airQuality: {
        type: String,
        default: "Unknown"
    },
    deviceId: {
        type: String,
        default: "ESP8266_01"
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Sensor", sensorSchema);