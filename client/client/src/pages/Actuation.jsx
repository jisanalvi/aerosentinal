import { useCallback, useEffect, useState } from "react";

import {
  Zap,
  Fan,
  ShieldCheck,
  Power,
  Activity,
  Clock,
  AlertTriangle,
  Lock,
  Settings2,
  RefreshCw,
  Wifi,
  WifiOff,
  Flame,
  Wind,
  ShieldAlert,
  CircleCheck,
  CircleAlert
} from "lucide-react";

const API_LATEST =
  "https://aerosentinal.onrender.com/api/sensors/latest";

const API_HISTORY =
  "https://aerosentinal.onrender.com/api/sensors";

const REFRESH_INTERVAL = 5000;

// Convert incoming values into numbers
const getNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

// Parse MongoDB document or direct JSON telemetry
const parseTelemetry = (document) => {
  if (!document) return null;

  let payload = document;

  if (typeof document.payload === "string") {
    try {
      payload = JSON.parse(document.payload);
    } catch {
      return null;
    }
  } else if (document.payload && typeof document.payload === "object") {
    payload = document.payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  return {
    ...payload,
    receivedAt:
      document.receivedAt ||
      payload.receivedAt ||
      payload.timestamp ||
      null
  };
};

// Extract latest document from API response
const extractLatest = (result) => {
  return result?.data || result?.sensor || result;
};

// Extract history documents from API response
const extractHistory = (result) => {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.data)) return result.data;

  if (Array.isArray(result?.sensors)) return result.sensors;

  if (Array.isArray(result?.history)) return result.history;

  return [];
};

// Actuator state mapping from Arduino telemetry
const getActuationState = (act) => {
  switch (act) {
    case 0:
      return {
        label: "SAFE",
        description: "No actuator warning reported",
        className: "safe",
        color: "ac-status-safe"
      };

    case 1:
      return {
        label: "WARNING",
        description: "Warning response mode reported",
        className: "warning",
        color: "ac-status-warning"
      };

    case 2:
      return {
        label: "LOCKDOWN",
        description: "Critical response mode reported",
        className: "critical",
        color: "ac-status-critical"
      };

    case 3:
      return {
        label: "BLIND HALT",
        description: "Fault-response mode reported",
        className: "critical",
        color: "ac-status-critical"
      };

    default:
      return {
        label: "UNKNOWN",
        description: "Actuator state unavailable",
        className: "unknown",
        color: "ac-neutral"
      };
  }
};

// Hazard state mapping
const getHazardState = (haz) => {
  switch (haz) {
    case 0:
      return {
        label: "NORMAL",
        description: "Controller reports no active hazard",
        className: "safe"
      };

    case 1:
      return {
        label: "WARNING",
        description: "Controller reports a hazard warning",
        className: "warning"
      };

    case 2:
      return {
        label: "CRITICAL HAZARD",
        description: "Controller reports a critical hazard",
        className: "critical"
      };

    default:
      return {
        label: "UNKNOWN",
        description: "Hazard information unavailable",
        className: "unknown"
      };
  }
};

// System health mapping
const getHealthState = (hlt) => {
  switch (hlt) {
    case 0:
      return {
        label: "ALL OK",
        description: "No controller health fault reported",
        className: "safe"
      };

    case 1:
      return {
        label: "DEGRADED",
        description: "A system health issue is reported",
        className: "warning"
      };

    case 2:
      return {
        label: "CRITICAL FAULT",
        description: "Critical system fault reported",
        className: "critical"
      };

    default:
      return {
        label: "UNKNOWN",
        description: "Health information unavailable",
        className: "unknown"
      };
  }
};

// Format timestamps
const formatTime = (timestamp) => {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

const formatDate = (timestamp) => {
  if (!timestamp) return "Waiting for data";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

// Generate event history from actual telemetry changes
const generateEvents = (records) => {
  const sorted = [...records]
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(a.receivedAt || 0) -
        new Date(b.receivedAt || 0)
    );

  const events = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    const time = current.receivedAt;

    if (!previous) {
      events.push({
        time,
        title: "Telemetry received",
        description: "AeroSentinel controller data received",
        status: "INFO"
      });

      continue;
    }

    if (current.act !== previous.act) {
      const state = getActuationState(getNumber(current.act));

      events.push({
        time,
        title: `Actuation mode changed: ${state.label}`,
        description: state.description,
        status:
          current.act >= 2
            ? "CRITICAL"
            : current.act === 1
              ? "WARNING"
              : "INFO"
      });
    }

    if (current.haz !== previous.haz) {
      const state = getHazardState(getNumber(current.haz));

      events.push({
        time,
        title: `Hazard status changed: ${state.label}`,
        description: state.description,
        status:
          current.haz >= 2
            ? "CRITICAL"
            : current.haz === 1
              ? "WARNING"
              : "INFO"
      });
    }

    if (current.hlt !== previous.hlt) {
      const state = getHealthState(getNumber(current.hlt));

      events.push({
        time,
        title: `System health changed: ${state.label}`,
        description: state.description,
        status:
          current.hlt >= 2
            ? "CRITICAL"
            : current.hlt === 1
              ? "WARNING"
              : "INFO"
      });
    }
  }

  return events.reverse().slice(0, 12);
};

function Actuation() {
  const [latest, setLatest] = useState(null);
  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  const fetchData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    }

    try {
      const [latestResponse, historyResponse] = await Promise.all([
        fetch(API_LATEST, { cache: "no-store" }),
        fetch(API_HISTORY, { cache: "no-store" })
      ]);

      if (!latestResponse.ok) {
        throw new Error("Unable to fetch latest sensor data");
      }

      const latestResult = await latestResponse.json();

      const latestTelemetry = parseTelemetry(
        extractLatest(latestResult)
      );

      if (!latestTelemetry) {
        throw new Error("Invalid telemetry received");
      }

      setLatest(latestTelemetry);
      setConnectionError(false);

      let historyRecords = [];

      if (historyResponse.ok) {
        const historyResult = await historyResponse.json();

        historyRecords = extractHistory(historyResult)
          .map(parseTelemetry)
          .filter(Boolean);
      }

      // Include latest reading in the history collection
      const combinedRecords = [
        ...historyRecords,
        latestTelemetry
      ];

      // Remove duplicate timestamps
      const uniqueRecords = Array.from(
        new Map(
          combinedRecords.map((record) => [
            record.receivedAt ||
              `${record.seq}-${record.act}-${record.haz}`,
            record
          ])
        ).values()
      );

      setEvents(generateEvents(uniqueRecords));

    } catch (error) {
      console.error("Actuation dashboard error:", error);
      setConnectionError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch and automatic refresh
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Telemetry values
  const act = getNumber(latest?.act);
  const haz = getNumber(latest?.haz);
  const hlt = getNumber(latest?.hlt);

  const actuator = getActuationState(act);
  const hazard = getHazardState(haz);
  const health = getHealthState(hlt);

  const timestamp = latest?.receivedAt;

  const dataAge = timestamp
    ? (Date.now() - new Date(timestamp).getTime()) / 1000
    : Infinity;

  const isLive = dataAge <= 15;
  const isStale = dataAge > 15 && dataAge <= 60;

  const connectionStatus = connectionError
    ? "CONNECTION ERROR"
    : isLive
      ? "LIVE"
      : isStale
        ? "STALE DATA"
        : latest
          ? "OFFLINE"
          : "WAITING FOR DATA";

  const statusClass = isLive
    ? "ac-status-safe"
    : isStale
      ? "ac-status-warning"
      : "ac-status-critical";

  const systemReady =
    latest?.sys === true ||
    latest?.sys === 1 ||
    latest?.sys === "1";

  return (
    <main className="dashboard ac-page">

      {/* HEADER */}
      <div className="ac-header">
        <div>
          <span className="section-eyebrow">
            AEROSENTINEL RESPONSE SYSTEM
          </span>

          <h1>Actuation Control</h1>

          <p>
            Live monitoring of automatic response and isolation states.
          </p>
        </div>

        <div className="ac-demo-badge">
          <Zap size={18} />
          LIVE ACTUATION MONITORING
        </div>
      </div>

      {/* CONNECTION BAR */}
      <div className="ac-connection-bar">

        <div className="ac-connection-left">
          {isLive ? (
            <Wifi size={18} />
          ) : (
            <WifiOff size={18} />
          )}

          <span>Cloud Connection</span>

          <strong className={statusClass}>
            {connectionStatus}
          </strong>
        </div>

        <div className="ac-connection-right">

          <span>
            Last update: {formatTime(timestamp)}
          </span>

          <button
            className="ac-refresh-button"
            onClick={() => fetchData(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "ac-spinning" : ""}
            />

            Refresh
          </button>

        </div>

      </div>

      {/* MAIN STATUS CARDS */}
      <div className="ac-grid">

        {/* ACTUATION STATUS */}
        <div className="ac-card">
          <div className="ac-card-heading">
            <Activity size={20} />
            <span>Actuation Status</span>
          </div>

          <h2 className={actuator.color}>
            {loading ? "Loading..." : actuator.label}
          </h2>

          <p>{actuator.description}</p>

          <span className={`ac-status ${actuator.className}`}>
            {act === null ? "NO DATA" : "CONTROLLER REPORTED"}
          </span>
        </div>

        {/* HAZARD STATUS */}
        <div className="ac-card">
          <div className="ac-card-heading">
            <Flame size={20} />
            <span>Hazard Status</span>
          </div>

          <h2 className={`ac-status-${hazard.className}`}>
            {hazard.label}
          </h2>

          <p>{hazard.description}</p>

          <span className={`ac-status ${hazard.className}`}>
            HAZARD TELEMETRY
          </span>
        </div>

        {/* SYSTEM HEALTH */}
        <div className="ac-card">
          <div className="ac-card-heading">
            <ShieldCheck size={20} />
            <span>System Health</span>
          </div>

          <h2 className={`ac-status-${health.className}`}>
            {health.label}
          </h2>

          <p>{health.description}</p>

          <span className={`ac-status ${health.className}`}>
            HEALTH TELEMETRY
          </span>
        </div>

        {/* CONTROLLER */}
        <div className="ac-card">
          <div className="ac-card-heading">
            <Power size={20} />
            <span>Controller Status</span>
          </div>

          <h2>
            {latest ? (systemReady ? "READY" : "NOT READY") : "UNKNOWN"}
          </h2>

          <p>
            {latest
              ? "Arduino controller readiness flag"
              : "Waiting for controller telemetry"}
          </p>

          <span className={`ac-status ${systemReady ? "safe" : "warning"}`}>
            {latest ? (systemReady ? "SYSTEM READY" : "CHECK SYSTEM") : "NO DATA"}
          </span>
        </div>

      </div>

      {/* RESPONSE PANEL */}
      <section className="ac-panel">

        <div className="ac-panel-heading">
          <div>
            <h2>Automatic Response Overview</h2>

            <p>
              Response state reported by the Arduino controller.
            </p>
          </div>

          <Settings2 size={22} />
        </div>

        <div className="ac-response-box">

          <div className="ac-response-icon">
            {act >= 2 ? (
              <ShieldAlert size={30} />
            ) : act === 1 ? (
              <AlertTriangle size={30} />
            ) : (
              <ShieldCheck size={30} />
            )}
          </div>

          <div className="ac-response-content">
            <span>CURRENT RESPONSE MODE</span>

            <h2>{actuator.label}</h2>

            <p>{actuator.description}</p>
          </div>

          <div className={`ac-response-indicator ${actuator.className}`}>
            {act === null ? "UNKNOWN" : actuator.label}
          </div>

        </div>

        <div className="ac-control-grid">

          {/* EXHAUST FAN */}
          <div className="ac-control-card">

            <div className="ac-control-icon">
              <Fan size={28} />
            </div>

            <h3>Exhaust Fan</h3>

            <p>
              Local automatic exhaust subsystem controlled by the
              Arduino relay.
            </p>

            <div className="ac-hardware-state">
              <Activity size={16} />

              <span>Physical state not independently confirmed</span>
            </div>

            <button disabled className="ac-disabled-button">
              <Power size={16} />
              Local Automatic Control
            </button>

          </div>

          {/* ISOLATION VALVE */}
          <div className="ac-control-card">

            <div className="ac-control-icon">
              <Lock size={28} />
            </div>

            <h3>Isolation Valve</h3>

            <p>
              Isolation subsystem. Independent valve-position
              feedback is not currently available.
            </p>

            <div className="ac-hardware-state">
              <Activity size={16} />

              <span>Physical position not independently confirmed</span>
            </div>

            <button disabled className="ac-disabled-button">
              <Power size={16} />
              Local Automatic Control
            </button>

          </div>

        </div>

        <div className="ac-manual-note">
          <AlertTriangle size={18} />

          <p>
            Website controls are disabled. Automatic response remains
            under local Arduino control. The dashboard only monitors
            the reported controller state and does not send actuator commands.
          </p>
        </div>

      </section>

      {/* SYSTEM INFORMATION */}
      <section className="ac-panel">

        <div className="ac-panel-heading">
          <div>
            <h2>System Information</h2>

            <p>
              Latest telemetry received from AeroSentinel.
            </p>
          </div>

          <Activity size={22} />
        </div>

        <div className="ac-info-grid">

          <div className="ac-info-item">
            <span>Actuator Code</span>
            <strong>{act ?? "--"}</strong>
          </div>

          <div className="ac-info-item">
            <span>Hazard Code</span>
            <strong>{haz ?? "--"}</strong>
          </div>

          <div className="ac-info-item">
            <span>Health Code</span>
            <strong>{hlt ?? "--"}</strong>
          </div>

          <div className="ac-info-item">
            <span>Sequence Number</span>
            <strong>{latest?.seq ?? "--"}</strong>
          </div>

          <div className="ac-info-item">
            <span>Controller Ready</span>
            <strong>{latest ? (systemReady ? "YES" : "NO") : "--"}</strong>
          </div>

          <div className="ac-info-item">
            <span>Last Received</span>
            <strong>{formatTime(timestamp)}</strong>
          </div>

        </div>

      </section>

      {/* EVENT HISTORY */}
      <section className="ac-panel">

        <div className="ac-panel-heading">
          <div>
            <h2>Actuation Event History</h2>

            <p>
              Events derived from stored controller telemetry.
            </p>
          </div>

          <Clock size={22} />
        </div>

        {events.length > 0 ? (

          <div className="ac-event-list">

            {events.map((event, index) => (

              <div className="ac-event" key={`${event.time}-${index}`}>

                <div className="ac-event-icon">
                  {event.status === "CRITICAL" ? (
                    <ShieldAlert size={18} />
                  ) : event.status === "WARNING" ? (
                    <CircleAlert size={18} />
                  ) : (
                    <CircleCheck size={18} />
                  )}
                </div>

                <div className="ac-event-info">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>

                <div className="ac-event-meta">

                  <span>{formatTime(event.time)}</span>

                  <small
                    className={
                      event.status === "CRITICAL"
                        ? "ac-event-critical"
                        : event.status === "WARNING"
                          ? "ac-event-warning"
                          : "ac-event-info-status"
                    }
                  >
                    {event.status}
                  </small>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="ac-empty-state">
            <Clock size={28} />

            <h3>No Event History Available</h3>

            <p>
              Events will appear when controller telemetry changes
              are available.
            </p>
          </div>

        )}

      </section>

      {/* FOOTER */}
      <div className="ac-footer-note">
        <ShieldCheck size={18} />

        <p>
          AeroSentinel prototype monitoring interface. Sensor and
          actuator telemetry are not a substitute for certified
          gas detection, physical actuator feedback, or independent
          safety systems.
        </p>
      </div>

    </main>
  );
}

export default Actuation;