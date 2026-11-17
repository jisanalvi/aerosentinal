import { useEffect, useState } from "react";

import {
  BrainCircuit,
  TrendingUp,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Clock,
  Target,
  RefreshCw,
  Wifi,
  WifiOff,
  Flame,
  Wind,
  ShieldAlert,
  Fan
} from "lucide-react";

const API_LATEST =
  "https://aerosentinal.onrender.com/api/sensors/latest";

const API_HISTORY =
  "https://aerosentinal.onrender.com/api/sensors";

// ========================================
// SENSOR THRESHOLDS
// Matches current Arduino DEMO_MODE true
// ========================================

const MQ135_WARNING = 350;
const MQ135_CRITICAL = 600;

const MQ2_WARNING = 80;
const MQ2_CRITICAL = 200;

// ========================================
// API HELPERS
// ========================================

function extractDocuments(result) {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.sensors)) return result.sensors;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

function extractLatest(result) {
  return result?.data || result?.sensor || result;
}

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

// ========================================
// FORMAT HELPERS
// ========================================

function formatTime(date) {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function getDataStatus(timestamp) {
  if (!timestamp) return "WAITING";

  const age = (Date.now() - new Date(timestamp).getTime()) / 1000;

  if (!Number.isFinite(age) || age < -60) return "WAITING";
  if (age <= 15) return "LIVE";
  if (age <= 60) return "STALE";

  return "OFFLINE";
}

function formatValue(value, decimals = 0) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return Number(value).toFixed(decimals);
}

function getNumericValue(value) {
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

// ========================================
// TREND CALCULATION
// ========================================

function calculateTrend(readings, field) {
  const valid = readings
    .filter((item) => getNumericValue(item[field]) !== null)
    .map((item) => ({
      value: Number(item[field]),
      time: new Date(item.receivedAt).getTime()
    }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => a.time - b.time);

  if (valid.length < 2) {
    return {
      direction: "INSUFFICIENT DATA",
      change: null,
      rate: null
    };
  }

  const first = valid[0];
  const last = valid[valid.length - 1];

  const change = last.value - first.value;

  const elapsedSeconds = (last.time - first.time) / 1000;

  const rate =
    elapsedSeconds > 0 ? change / elapsedSeconds : null;

  let direction = "STABLE";

  if (change > 0) direction = "RISING";
  if (change < 0) direction = "FALLING";

  return {
    direction,
    change,
    rate
  };
}

// ========================================
// STATUS ICON
// ========================================

function getStatusIcon(dataStatus) {
  if (dataStatus === "LIVE") return <Wifi size={18} />;
  if (dataStatus === "STALE") return <Clock size={18} />;

  return <WifiOff size={18} />;
}

// ========================================
// MAIN COMPONENT
// ========================================

function PredictionEngine() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // ========================================
  // CLOCK
  // ========================================

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ========================================
  // FETCH CLOUD DATA
  // ========================================

  useEffect(() => {
    let active = true;

    const fetchPredictionData = async () => {
      try {
        const [latestResponse, historyResponse] =
          await Promise.allSettled([
            fetch(API_LATEST),
            fetch(API_HISTORY)
          ]);

        let latestDocument = null;
        let historicalDocuments = [];

        if (latestResponse.status === "fulfilled") {
          if (!latestResponse.value.ok) {
            throw new Error("Latest sensor API unavailable");
          }

          const latestResult = await latestResponse.value.json();

          latestDocument = extractLatest(latestResult);
        } else {
          throw new Error("Latest sensor API unavailable");
        }

        if (historyResponse.status === "fulfilled") {
          if (historyResponse.value.ok) {
            const historyResult =
              await historyResponse.value.json();

            historicalDocuments =
              extractDocuments(historyResult);
          }
        }

        if (!latestDocument && historicalDocuments.length === 0) {
          throw new Error("No sensor data available");
        }

        const latestPayload = parsePayload(latestDocument);

        const historicalReadings = historicalDocuments
          .map((document) => {
            const payload = parsePayload(document);

            if (!payload) return null;

            return {
              ...payload,
              receivedAt: document.receivedAt || payload.receivedAt
            };
          })
          .filter((item) => item && item.receivedAt);

        if (
          latestPayload &&
          latestPayload.receivedAt &&
          !historicalReadings.some(
            (item) =>
              new Date(item.receivedAt).getTime() ===
              new Date(latestPayload.receivedAt).getTime()
          )
        ) {
          historicalReadings.push(latestPayload);
        }

        historicalReadings.sort(
          (a, b) =>
            new Date(a.receivedAt).getTime() -
            new Date(b.receivedAt).getTime()
        );

        if (!active) return;

        if (latestPayload) {
          setLatest(latestPayload);
        }

        setHistory(historicalReadings);
        setLastUpdated(Date.now());
        setApiError(false);

      } catch (error) {
        console.error("[Prediction Engine]", error);

        if (active) {
          setApiError(true);
        }

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPredictionData();

    const interval = setInterval(fetchPredictionData, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // ========================================
  // DATA FRESHNESS
  // ========================================

  const dataStatus = getDataStatus(latest?.receivedAt);

  const isLive = dataStatus === "LIVE";

  // ========================================
  // SENSOR TRENDS
  // ========================================

  const mq2Trend = calculateTrend(history, "m2r");
  const mq135Trend = calculateTrend(history, "m1r");

  const recentReadings = history.slice(-6).reverse();

  // ========================================
  // ARDUINO TELEMETRY
  // ========================================

  const hazardValue = getNumericValue(latest?.haz);

  const healthValue = getNumericValue(latest?.hlt);

  const systemReady =
    latest?.sys === true ||
    latest?.sys === 1 ||
    latest?.sys === "1";

  const actuatorValue = getNumericValue(latest?.act);

  // ========================================
  // HAZARD STATE
  // ========================================

  let riskStatus = "UNKNOWN";

  if (isLive) {
    if (hazardValue === 0) {
      riskStatus = "NORMAL";
    } else if (hazardValue === 1) {
      riskStatus = "WARNING";
    } else if (hazardValue === 2) {
      riskStatus = "CRITICAL HAZARD";
    }
  } else if (dataStatus === "STALE") {
    riskStatus = "STALE DATA";
  } else if (dataStatus === "OFFLINE") {
    riskStatus = "OFFLINE";
  }

  // ========================================
  // SENSOR CALCULATED VALUES
  // ========================================

  const mq135Value = getNumericValue(latest?.m1p);
  const mq2Value = getNumericValue(latest?.m2p);

  const mq135Raw = getNumericValue(latest?.m1r);
  const mq2Raw = getNumericValue(latest?.m2r);

  const mq135Valid = mq135Value !== null;
  const mq2Valid = mq2Value !== null;

  // ========================================
  // MQ-135 CLASSIFICATION
  // ========================================

  const mq135Alert =
    mq135Valid && mq135Value >= MQ135_WARNING;

  const mq135Critical =
    mq135Valid && mq135Value >= MQ135_CRITICAL;

  // ========================================
  // MQ-2 CLASSIFICATION
  // ========================================

  const mq2Alert =
    mq2Valid && mq2Value >= MQ2_WARNING;

  const mq2Critical =
    mq2Valid && mq2Value >= MQ2_CRITICAL;

  // ========================================
  // SENSOR SOURCE IDENTIFICATION
  // ========================================

  let hazardSource = "Not identified";

  let hazardDescription =
    "Waiting for current sensor assessment.";

  let sensorSeverity = "UNKNOWN";

  if (isLive && hazardValue !== null) {

    if (hazardValue === 0) {
      hazardSource = "No reported hazard";

      hazardDescription =
        "Arduino reports a normal hazard state.";

      sensorSeverity = "NORMAL";

    } else if (hazardValue === 1 || hazardValue === 2) {

      if (mq2Alert && mq135Alert) {
        hazardSource = "MQ-2 + MQ-135";
      } else if (mq2Alert) {
        hazardSource = "MQ-2";
      } else if (mq135Alert) {
        hazardSource = "MQ-135";
      } else {
        hazardSource = "Trigger source not identifiable";
      }

      if (mq2Alert && mq135Alert) {
        hazardDescription =
          "Both sensors currently exceed their programmed warning thresholds.";
      } else if (mq2Alert) {
        hazardDescription =
          "MQ-2 currently exceeds its programmed warning threshold. Indicates a combustible-gas sensor response.";
      } else if (mq135Alert) {
        hazardDescription =
          "MQ-135 currently exceeds its programmed warning threshold. Indicates an air-quality sensor response.";
      } else {
        hazardDescription =
          "Arduino reports a hazard, but neither current sensor value crosses its warning threshold. A rising trend, projected threshold breach, or latched condition may explain the report.";
      }

      if (hazardValue === 2) {
        sensorSeverity = "CRITICAL";
      } else {
        sensorSeverity = "WARNING";
      }
    }
  }

  // ========================================
  // INDIVIDUAL SENSOR STATUS
  // ========================================

  const getSensorStatus = (alert, critical, valid) => {
    if (!isLive) return "DATA UNAVAILABLE";

    if (!valid) return "INVALID READING";

    if (critical) return "CRITICAL THRESHOLD";

    if (alert) return "WARNING THRESHOLD";

    return "BELOW WARNING THRESHOLD";
  };

  // ========================================
  // ARDUINO HEALTH
  // ========================================

  let systemHealth = "UNKNOWN";

  if (isLive) {
    if (healthValue === 0) {
      systemHealth = "ALL OK";
    } else if (healthValue === 1) {
      systemHealth = "DEGRADED";
    } else if (healthValue === 2) {
      systemHealth = "CRITICAL FAULT";
    }
  }

  // ========================================
  // ACTUATOR STATUS
  // ========================================

  let actuatorStatus = "UNKNOWN";

  if (isLive) {
    if (actuatorValue === 0) {
      actuatorStatus = "SAFE";
    } else if (actuatorValue === 1) {
      actuatorStatus = "WARNING";
    } else if (actuatorValue === 2) {
      actuatorStatus = "LOCKDOWN";
    } else if (actuatorValue === 3) {
      actuatorStatus = "BLIND HALT";
    }
  }

  // ========================================
  // LAST READING AGE
  // ========================================

  const getAge = () => {
    if (!latest?.receivedAt) {
      return "No reading received";
    }

    const timestamp = new Date(latest.receivedAt).getTime();

    if (!Number.isFinite(timestamp)) {
      return "Invalid timestamp";
    }

    const age = Math.max(
      0,
      Math.floor((currentTime - timestamp) / 1000)
    );

    if (age < 60) return `${age} seconds ago`;

    return `${Math.floor(age / 60)} minutes ago`;
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="dashboard pe-page">

      {/* HEADER */}

      <div className="pe-banner">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL INTELLIGENCE
          </span>

          <h1>Prediction Engine</h1>

          <p>
            Live sensor trend analysis and early threat assessment.
          </p>
        </div>

        <div className="pe-mode">
          <BrainCircuit size={20} />

          {dataStatus === "LIVE"
            ? "LIVE CLOUD DATA"
            : dataStatus}
        </div>
      </div>

      {/* MAIN METRICS */}

      <div className="pe-grid">

        {/* RISK STATUS */}

        <div className="pe-card">
          <div className="pe-card-heading">
            <Activity size={19} />
            <span>Reported Risk Status</span>
          </div>

          <h2 className="pe-risk">
            {loading ? "Loading..." : riskStatus}
          </h2>

          <p>
            Based on the latest Arduino hazard report.
          </p>

          <div className="pe-status">
            {dataStatus === "LIVE"
              ? "Latest reading received"
              : `Connection: ${dataStatus}`}
          </div>
        </div>

        {/* MQ2 TREND */}

        <div className="pe-card">
          <div className="pe-card-heading">
            <TrendingUp size={19} />
            <span>MQ-2 Trend</span>
          </div>

          <h2>{mq2Trend.direction}</h2>

          <p>
            Current raw reading: {formatValue(mq2Raw)}
          </p>

          <div className="pe-warning">
            {mq2Trend.change === null
              ? "Insufficient historical data"
              : `Change: ${
                  mq2Trend.change > 0 ? "+" : ""
                }${formatValue(mq2Trend.change)} raw units`}
          </div>
        </div>

        {/* MQ135 TREND */}

        <div className="pe-card">
          <div className="pe-card-heading">
            <TrendingUp size={19} />
            <span>MQ-135 Trend</span>
          </div>

          <h2>{mq135Trend.direction}</h2>

          <p>
            Current raw reading: {formatValue(mq135Raw)}
          </p>

          <div className="pe-warning">
            {mq135Trend.change === null
              ? "Insufficient historical data"
              : `Change: ${
                  mq135Trend.change > 0 ? "+" : ""
                }${formatValue(mq135Trend.change)} raw units`}
          </div>
        </div>

        {/* PREDICTION CONFIDENCE */}

        <div className="pe-card">
          <div className="pe-card-heading">
            <Target size={19} />
            <span>Prediction Confidence</span>
          </div>

          <h2>Not available</h2>

          <p>
            No validated predictive model is connected.
          </p>

          <div className="pe-status">
            Historical trend analysis active
          </div>
        </div>

      </div>

      {/* SENSOR-SPECIFIC ASSESSMENT */}

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Sensor-Specific Hazard Assessment</h2>

            <p>
              Individual sensor responses compared with programmed
              prototype thresholds.
            </p>
          </div>

          <ShieldAlert size={23} />
        </div>

        {/* IDENTIFIED SOURCE */}

        <div className="pe-assessment">

          {sensorSeverity === "NORMAL" ? (
            <ShieldCheck size={27} />
          ) : (
            <AlertTriangle size={27} />
          )}

          <div>
            <h3>{hazardSource}</h3>

            <p>{hazardDescription}</p>

            <div className="pe-status">
              Arduino severity: {sensorSeverity}
            </div>
          </div>

        </div>

        {/* SENSOR CARDS */}

        <div className="pe-grid mt-4">

          {/* MQ2 */}

          <div className="pe-card">

            <div className="pe-card-heading">
              <Flame size={19} />
              <span>MQ-2 Combustible-Gas Sensor</span>
            </div>

            <h2>
              {isLive && mq2Valid
                ? formatValue(mq2Value)
                : "—"}
            </h2>

            <p>
              Calculated sensor value
            </p>

            <div className="pe-status">
              {getSensorStatus(
                mq2Alert,
                mq2Critical,
                mq2Valid
              )}
            </div>

            <p className="mt-3">
              Raw ADC: {formatValue(mq2Raw)}
            </p>

            <p>
              Warning threshold: {MQ2_WARNING}
            </p>

            <p>
              Critical threshold: {MQ2_CRITICAL}
            </p>

          </div>

          {/* MQ135 */}

          <div className="pe-card">

            <div className="pe-card-heading">
              <Wind size={19} />
              <span>MQ-135 Air-Quality Sensor</span>
            </div>

            <h2>
              {isLive && mq135Valid
                ? formatValue(mq135Value)
                : "—"}
            </h2>

            <p>
              Calculated sensor value
            </p>

            <div className="pe-status">
              {getSensorStatus(
                mq135Alert,
                mq135Critical,
                mq135Valid
              )}
            </div>

            <p className="mt-3">
              Raw ADC: {formatValue(mq135Raw)}
            </p>

            <p>
              Warning threshold: {MQ135_WARNING}
            </p>

            <p>
              Critical threshold: {MQ135_CRITICAL}
            </p>

          </div>

        </div>

      </div>

      {/* THREAT ASSESSMENT */}

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Threat Assessment</h2>

            <p>
              Current device-reported hazard and communication state.
            </p>
          </div>

          <BrainCircuit size={23} />
        </div>

        <div className="pe-assessment">

          {hazardValue === 0 && isLive ? (
            <ShieldCheck size={27} />
          ) : (
            <AlertTriangle size={27} />
          )}

          <div>
            <h3>
              {!isLive
                ? "Current threat assessment unavailable"
                : hazardValue === 2
                ? "Critical hazard reported by Arduino"
                : hazardValue === 1
                ? "Warning reported by Arduino"
                : hazardValue === 0
                ? "No hazard reported by Arduino"
                : "Unrecognized hazard state"}
            </h3>

            <p>
              {!isLive
                ? "Fresh sensor data is required for a current assessment."
                : hazardValue === 2
                ? "Arduino has entered its critical latched hazard state. Follow appropriate safety procedures."
                : hazardValue === 1
                ? "Arduino has reported a warning condition. The triggering sensor may be identifiable from its current threshold readings."
                : hazardValue === 0
                ? "Arduino reports a normal hazard state. This is not a guarantee that the environment is safe."
                : "The reported hazard state is missing or unrecognized."}
            </p>

          </div>

        </div>

      </div>

      {/* SYSTEM HEALTH & ACTUATOR */}

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>System Operational Status</h2>

            <p>
              Health and actuator information reported by Arduino.
            </p>
          </div>

          <Activity size={23} />
        </div>

        <div className="pe-grid">

          <div className="pe-card">

            <div className="pe-card-heading">
              <ShieldCheck size={19} />
              <span>System Health</span>
            </div>

            <h2>{systemHealth}</h2>

            <p>
              Arduino sensor-health report
            </p>

            <div className="pe-status">
              {systemReady
                ? "System ready"
                : "System not ready"}
            </div>

          </div>

          <div className="pe-card">

            <div className="pe-card-heading">
              <Fan size={19} />
              <span>Actuator State</span>
            </div>

            <h2>{actuatorStatus}</h2>

            <p>
              Arduino actuator policy state
            </p>

            <div className="pe-status">
              {isLive
                ? "Latest actuator report received"
                : "Waiting for live data"}
            </div>

          </div>

        </div>

      </div>

      {/* SENSOR RATE OF CHANGE */}

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Sensor Rate of Change</h2>

            <p>
              Change in raw sensor readings over the available history.
            </p>
          </div>

          <Activity size={23} />
        </div>

        <div className="pe-grid">

          <div className="pe-card">

            <div className="pe-card-heading">
              <TrendingUp size={19} />
              <span>MQ-2 Rate</span>
            </div>

            <h2>
              {mq2Trend.rate === null
                ? "—"
                : `${mq2Trend.rate > 0 ? "+" : ""}${formatValue(
                    mq2Trend.rate,
                    3
                  )}`}
            </h2>

            <p>Raw ADC units per second</p>

          </div>

          <div className="pe-card">

            <div className="pe-card-heading">
              <TrendingUp size={19} />
              <span>MQ-135 Rate</span>
            </div>

            <h2>
              {mq135Trend.rate === null
                ? "—"
                : `${mq135Trend.rate > 0 ? "+" : ""}${formatValue(
                    mq135Trend.rate,
                    3
                  )}`}
            </h2>

            <p>Raw ADC units per second</p>

          </div>

        </div>

      </div>

      {/* HISTORICAL TREND */}

      <div className="pe-analysis">

        <div className="pe-section-title">
          <div>
            <h2>Historical Trend Analysis</h2>

            <p>
              Latest six available cloud readings.
            </p>
          </div>

          <TrendingUp size={23} />
        </div>

        {recentReadings.length > 0 ? (

          <div className="pe-trend-list">

            {recentReadings.map((item, index) => (

              <div
                className="pe-trend-row"
                key={`${item.receivedAt}-${index}`}
              >

                <span>
                  {formatTime(item.receivedAt)}
                </span>

                <div className="pe-trend-values">

                  <span>
                    MQ-2: {formatValue(item.m2r)}
                  </span>

                  <span>
                    MQ-135: {formatValue(item.m1r)}
                  </span>

                </div>

                <Activity size={17} />

              </div>

            ))}

          </div>

        ) : (

          <div className="pe-assessment">

            <AlertTriangle size={22} />

            <div>
              <h3>No historical readings available</h3>

              <p>
                Historical sensor information will appear when
                cloud readings are available.
              </p>
            </div>

          </div>

        )}

      </div>

      {/* CLOUD COMMUNICATION */}

      <div className="pe-analysis">

        <div className="pe-section-title">

          <div>
            <h2>Analysis Communication</h2>

            <p>
              Cloud data reception and analysis status.
            </p>
          </div>

          <RefreshCw size={23} />

        </div>

        <div className="pe-grid">

          {/* CONNECTION */}

          <div className="pe-card">

            <div className="pe-card-heading">
              {getStatusIcon(dataStatus)}
              <span>Cloud Connection</span>
            </div>

            <h2>{dataStatus}</h2>

            <p>Latest sensor communication</p>

            <div className="pe-status">
              {apiError
                ? "API communication error"
                : "Render API"}
            </div>

          </div>

          {/* LAST READING */}

          <div className="pe-card">

            <div className="pe-card-heading">
              <Clock size={19} />
              <span>Last Sensor Reading</span>
            </div>

            <h2>{formatTime(latest?.receivedAt)}</h2>

            <p>{getAge()}</p>

            <div className="pe-status">
              {latest?.receivedAt
                ? "Timestamp received from cloud"
                : "Waiting for sensor data"}
            </div>

          </div>

          {/* HISTORY */}

          <div className="pe-card">

            <div className="pe-card-heading">
              <Activity size={19} />
              <span>Historical Records</span>
            </div>

            <h2>{history.length}</h2>

            <p>Readings currently loaded</p>

            <div className="pe-status">
              {lastUpdated
                ? `Updated ${formatTime(lastUpdated)}`
                : "Waiting for data"}
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER NOTE */}

      <div className="pe-footer-note">

        <AlertTriangle size={17} />

        <span>
          MQ-2 and MQ-135 calculated values are based on the
          current prototype calibration and threshold settings.
          They are not verified gas concentrations or reliable
          identification of specific chemicals. Sensor trends
          indicate changes in sensor response and are not a
          validated predictive model. Do not use this dashboard
          as a substitute for certified gas-safety equipment.
        </span>

      </div>

    </main>
  );
}

export default PredictionEngine;