
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
    console.log('Node.js connected to MQTT!');

    client.subscribe('aerosentinal/test');

    client.publish(
        'aerosentinal/test',
        'Hello from Node.js!'
    );
});

client.on('message', (topic, message) => {
    console.log('Topic:', topic);
    console.log('Message:', message.toString());
});

client.on('error', (error) => {
    console.log('MQTT Error:', error.message);
});
