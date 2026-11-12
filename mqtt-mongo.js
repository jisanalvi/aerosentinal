require('dotenv').config();

const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Atlas Connected!'))
.catch(err => console.log('MongoDB Error:', err.message));

// Create data structure
const Sensor = mongoose.model('Sensor', {
    topic: String,
    payload: String,
    receivedAt: {
        type: Date,
        default: Date.now
    }
});

// Connect to MQTT
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('Node.js connected to MQTT!');

    client.subscribe('aerosentinal/test');
});

// Receive and save messages
client.on('message', async (topic, message) => {
    const data = message.toString();

    console.log('Received:', data);

    try {
        await Sensor.create({
            topic: topic,
            payload: data
        });

        console.log('Data saved to MongoDB Atlas!');
    } catch (err) {
        console.log('Database error:', err.message);
    }
});