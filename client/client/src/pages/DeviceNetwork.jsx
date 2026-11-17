import { useEffect, useState } from "react";

import {
  Cpu,
  Wifi,
  Radio,
  Activity,
  Wind,
  Thermometer,
  Droplets,
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Network,
} from "lucide-react";

const API_URL =
  "https://aerosentinal.onrender.com/api/sensors";

const REFRESH_INTERVAL = 5000;

function DeviceNetwork() {
  const [latest, setLatest] = useState(null);
  const [apiStatus, setApiStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  // Fetch actual sensor data
  const fetchDeviceData = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("API unavailable");
      }

      const result = await response.json();

      const records = Array.isArray(result)
        ? result
        : result.sensors || result.data || [];

      setApiStatus("online");
      setLastChecked(new Date());

      if (records.length === 0) {
        setLatest(null);
        return;
      }

      // Find the newest sensor record
      const sortedRecords = [...records].sort(
        (a, b) =>
          new Date(b.receivedAt) -
          new Date(a.receivedAt)
      );

      const newest = sortedRecords[0];

      let payload = newest.payload;

      if (typeof payload === "string") {
        payload = JSON.parse(payload);
      }

      setLatest({
        ...payload,
        receivedAt: newest.receivedAt,
      });

    } catch (error) {
      console.error("Device Network API Error:", error);
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeviceData();

    const interval = setInterval(
      fetchDeviceData,
      REFRESH_INTERVAL
    );

    return () => clearInterval(interval);
  }, []);

  // Calculate actual device connectivity
  const age = latest
    ? (Date.now() - new Date(latest.receivedAt).getTime()) / 1000
    : Infinity;

  const deviceStatus =
    age <= 15
      ? "online"
      : age <= 60
      ? "stale"
      : "offline";

  const formatTime = (timestamp) => {
    if (!timestamp) return "No communication";

    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });
  };

  const getSensorStatus = (value) => {
    return value !== undefined &&
      value !== null &&
      Number.isFinite(Number(value))
      ? "online"
      : "pending";
  };

  const statusLabel = (status) => {
    if (status === "online") return "Reporting";
    if (status === "stale") return "Stale";
    if (status === "offline") return "Offline";
    if (status === "pending") return "No Data";

    return "Checking";
  };

  const devices = [
    {
      name: "ESP8266 NodeMCU",
      category: "Main IoT Controller",
      detail: "Primary wireless communication unit",
      icon: Cpu,
      status: statusLabel(deviceStatus),
      type: deviceStatus,
      protocol: "Wi-Fi",
    },
    {
      name: "MQ2 Sensor",
      category: "Combustible Gas Sensor",
      detail: `Latest reading: ${
        latest?.m1r ?? "--"
      }`,
      icon: Wind,
      status: statusLabel(
        getSensorStatus(latest?.m1r)
      ),
      type: getSensorStatus(latest?.m1r),
      protocol: "Analog",
    },
    {
      name: "MQ135 Sensor",
      category: "Air Quality Sensor",
      detail: `Latest reading: ${
        latest?.m2r ?? "--"
      }`,
      icon: Activity,
      status: statusLabel(
        getSensorStatus(latest?.m2r)
      ),
      type: getSensorStatus(latest?.m2r),
      protocol: "Analog",
    },
    {
      name: "BMP280 Sensor",
      category: "Pressure Sensor",
      detail: `Temperature: ${
        latest?.tmp ?? "--"
      } °C | Pressure: ${
        latest?.prs ?? "--"
      } hPa`,
      icon: Thermometer,
      status: statusLabel(
        getSensorStatus(latest?.prs) &&
        getSensorStatus(latest?.tmp)
          ? "online"
          : "pending"
      ),
      type:
        getSensorStatus(latest?.prs) === "online" &&
        getSensorStatus(latest?.tmp) === "online"
          ? "online"
          : "pending",
      protocol: "I2C",
    },
    {
      name: "DHT11 Sensor",
      category: "Humidity Sensor",
      detail: `Humidity: ${
        latest?.hum ?? "--"
      } %`,
      icon: Droplets,
      status: statusLabel(
        getSensorStatus(latest?.hum)
      ),
      type: getSensorStatus(latest?.hum),
      protocol: "Digital",
    },
  ];

  // Services: only claim statuses supported by actual checks
  const services = [
    {
      name: "API Server",
      description: "Render backend communication",
      icon: Server,
      status:
        apiStatus === "online"
          ? "Reachable"
          : apiStatus === "offline"
          ? "Unavailable"
          : "Checking",
      type: apiStatus,
    },
    {
      name: "MongoDB Atlas",
      description: "Cloud sensor data retrieval",
      icon: Database,
      status:
        latest
          ? "Data Retrieved"
          : apiStatus === "online"
          ? "No Records"
          : "Unverified",
      type:
        latest
          ? "online"
          : "pending",
    },
    {
      name: "MQTT Broker",
      description: "EMQX Cloud device messaging",
      icon: Radio,
      status: "Not Verified",
      type: "pending",
    },
  ];

  const onlineCount = devices.filter(
    (device) => device.type === "online"
  ).length;

  const reportingCount = devices.filter(
    (device) =>
      device.name !== "ESP8266 NodeMCU" &&
      device.type === "online"
  ).length;

  const pendingCount = devices.length - onlineCount;

  return (
    <main className="dashboard device-network-page">

      {/* Header */}

      <div className="welcome-section">
        <div>
          <span className="section-eyebrow">
            HARDWARE & CONNECTIVITY MANAGEMENT
          </span>

          <h1>Device Network</h1>

          <p>
            Monitor actual hardware telemetry and
            cloud communication status.
          </p>
        </div>

        <div className="overview-date">
          <Network size={17} />
          NETWORK OVERVIEW
        </div>
      </div>

      {/* Network Summary */}

      <div className="metrics-grid">

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon cyan">
              <Cpu size={21} />
            </div>

            <span className="metric-status">
              HARDWARE
            </span>
          </div>

          <p className="metric-title">
            Connected Devices
          </p>

          <div className="metric-value">
            {loading ? "--" : onlineCount}
            <span>/5</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon blue">
              <Server size={21} />
            </div>

            <span className="metric-status">
              SERVICES
            </span>
          </div>

          <p className="metric-title">
            API Server
          </p>

          <div className="metric-value">
            {apiStatus === "online"
              ? "ONLINE"
              : apiStatus === "offline"
              ? "OFFLINE"
              : "CHECKING"}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon purple">
              <Wifi size={21} />
            </div>

            <span className="metric-status">
              NETWORK
            </span>
          </div>

          <p className="metric-title">
            ESP8266 Status
          </p>

          <div className="metric-value">
            {loading
              ? "CHECKING"
              : deviceStatus === "online"
              ? "LIVE"
              : deviceStatus === "stale"
              ? "STALE"
              : "OFFLINE"}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <div className="metric-icon orange">
              <AlertCircle size={21} />
            </div>

            <span className="metric-status">
              HARDWARE
            </span>
          </div>

          <p className="metric-title">
            Pending Devices
          </p>

          <div className="metric-value">
            {loading ? "--" : pendingCount}
          </div>
        </div>

      </div>

      {/* Hardware Devices */}

      <div className="panel device-section">

        <div className="panel-header">
          <div>
            <h3>Hardware Devices</h3>

            <p>
              Live sensor reporting and controller status
            </p>
          </div>

          <span className="active-tag">
            5 REGISTERED
          </span>
        </div>

        <div className="device-list">

          {devices.map((device, index) => {

            const Icon = device.icon;

            return (
              <div
                className="device-row"
                key={index}
              >

                <div className="device-icon">
                  <Icon size={23} />
                </div>

                <div className="device-info">
                  <strong>{device.name}</strong>

                  <small>{device.category}</small>

                  <p>{device.detail}</p>
                </div>

                <div className="device-protocol">
                  {device.protocol}
                </div>

                <div
                  className={`device-status ${device.type}`}
                >

                  {device.type === "online" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <AlertCircle size={15} />
                  )}

                  {loading ? "Checking" : device.status}

                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Communication Services */}

      <div className="panel device-section">

        <div className="panel-header">
          <div>
            <h3>Communication Services</h3>

            <p>
              Backend and cloud infrastructure
            </p>
          </div>

          <span className="active-tag">
            SERVICE STATUS
          </span>
        </div>

        <div className="service-grid">

          {services.map((service, index) => {

            const Icon = service.icon;

            return (
              <div
                className="service-card"
                key={index}
              >

                <div className="service-card-top">

                  <div className="device-icon">
                    <Icon size={23} />
                  </div>

                  <span className="service-online">

                    <span
                      className="live-dot"
                    ></span>

                    {service.status}

                  </span>

                </div>

                <h3>{service.name}</h3>

                <p>{service.description}</p>

              </div>
            );

          })}

        </div>

      </div>

      {/* Network Information */}

      <div className="analytics-insight">

        <Network size={23} />

        <div>
          <h3>Network Information</h3>

          <p>
            Last communication: {formatTime(
              latest?.receivedAt
            )}
            <br />

            API last checked: {lastChecked
              ? formatTime(lastChecked)
              : "Waiting for response"}
            <br />

            Automatic refresh: Every 5 seconds.
            Device connectivity is determined by
            actual telemetry timestamps.
          </p>
        </div>

      </div>

    </main>
  );
}

export default DeviceNetwork;