import { useEffect, useState } from "react";

import {
  Activity,
  Thermometer,
  Droplets,
  Gauge,
  Download,
  CalendarDays,
  Database,
  TrendingUp,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Clock
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area
} from "recharts";

const API_LATEST =
  "https://aerosentinal.onrender.com/api/sensors/latest";

const API_HISTORY =
  "https://aerosentinal.onrender.com/api/sensors";

// Extract historical documents from API response.
function extractDocuments(result) {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.sensors)) return result.sensors;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

// Extract latest document.
function extractLatest(result) {
  return result?.data || result?.sensor || result;
}

// Parse MongoDB payload.
function parsePayload(document) {
  if (!document) return null;

  let payload = document.payload;

  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return null;
    }
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    ...payload,
    receivedAt: document.receivedAt || payload.receivedAt
  };
}

// Convert database documents into chart records.
function processReadings(documents) {
  return documents
    .map((document) => parsePayload(document))
    .filter((item) => {
      return (
        item &&
        item.receivedAt &&
        !Number.isNaN(new Date(item.receivedAt).getTime())
      );
    })
    .map((item) => ({
      timestamp: item.receivedAt,
      time: new Date(item.receivedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),

      mq2: numberOrNull(item.m2r),
      mq135: numberOrNull(item.m1r),
      temp: numberOrNull(item.tmp),
      humidity: numberOrNull(item.hum),
      pressure: numberOrNull(item.prs)
    }))
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime()
    );
}

function numberOrNull(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

// Calculate statistical values.
function getStatistics(data, field) {
  const values = data
    .map((item) => item[field])
    .filter((value) => value !== null && Number.isFinite(value));

  if (values.length === 0) {
    return {
      average: null,
      minimum: null,
      maximum: null
    };
  }

  const sum = values.reduce((total, value) => total + value, 0);

  return {
    average: sum / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values)
  };
}

// Format numbers.
function formatNumber(value, decimals = 1) {
  if (value === null || value === undefined) {
    return "—";
  }

  return Number(value).toFixed(decimals);
}

// Get connection status.
function getConnectionStatus(timestamp) {
  if (!timestamp) return "WAITING";

  const age = (Date.now() - new Date(timestamp).getTime()) / 1000;

  if (!Number.isFinite(age) || age < -60) return "WAITING";
  if (age <= 15) return "LIVE";
  if (age <= 60) return "STALE";

  return "OFFLINE";
}

// Chart component.
function AnalyticsChart({
  title,
  subtitle,
  data,
  dataKey,
  unit,
  color
}) {
  const chartData = data.filter(
    (item) => item[dataKey] !== null
  );

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

        {chartData.length > 0 ? (

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={chartData}>

              <defs>
                <linearGradient
                  id={`gradient-${dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={color}
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor={color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#263548"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="time"
                stroke="#91a3b8"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                stroke="#91a3b8"
                tick={{ fontSize: 11 }}
                width={55}
              />

              <Tooltip
                contentStyle={{
                  background: "#111e2d",
                  border: "1px solid #263548",
                  borderRadius: "8px",
                  color: "#edf6ff"
                }}
                formatter={(value) => [
                  `${value} ${unit}`,
                  title
                ]}
              />

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
                connectNulls={false}
              />

            </AreaChart>

          </ResponsiveContainer>

        ) : (

          <div className="an-empty-chart">
            No historical readings available.
          </div>

        )}

      </div>

    </div>
  );
}

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update connection age every second.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch cloud data.
  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      try {
        const [historyResponse, latestResponse] =
          await Promise.allSettled([
            fetch(API_HISTORY),
            fetch(API_LATEST)
          ]);

        let documents = [];

        if (historyResponse.status === "fulfilled") {
          if (!historyResponse.value.ok) {
            throw new Error("Historical API unavailable");
          }

          const historyResult =
            await historyResponse.value.json();

          documents = extractDocuments(historyResult);
        } else {
          throw new Error("Could not fetch historical readings");
        }

        let latestPayload = null;

        if (latestResponse.status === "fulfilled") {
          if (latestResponse.value.ok) {
            const latestResult =
              await latestResponse.value.json();

            latestPayload = parsePayload(
              extractLatest(latestResult)
            );
          }
        }

        // Add latest reading if not already in history.
        if (
          latestPayload &&
          latestPayload.receivedAt
        ) {
          const exists = documents.some((document) => {
            return (
              new Date(document.receivedAt).getTime() ===
              new Date(latestPayload.receivedAt).getTime()
            );
          });

          if (!exists) {
            documents.push({
              payload: latestPayload,
              receivedAt: latestPayload.receivedAt
            });
          }
        }

        const processedData = processReadings(documents);

        if (!active) return;

        setAnalyticsData(processedData);
        setLatest(latestPayload || processedData.at(-1) || null);
        setLastUpdated(Date.now());
        setApiError(false);

      } catch (error) {
        console.error("[Analytics]", error);

        if (active) {
          setApiError(true);
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    const interval = setInterval(fetchAnalytics, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Statistics.
  const mq2Stats = getStatistics(analyticsData, "mq2");
  const mq135Stats = getStatistics(analyticsData, "mq135");
  const tempStats = getStatistics(analyticsData, "temp");
  const humidityStats = getStatistics(analyticsData, "humidity");

  const dataStatus = getConnectionStatus(latest?.receivedAt);

  const lastReadingAge = latest?.receivedAt
    ? Math.max(
        0,
        Math.floor(
          (currentTime -
            new Date(latest.receivedAt).getTime()) /
            1000
        )
      )
    : null;

  // CSV export.
  const exportCSV = () => {
    if (analyticsData.length === 0) return;

    const headers = [
      "Timestamp",
      "MQ2 Raw ADC",
      "MQ135 Raw ADC",
      "Temperature C",
      "Humidity Percent",
      "Pressure hPa"
    ];

    const rows = analyticsData.map((item) => [
      item.timestamp,
      item.mq2 ?? "",
      item.mq135 ?? "",
      item.temp ?? "",
      item.humidity ?? "",
      item.pressure ?? ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "AeroSentinel_Analytics.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <main className="dashboard an-page">

      {/* HEADER */}

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
          {dataStatus === "LIVE" ? (
            <Wifi size={18} />
          ) : (
            <WifiOff size={18} />
          )}

          {dataStatus === "LIVE"
            ? "LIVE CLOUD DATA"
            : dataStatus}
        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="an-summary-grid">

        <div className="an-summary-card">

          <div className="an-summary-icon">
            <Database size={21} />
          </div>

          <span>Total Data Points</span>

          <h2>
            {loading ? "..." : analyticsData.length}
          </h2>

          <small>Historical cloud records loaded</small>

        </div>

        <div className="an-summary-card">

          <div className="an-summary-icon">
            <Thermometer size={21} />
          </div>

          <span>Average Temperature</span>

          <h2>
            {formatNumber(tempStats.average)} °C
          </h2>

          <small>BMP280 temperature readings</small>

        </div>

        <div className="an-summary-card">

          <div className="an-summary-icon">
            <Droplets size={21} />
          </div>

          <span>Average Humidity</span>

          <h2>
            {formatNumber(humidityStats.average)} %
          </h2>

          <small>DHT11 humidity readings</small>

        </div>

        <div className="an-summary-card">

          <div className="an-summary-icon">
            <Gauge size={21} />
          </div>

          <span>Average MQ2 Reading</span>

          <h2>
            {formatNumber(mq2Stats.average, 0)} ADC
          </h2>

          <small>Raw sensor readings</small>

        </div>

      </div>

      {/* HISTORICAL SENSOR TRENDS */}

      <section className="an-section">

        <div className="an-section-heading">

          <div>
            <h2>Historical Sensor Trends</h2>

            <p>
              Actual sensor readings retrieved from cloud storage.
            </p>
          </div>

          <CalendarDays size={21} />

        </div>

        <div className="an-chart-grid">

          <AnalyticsChart
            title="MQ2 Response"
            subtitle="Combustible gas sensor - raw ADC"
            dataKey="mq2"
            unit="ADC"
            color="#42d9c4"
            data={analyticsData}
          />

          <AnalyticsChart
            title="MQ135 Response"
            subtitle="Air quality sensor - raw ADC"
            dataKey="mq135"
            unit="ADC"
            color="#7b9cff"
            data={analyticsData}
          />

          <AnalyticsChart
            title="Temperature"
            subtitle="Temperature readings"
            dataKey="temp"
            unit="°C"
            color="#ffbd62"
            data={analyticsData}
          />

          <AnalyticsChart
            title="Humidity"
            subtitle="Relative humidity readings"
            dataKey="humidity"
            unit="%"
            color="#55b8ff"
            data={analyticsData}
          />

        </div>

      </section>

      {/* STATISTICAL ANALYSIS */}

      <section className="an-section">

        <div className="an-section-heading">

          <div>
            <h2>Sensor Statistical Analysis</h2>

            <p>
              Minimum, maximum and average values from loaded records.
            </p>
          </div>

          <Activity size={21} />

        </div>

        <div className="an-chart-grid">

          {[
            {
              title: "MQ2",
              stats: mq2Stats,
              unit: "ADC",
              decimals: 0
            },
            {
              title: "MQ135",
              stats: mq135Stats,
              unit: "ADC",
              decimals: 0
            },
            {
              title: "Temperature",
              stats: tempStats,
              unit: "°C",
              decimals: 1
            },
            {
              title: "Humidity",
              stats: humidityStats,
              unit: "%",
              decimals: 1
            }
          ].map((item) => (

            <div className="an-chart-card" key={item.title}>

              <div className="an-chart-heading">
                <div>
                  <h3>{item.title}</h3>
                  <p>Statistical summary</p>
                </div>

                <TrendingUp size={20} />
              </div>

              <div className="an-stat-list">

                <div>
                  <span>Minimum</span>

                  <strong>
                    {formatNumber(
                      item.stats.minimum,
                      item.decimals
                    )} {item.unit}
                  </strong>
                </div>

                <div>
                  <span>Maximum</span>

                  <strong>
                    {formatNumber(
                      item.stats.maximum,
                      item.decimals
                    )} {item.unit}
                  </strong>
                </div>

                <div>
                  <span>Average</span>

                  <strong>
                    {formatNumber(
                      item.stats.average,
                      item.decimals
                    )} {item.unit}
                  </strong>
                </div>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* DATA MANAGEMENT */}

      <section className="an-section">

        <div className="an-section-heading">

          <div>
            <h2>Data Management</h2>

            <p>
              Historical storage and reporting status.
            </p>
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
              Historical sensor records retrieved through the
              AeroSentinel Render API.
            </p>

          </div>

          <span className="an-pending">
            {apiError
              ? "Connection Error"
              : dataStatus}
          </span>

        </div>

        <div className="an-report-card">

          <div>
            <h3>Sensor Data Report</h3>

            <p>
              Export the currently loaded historical sensor readings
              into a CSV spreadsheet.
            </p>
          </div>

          <button
            className="an-export-button"
            onClick={exportCSV}
            disabled={analyticsData.length === 0}
          >
            <Download size={16} />
            Export CSV
          </button>

        </div>

      </section>

      {/* COMMUNICATION STATUS */}

      <section className="an-section">

        <div className="an-section-heading">

          <div>
            <h2>Analytics Communication</h2>

            <p>
              Cloud synchronization information.
            </p>
          </div>

          <RefreshCw size={21} />

        </div>

        <div className="an-summary-grid">

          <div className="an-summary-card">

            <div className="an-summary-icon">
              <Clock size={21} />
            </div>

            <span>Last Sensor Reading</span>

            <h2>
              {lastReadingAge === null
                ? "—"
                : lastReadingAge < 60
                ? `${lastReadingAge}s`
                : `${Math.floor(lastReadingAge / 60)}m`}
            </h2>

            <small>Age of latest cloud reading</small>

          </div>

          <div className="an-summary-card">

            <div className="an-summary-icon">
              <RefreshCw size={21} />
            </div>

            <span>Last Analytics Update</span>

            <h2>
              {lastUpdated
                ? new Date(lastUpdated).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "—"}
            </h2>

            <small>Automatic refresh every 10 seconds</small>

          </div>

        </div>

      </section>

      {/* FOOTER NOTE */}

      <div className="an-note">

        {apiError ? (
          <>
            <AlertTriangle size={17} />

            Unable to retrieve the latest historical data.
            Check the Render API connection.
          </>
        ) : (
          <>
            <Activity size={17} />

            Analytics are calculated from the historical records
            currently loaded from MongoDB. MQ2 and MQ135 values
            represent raw ADC readings, not calibrated gas
            concentrations in PPM.
          </>
        )}

      </div>

    </main>
  );
}

export default Analytics;