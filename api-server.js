require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Sensor model
const Sensor = mongoose.model('Sensor', {
  topic: String,
  payload: String,
  receivedAt: Date
});

// Test API
app.get('/', (req, res) => {
  res.send('AeroSentinel Backend is Running!');
});

// Get all sensor records
app.get('/api/sensors', async (req, res) => {
  try {
    const data = await Sensor.find().sort({ receivedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get latest sensor record
app.get('/api/sensors/latest', async (req, res) => {
  try {
    const data = await Sensor.findOne().sort({ receivedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB Atlas and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas Connected!');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`AeroSentinel API running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
  });