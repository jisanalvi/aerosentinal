import {
  ChartNoAxesCombined,
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Download,
  CalendarDays,
  Database,
  TrendingUp
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from "recharts";

const analyticsData = [
  { time: "10:00", mq2: 280, mq135: 390, temp: 26.2, humidity: 54 },
  { time: "10:05", mq2: 310, mq135: 405, temp: 26.5, humidity: 55 },
  { time: "10:10", mq2: 325, mq135: 420, temp: 26.8, humidity: 56 },
  { time: "10:15", mq2: 360, mq135: 435, temp: 27.0, humidity: 56 },
  { time: "10:20", mq2: 385, mq135: 460, temp: 27.2, humidity: 57 },
  { time: "10:25", mq2: 410, mq135: 485, temp: 27.5, humidity: 58 },
];

function AnalyticsChart({ title, subtitle, dataKey, unit, color }) {
  return (
    <div className="an-chart-card">
      <div className="an-chart-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>

        <TrendingUp size={20} />
      </div>

      <div className="an-chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analyticsData}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#263548" strokeDasharray="3 3" />

            <XAxis
              dataKey="time"
              stroke="#91a3b8"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              stroke="#91a3b8"
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              contentStyle={{
                background: "#111e2d",
                border: "1px solid #263548",
                borderRadius: "8px",
                color: "#edf6ff"
              }}
              formatter={(value) => [`${value} ${unit}`, title]}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${dataKey})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Analytics() {
  return (
    <main className="dashboard an-page">

      {/* Header */}
      <div className="an-header">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL DATA INTELLIGENCE
          </span>

          <h1>Analytics & Reports</h1>

          <p>
            Historical sensor trends and environmental data overview.
          </p>
        </div>

        <div className="an-demo-badge">
          <Activity size={18} />
          DEMONSTRATION DATA
        </div>
      </div>

      {/* Summary Cards */}
      <div className="an-summary-grid">

        <div className="an-summary-card">
          <div className="an-summary-icon">
            <Activity size={21} />
          </div>

          <span>Total Data Points</span>
          <h2>120</h2>
          <small>Illustrative records</small>
        </div>

        <div className="an-summary-card">
          <div className="an-summary-icon">
            <Thermometer size={21} />
          </div>

          <span>Average Temperature</span>
          <h2>26.9 °C</h2>
          <small>BMP280 demo readings</small>
        </div>

        <div className="an-summary-card">
          <div className="an-summary-icon">
            <Droplets size={21} />
          </div>

          <span>Average Humidity</span>
          <h2>56 %</h2>
          <small>DHT11 demo readings</small>
        </div>

        <div className="an-summary-card">
          <div className="an-summary-icon">
            <Gauge size={21} />
          </div>

          <span>Average MQ2 Reading</span>
          <h2>345 ADC</h2>
          <small>Raw demonstration value</small>
        </div>

      </div>

      {/* Sensor Charts */}
      <section className="an-section">

        <div className="an-section-heading">
          <div>
            <h2>Historical Sensor Trends</h2>
            <p>Illustrative sensor readings over time</p>
          </div>

          <CalendarDays size={21} />
        </div>

        <div className="an-chart-grid">

          <AnalyticsChart
            title="MQ2 Response"
            subtitle="Raw ADC values"
            dataKey="mq2"
            unit="ADC"
            color="#42d9c4"
          />

          <AnalyticsChart
            title="MQ135 Response"
            subtitle="Raw ADC values"
            dataKey="mq135"
            unit="ADC"
            color="#7b9cff"
          />

          <AnalyticsChart
            title="Temperature"
            subtitle="BMP280 readings"
            dataKey="temp"
            unit="°C"
            color="#ffbd62"
          />

          <AnalyticsChart
            title="Humidity"
            subtitle="DHT11 readings"
            dataKey="humidity"
            unit="%"
            color="#55b8ff"
          />

        </div>

      </section>

      {/* Data Information */}
      <section className="an-section">

        <div className="an-section-heading">
          <div>
            <h2>Data Management</h2>
            <p>Historical storage and reporting status</p>
          </div>

          <Database size={21} />
        </div>

        <div className="an-data-card">

          <div className="an-data-icon">
            <Database size={25} />
          </div>

          <div className="an-data-info">
            <h3>MongoDB Atlas</h3>
            <p>
              Historical database integration will be connected
              to the analytics module in the next stage.
            </p>
          </div>

          <span className="an-pending">Integration Pending</span>

        </div>

        <div className="an-report-card">

          <div>
            <h3>Sensor Data Report</h3>
            <p>
              CSV report generation will be enabled after
              real sensor data integration.
            </p>
          </div>

          <button className="an-export-button" disabled>
            <Download size={16} />
            Export CSV
          </button>

        </div>

      </section>

      {/* Footer */}
      <div className="an-note">
        Demonstration data only. Historical statistics are illustrative
        and do not represent actual environmental measurements.
      </div>

    </main>
  );
}

export default Analytics;