import { useEffect, useState } from "react";

import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Cpu,
  Clock,
  Wifi
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

// API CONNECTION
const API_URL = "https://aerosentinal.onrender.com/api/sensors/latest";

// SENSOR CARD
function SensorCard({ icon: Icon, title, value, unit, status, color, note }) {
  return (
    <div className="lm-sensor-card">
      <div className="lm-card-top">
        <div className={`lm-icon ${color}`}>
          <Icon size={20} />
        </div>

        <span className="lm-status">
          <span className="live-dot"></span>
          {status}
        </span>
      </div>

      <p className="lm-card-title">{title}</p>

      <div className="lm-reading">
        {value}
        <span>{unit}</span>
      </div>

      <p className="lm-card-note">
        {note || "Sensor reading"}
      </p>
    </div>
  );
}

// SENSOR CHART
function SensorChart({ title, subtitle, dataKey, unit, color, data }) {
  return (
    <div className="panel lm-chart-panel">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <span className="lm-demo-tag">LIVE</span>
      </div>

      <div className="lm-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#26394b" strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              stroke="#8295a9"
              tick={{ fontSize: 9 }}
            />

            <YAxis
              stroke="#8295a9"
              tick={{ fontSize: 9 }}
              width={45}
            />

            <Tooltip
              contentStyle={{
                background: "#142438",
                border: "1px solid #315267",
                borderRadius: "8px",
                color: "#ffffff"
              }}
              formatter={(value) => [`${value} ${unit}`, title]}
            />

            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// MAIN COMPONENT
function LiveMonitoring() {

  const [sensorData, setSensorData] = useState(null);
  const [apiStatus, setApiStatus] = useState("Connecting...");
  const [chartData, setChartData] = useState([]);

  // FETCH LATEST SENSOR DATA
  useEffect(() => {

    const fetchSensorData = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();

        setSensorData(data);
        setApiStatus("Connected");

      } catch (error) {
        setApiStatus("Disconnected");
        console.error("Sensor API error:", error);
      }
    };

    fetchSensorData();

    const interval = setInterval(fetchSensorData, 3000);

    return () => clearInterval(interval);

  }, []);

  // FETCH HISTORICAL SENSOR DATA
  useEffect(() => {

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          "https://aerosentinal.onrender.com/api/sensors"
        );

        if (!response.ok) {
          throw new Error("Historical API request failed");
        }

        const records = await response.json();

        const history = records
          .map((record) => {
            try {
              const payload = JSON.parse(record.payload || "{}");

              return {
                time: new Date(record.receivedAt).toLocaleTimeString(),
                mq2: Number(payload.m2r),
                mq135: Number(payload.m1r),
                temperature: Number(payload.tmp),
                humidity: Number(payload.hum),
                pressure: Number(payload.prs)
              };

            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reverse();

        setChartData(history);

      } catch (error) {
        console.error("Historical data error:", error);
      }
    };

    fetchHistory();

    const interval = setInterval(fetchHistory, 10000);

    return () => clearInterval(interval);

  }, []);

  // PARSE LIVE SENSOR DATA
  const payload = sensorData?.payload || "{}";

  let parsedPayload = {};

  try {
    parsedPayload = JSON.parse(payload);
  } catch (error) {
    console.error("Invalid sensor payload:", error);
  }

  const getReading = (key) => {
    const value = parsedPayload[key];

    return value !== undefined &&
      value !== null &&
      Number.isFinite(Number(value))
      ? Number(value)
      : null;
  };

  const temperature = getReading("tmp");
  const humidity = getReading("hum");
  const pressure = getReading("prs");

  const mq135 = getReading("m1r");
  const mq2 = getReading("m2r");

  const hasLiveReadings = [
    temperature,
    humidity,
    pressure,
    mq135,
    mq2
  ].some(value => value !== null);

  // LAST HARDWARE UPDATE
  const lastUpdate = sensorData?.receivedAt
    ? new Date(sensorData.receivedAt).toLocaleString()
    : "Waiting for sensor data";

  // REAL-TIME DATA AGE
  const dataAgeSeconds = sensorData?.receivedAt
    ? (Date.now() - new Date(sensorData.receivedAt).getTime()) / 1000
    : null;

  // DEVICE STATUS CALCULATION
  const getDeviceStatus = (reading) => {

    if (reading === null || reading === undefined) {
      return "WAITING";
    }

    if (
      dataAgeSeconds === null ||
      !Number.isFinite(dataAgeSeconds) ||
      dataAgeSeconds < 0
    ) {
      return "WAITING";
    }

    if (dataAgeSeconds <= 15) {
      return "LIVE";
    }

    if (dataAgeSeconds <= 60) {
      return "STALE";
    }

    return "OFFLINE";
  };

  // INDIVIDUAL DEVICE STATUSES
  const espStatus = getDeviceStatus(
    hasLiveReadings ? true : null
  );

  const mq2Status = getDeviceStatus(mq2);
  const mq135Status = getDeviceStatus(mq135);
  const bmpStatus = getDeviceStatus(pressure);
  const dhtStatus = getDeviceStatus(humidity);

  // STATUS DESCRIPTION
  const getStatusMessage = (status) => {

    switch (status) {

      case "LIVE":
        return "Receiving recent sensor data";

      case "STALE":
        return "Sensor data is delayed";

      case "OFFLINE":
        return "No recent sensor data received";

      default:
        return "Waiting for sensor data";
    }
  };

  return (
    <main className="dashboard">

      {/* PAGE HEADING */}

      <section className="welcome-section">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL / SENSOR NETWORK
          </span>

          <h1>Live <span>Monitoring</span></h1>

          <p>
            Detailed environmental and gas sensor measurements.
          </p>
        </div>

        <div className="lm-demo-banner">
          <Activity size={15} />
          {hasLiveReadings ? "PARTIAL LIVE DATA" : "WAITING FOR SENSOR DATA"}
        </div>
      </section>

      {/* CONNECTION BANNER */}

      <div className="system-banner">

        <div className="banner-icon">
          <Wifi size={22} />
        </div>

        <div className="banner-text">
          <strong>
            API Status: {apiStatus}
          </strong>

          <p>
            {apiStatus === "Disconnected"
              ? "Unable to connect to the Render backend."
              : hasLiveReadings
                ? "Sensor readings received from the database."
                : "Backend connected. Waiting for actual sensor readings."}
          </p>
        </div>

        <div className="banner-right">
          {apiStatus.toUpperCase()}
        </div>

      </div>

      {/* GAS SENSOR READINGS */}

      <div className="lm-section-heading">
        <h2>Gas Sensor Readings</h2>
        <span>RAW ADC VALUES</span>
      </div>

      <div className="metrics-grid">

        <SensorCard
          icon={Activity}
          title="MQ2 Gas Sensor"
          value={mq2 !== null ? mq2 : "--"}
          unit="ADC"
          status={mq2Status}
          color="cyan"
          note={mq2 !== null ? "Actual hardware reading" : "Waiting for hardware data"}
        />

        <SensorCard
          icon={Activity}
          title="MQ135 Air Quality Sensor"
          value={mq135 !== null ? mq135 : "--"}
          unit="ADC"
          status={mq135Status}
          color="orange"
          note={mq135 !== null ? "Actual hardware reading" : "Waiting for hardware data"}
        />

      </div>

      {/* ENVIRONMENTAL READINGS */}

      <div className="lm-section-heading">
        <h2>Environmental Parameters</h2>
        <span>AMBIENT CONDITIONS</span>
      </div>

      <div className="metrics-grid">

        <SensorCard
          icon={Thermometer}
          title="Temperature"
          value={temperature !== null ? temperature : "--"}
          unit="°C"
          status={getDeviceStatus(temperature)}
          color="purple"
          note={temperature !== null ? "Actual hardware reading" : "Waiting for hardware data"}
        />

        <SensorCard
          icon={Gauge}
          title="Atmospheric Pressure"
          value={pressure !== null ? pressure : "--"}
          unit="hPa"
          status={bmpStatus}
          color="blue"
          note={pressure !== null ? "Actual hardware reading" : "Waiting for hardware data"}
        />

        <SensorCard
          icon={Droplets}
          title="DHT11 Humidity"
          value={humidity !== null ? humidity : "--"}
          unit="%"
          status={dhtStatus}
          color="cyan"
          note={humidity !== null ? "Actual hardware reading" : "Waiting for hardware data"}
        />

      </div>

      {/* SENSOR GRAPHS */}

      <div className="lm-section-heading">
        <h2>Sensor Response History</h2>
        <span>SAMPLE TIME SERIES</span>
      </div>

      <div className="lm-chart-grid">

        <SensorChart
          title="MQ2 Response"
          subtitle="Raw ADC readings over time"
          dataKey="mq2"
          unit="ADC"
          color="#19c6d9"
          data={chartData}
        />

        <SensorChart
          title="MQ135 Response"
          subtitle="Raw ADC readings over time"
          dataKey="mq135"
          unit="ADC"
          color="#f5a742"
          data={chartData}
        />

        <SensorChart
          title="Temperature"
          subtitle="Temperature history"
          dataKey="temperature"
          unit="°C"
          color="#ae8cff"
          data={chartData}
        />

        <SensorChart
          title="Humidity"
          subtitle="DHT11 humidity history"
          dataKey="humidity"
          unit="%"
          color="#19c6d9"
          data={chartData}
        />

        <SensorChart
          title="Atmospheric Pressure"
          subtitle="BMP280 pressure history"
          dataKey="pressure"
          unit="hPa"
          color="#60a9ff"
          data={chartData}
        />

      </div>

      {/* DEVICE HEALTH */}

      <div className="lm-section-heading">
        <h2>Device Health</h2>
        <span>REAL-TIME HARDWARE STATUS</span>
      </div>

      <div className="panel lm-health-panel">

        {/* ESP8266 */}

        <div className="lm-health-item">
          <Cpu size={19} />

          <div>
            <strong>ESP8266 NodeMCU</strong>
            <small>{getStatusMessage(espStatus)}</small>
          </div>

          <span className="lm-pending">
            {espStatus}
          </span>
        </div>

        {/* MQ2 */}

        <div className="lm-health-item">
          <Activity size={19} />

          <div>
            <strong>MQ2 Sensor</strong>
            <small>{getStatusMessage(mq2Status)}</small>
          </div>

          <span className="lm-pending">
            {mq2Status}
          </span>
        </div>

        {/* MQ135 */}

        <div className="lm-health-item">
          <Activity size={19} />

          <div>
            <strong>MQ135 Sensor</strong>
            <small>{getStatusMessage(mq135Status)}</small>
          </div>

          <span className="lm-pending">
            {mq135Status}
          </span>
        </div>

        {/* BMP280 */}

        <div className="lm-health-item">
          <Thermometer size={19} />

          <div>
            <strong>BMP280 Sensor</strong>
            <small>{getStatusMessage(bmpStatus)}</small>
          </div>

          <span className="lm-pending">
            {bmpStatus}
          </span>
        </div>

        {/* DHT11 */}

        <div className="lm-health-item">
          <Droplets size={19} />

          <div>
            <strong>DHT11 Sensor</strong>
            <small>{getStatusMessage(dhtStatus)}</small>
          </div>

          <span className="lm-pending">
            {dhtStatus}
          </span>
        </div>

        {/* LAST UPDATE */}

        <div className="lm-last-update">
          <Clock size={15} />
          Last hardware update: {lastUpdate}
        </div>

      </div>

      {/* FOOTER */}

      <div className="dashboard-footer">
        <span>AEROSENTINEL MONITORING SYSTEM</span>
        <span>LIVE MONITORING MODULE · REAL-TIME DEVICE HEALTH</span>
      </div>

    </main>
  );
}

export default LiveMonitoring;