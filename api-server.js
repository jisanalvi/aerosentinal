
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/aerosentinal')
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log(err));

// Sensor model
const Sensor = mongoose.model('Sensor', {
  topic: String,
  payload: String,
  receivedAt: Date
});

// Test API
app.get('/', (req, res) => {
  res.send('AeroSentinal Backend is Running!');
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

// Start server
app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});
