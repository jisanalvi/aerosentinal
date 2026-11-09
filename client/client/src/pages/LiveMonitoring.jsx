import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Radio,
  Cpu,
  Clock,
  CheckCircle2,
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

// DEMONSTRATION DATA — replace with real sensor readings later
const demoData = [
  { time: "10:00", mq2: 420, mq135: 510, temperature: 27.1, humidity: 61, pressure: 1008 },
  { time: "10:05", mq2: 435, mq135: 520, temperature: 27.2, humidity: 60, pressure: 1008.2 },
  { time: "10:10", mq2: 428, mq135: 515, temperature: 27.3, humidity: 60, pressure: 1008.1 },
  { time: "10:15", mq2: 450, mq135: 530, temperature: 27.4, humidity: 59, pressure: 1008.4 },
  { time: "10:20", mq2: 445, mq135: 525, temperature: 27.5, humidity: 59, pressure: 1008.3 },
  { time: "10:25", mq2: 460, mq135: 540, temperature: 27.6, humidity: 58, pressure: 1008.5 },
  { time: "10:30", mq2: 455, mq135: 535, temperature: 27.5, humidity: 58, pressure: 1008.6 },
  { time: "10:35", mq2: 470, mq135: 550, temperature: 27.7, humidity: 57, pressure: 1008.5 }
];

function SensorCard({ icon: Icon, title, value, unit, status, color }) {
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

      <p className="lm-card-note">Demonstration reading</p>
    </div>
  );
}

function SensorChart({ title, subtitle, dataKey, unit, color }) {
  return (
    <div className="panel lm-chart-panel">
      <div className="panel-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className="lm-demo-tag">DEMO</span>
      </div>

      <div className="lm-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={demoData}>
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

function LiveMonitoring() {
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
          DEMONSTRATION MODE
        </div>
      </section>

      {/* CONNECTION BANNER */}

      <div className="system-banner">
        <div className="banner-icon">
          <Wifi size={22} />
        </div>

        <div className="banner-text">
          <strong>Sensor Monitoring Interface</strong>
          <p>
            Sample readings are displayed for interface development.
            Hardware integration is pending.
          </p>
        </div>

        <div className="banner-right">
          DEMO DATA
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
          value="455"
          unit="ADC"
          status="Demo"
          color="cyan"
        />

        <SensorCard
          icon={Activity}
          title="MQ135 Air Quality Sensor"
          value="535"
          unit="ADC"
          status="Demo"
          color="orange"
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
          title="BMP280 Temperature"
          value="27.5"
          unit="°C"
          status="Demo"
          color="purple"
        />

        <SensorCard
          icon={Gauge}
          title="Atmospheric Pressure"
          value="1008.6"
          unit="hPa"
          status="Demo"
          color="blue"
        />

        <SensorCard
          icon={Thermometer}
          title="DHT11 Temperature"
          value="27.5"
          unit="°C"
          status="Demo"
          color="orange"
        />

        <SensorCard
          icon={Droplets}
          title="DHT11 Humidity"
          value="58"
          unit="%"
          status="Demo"
          color="cyan"
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
        />

        <SensorChart
          title="MQ135 Response"
          subtitle="Raw ADC readings over time"
          dataKey="mq135"
          unit="ADC"
          color="#f5a742"
        />

        <SensorChart
          title="Temperature"
          subtitle="BMP280 temperature history"
          dataKey="temperature"
          unit="°C"
          color="#ae8cff"
        />

        <SensorChart
          title="Humidity"
          subtitle="DHT11 humidity history"
          dataKey="humidity"
          unit="%"
          color="#19c6d9"
        />

        <SensorChart
          title="Atmospheric Pressure"
          subtitle="BMP280 pressure history"
          dataKey="pressure"
          unit="hPa"
          color="#60a9ff"
        />

      </div>

      {/* DEVICE HEALTH */}

      <div className="lm-section-heading">
        <h2>Device Health</h2>
        <span>HARDWARE STATUS</span>
      </div>

      <div className="panel lm-health-panel">

        <div className="lm-health-item">
          <Cpu size={19} />
          <div>
            <strong>ESP8266 NodeMCU</strong>
            <small>Hardware integration pending</small>
          </div>
          <span className="lm-pending">Pending</span>
        </div>

        <div className="lm-health-item">
          <Activity size={19} />
          <div>
            <strong>MQ2 Sensor</strong>
            <small>Hardware integration pending</small>
          </div>
          <span className="lm-pending">Pending</span>
        </div>

        <div className="lm-health-item">
          <Activity size={19} />
          <div>
            <strong>MQ135 Sensor</strong>
            <small>Hardware integration pending</small>
          </div>
          <span className="lm-pending">Pending</span>
        </div>

        <div className="lm-health-item">
          <Thermometer size={19} />
          <div>
            <strong>BMP280 Sensor</strong>
            <small>Hardware integration pending</small>
          </div>
          <span className="lm-pending">Pending</span>
        </div>

        <div className="lm-health-item">
          <Droplets size={19} />
          <div>
            <strong>DHT11 Sensor</strong>
            <small>Hardware integration pending</small>
          </div>
          <span className="lm-pending">Pending</span>
        </div>

        <div className="lm-last-update">
          <Clock size={15} />
          Last hardware update: Not connected
        </div>

      </div>

      <div className="dashboard-footer">
        <span>AEROSENTINEL MONITORING SYSTEM</span>
        <span>LIVE MONITORING MODULE · DEMO</span>
      </div>

    </main>
  );
}

export default LiveMonitoring;