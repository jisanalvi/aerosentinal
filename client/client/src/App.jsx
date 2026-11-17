import {
  Activity,
  LayoutDashboard,
  Radio,
  BrainCircuit,
  Wind,
  Zap,
  ChartNoAxesCombined,
  Network,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Thermometer,
  Droplets,
  Gauge,
  ShieldCheck,
  Menu,
  CircleHelp
} from "lucide-react";

import { useState, useEffect } from "react";

import "./index.css";

import LiveMonitoring from "./pages/LiveMonitoring";
import PredictionEngine from "./pages/PredictionEngine";
import AirflowSystem from "./pages/AirflowSystem";
import Actuation from "./pages/Actuation";
import Analytics from "./pages/Analytics";
import DeviceNetwork from "./pages/DeviceNetwork";

const API_URL =
  "https://aerosentinal.onrender.com/api/sensors/latest";


const menuItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Live Monitoring", icon: Radio },
  { name: "Prediction Engine", icon: BrainCircuit },
  { name: "Airflow System", icon: Wind },
  { name: "Actuation", icon: Zap },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "Device Network", icon: Network }
];


// SIDEBAR

function Sidebar({ activePage, setActivePage, open, closeSidebar }) {

  return (

    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>

      <div className="brand">

        <div className="brand-icon">
          <Activity size={25} />
        </div>

        <div>
          <h2>AERO<span>SENTINEL</span></h2>
          <p>INTELLIGENT SAFETY SYSTEM</p>
        </div>

      </div>

      <div className="sidebar-label">
        MAIN MENU
      </div>

      <nav>

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => {
                setActivePage(item.name);
                closeSidebar();
              }}
            >

              <Icon size={19} />

              <span>{item.name}</span>

              {activePage === item.name && (
                <div className="active-indicator"></div>
              )}

            </button>

          );

        })}

      </nav>

      <div className="sidebar-bottom">

        <button className="nav-item">
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <button className="nav-item">
          <CircleHelp size={19} />
          <span>Help & Support</span>
        </button>

        <div className="system-mini-card">

          <div className="mini-status">
            AEROSENTINEL CLOUD
          </div>

          <p>Environmental monitoring platform.</p>

          <div className="system-progress">
            <div></div>
          </div>

        </div>

        <div className="version">
          AEROSENTINEL v1.0.0
        </div>

      </div>

    </aside>

  );

}


// TOPBAR

function Topbar({ activePage, toggleSidebar }) {

  return (

    <header className="topbar">

      <div className="topbar-left">

        <button className="mobile-menu" onClick={toggleSidebar}>
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">
            WORKSPACE / <span>{activePage.toUpperCase()}</span>
          </div>

          <h2>{activePage}</h2>
        </div>

      </div>

      <div className="topbar-right">

        <button className="icon-button">
          <Search size={19} />
        </button>

        <button className="icon-button notification">
          <Bell size={19} />
          <span></span>
        </button>

        <div className="profile">

          <div className="profile-avatar">
            AS
          </div>

          <div className="profile-info">
            <strong>Administrator</strong>
            <small>Control Center</small>
          </div>

          <ChevronDown size={15} />

        </div>

      </div>

    </header>

  );

}


// METRIC CARD

function MetricCard({ title, value, unit, icon: Icon, status, color }) {

  return (

    <div className="metric-card">

      <div className="metric-top">

        <div className={`metric-icon ${color}`}>
          <Icon size={21} />
        </div>

        <span className="metric-status">
          {status}
        </span>

      </div>

      <p className="metric-title">{title}</p>

      <div className="metric-value">
        {value}
        <span>{unit}</span>
      </div>

    </div>

  );

}


// OVERVIEW

function Overview() {

  const [sensorData, setSensorData] = useState(null);
  const [apiError, setApiError] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());


  // FETCH LATEST CLOUD DATA

  useEffect(() => {

    let isMounted = true;

    const fetchLatestData = async () => {

      try {

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Unable to fetch sensor data");
        }

        const result = await response.json();

        // Supports direct API response and common wrapped responses.
        const latestData = result.data || result.sensor || result;

        if (isMounted) {
          setSensorData(latestData);
          setApiError(false);
        }

      } catch (error) {

        console.error("Overview API Error:", error);

        if (isMounted) {
          setApiError(true);
        }

      }

    };


    fetchLatestData();

    const fetchInterval = setInterval(fetchLatestData, 3000);

    const clockInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);


    return () => {

      isMounted = false;

      clearInterval(fetchInterval);
      clearInterval(clockInterval);

    };

  }, []);


  // PARSE SENSOR PAYLOAD

  let parsedPayload = {};

  try {

    const payload = sensorData?.payload;

    parsedPayload =
      typeof payload === "string"
        ? JSON.parse(payload || "{}")
        : payload || {};

  } catch (error) {

    console.error("Payload parsing error:", error);

  }


  // GET VALID SENSOR VALUES

  const getReading = (key) => {

    const value = parsedPayload[key];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;

  };


  const temperature = getReading("tmp");
  const humidity = getReading("hum");
  const pressure = getReading("prs");
  const hazard = getReading("haz");


  // DATA FRESHNESS

  const receivedTime = sensorData?.receivedAt
    ? new Date(sensorData.receivedAt).getTime()
    : null;

  const dataAgeSeconds =
    receivedTime !== null && Number.isFinite(receivedTime)
      ? (currentTime - receivedTime) / 1000
      : null;


  const getConnectionStatus = () => {

    if (dataAgeSeconds === null || dataAgeSeconds < 0) {
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


  const connectionStatus = getConnectionStatus();


  // HAZARD STATUS

  const hazardStatus =
    hazard === 0
      ? "NO HAZARD"
      : hazard === 1
      ? "HAZARD DETECTED"
      : "UNKNOWN";


  // GLOBAL SYSTEM STATUS

  let globalStatus = "WAITING";

  if (connectionStatus === "OFFLINE") {
    globalStatus = "OFFLINE";
  } else if (connectionStatus === "STALE") {
    globalStatus = "STALE";
  } else if (connectionStatus === "LIVE" && hazard === 1) {
    globalStatus = "DANGER";
  } else if (connectionStatus === "LIVE" && hazard === 0) {
    globalStatus = "SAFE";
  }


  const lastUpdate =
    receivedTime !== null && Number.isFinite(receivedTime)
      ? new Date(receivedTime).toLocaleString()
      : "Waiting for sensor data";


  const formatValue = (value) =>
    value === null ? "--" : value.toFixed(1);


  // GLOBAL STATUS DESCRIPTION

  const getStatusDescription = () => {

    if (globalStatus === "SAFE") {
      return "Live communication established. No hazard reported.";
    }

    if (globalStatus === "DANGER") {
      return "The incoming sensor payload reports a hazard.";
    }

    if (globalStatus === "STALE") {
      return "Sensor communication has become delayed.";
    }

    if (globalStatus === "OFFLINE") {
      return "No recent sensor communication received.";
    }

    return "Waiting for the first valid sensor update.";

  };


  return (

    <main className="dashboard">

      {/* HEADER */}

      <div className="welcome-section">

        <div>

          <span className="section-eyebrow">
            ENVIRONMENTAL INTELLIGENCE PLATFORM
          </span>

          <h1>
            AeroSentinel Overview <span>✦</span>
          </h1>

          <p>
            A real-time summary of your environmental safety system.
          </p>

        </div>


        <div className="overview-date">
          <Activity size={17} />
          CLOUD MONITORING
        </div>

      </div>


      {/* GLOBAL STATUS */}

      <div className="system-banner">

        <div className="banner-icon">
          <ShieldCheck size={26} />
        </div>

        <div className="banner-text">

          <strong>
            {globalStatus === "SAFE"
              ? "System Operating Normally"
              : globalStatus === "DANGER"
              ? "Hazard Detected"
              : globalStatus === "STALE"
              ? "Communication Delayed"
              : globalStatus === "OFFLINE"
              ? "System Offline"
              : "Waiting for Sensor Data"}
          </strong>

          <p>{getStatusDescription()}</p>

        </div>

        <div className="banner-right">

          <span
            className={
              connectionStatus === "LIVE"
                ? "live-dot"
                : ""
            }
          ></span>

          {globalStatus}

        </div>

      </div>


      {/* ENVIRONMENTAL METRICS */}

      <div className="metrics-grid">

        <MetricCard
          title="Temperature"
          value={formatValue(temperature)}
          unit="°C"
          icon={Thermometer}
          status={connectionStatus}
          color="purple"
        />

        <MetricCard
          title="Humidity"
          value={formatValue(humidity)}
          unit="%"
          icon={Droplets}
          status={connectionStatus}
          color="blue"
        />

        <MetricCard
          title="Atmospheric Pressure"
          value={formatValue(pressure)}
          unit="hPa"
          icon={Gauge}
          status={connectionStatus}
          color="cyan"
        />

      </div>


      {/* SYSTEM SUMMARY */}

      <div className="bottom-grid">

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>System Summary</h3>
              <p>Current operating conditions</p>
            </div>

            <ShieldCheck size={22} />

          </div>


          <div className="actuator-item">

            <div className="actuator-icon">
              <Radio size={22} />
            </div>

            <div className="actuator-info">
              <strong>ESP8266 Connectivity</strong>
              <small>Cloud communication</small>
            </div>

            <span className="actuator-state">
              {connectionStatus}
            </span>

          </div>


          <div className="actuator-item">

            <div className="actuator-icon">
              <ShieldCheck size={22} />
            </div>

            <div className="actuator-info">
              <strong>Hazard Detection</strong>
              <small>ESP8266 reported state</small>
            </div>

            <span className="actuator-state">
              {hazardStatus}
            </span>

          </div>


          <div className="actuator-item">

            <div className="actuator-icon">
              <Activity size={22} />
            </div>

            <div className="actuator-info">
              <strong>API Communication</strong>
              <small>Render cloud backend</small>
            </div>

            <span className="actuator-state">
              {apiError ? "ERROR" : "CONNECTED"}
            </span>

          </div>

        </div>


        {/* LAST COMMUNICATION */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h3>Communication Status</h3>
              <p>Latest received sensor packet</p>
            </div>

            <Radio size={22} />

          </div>


          <div style={{ padding: "20px 0" }}>

            <p className="metric-title">
              LAST COMMUNICATION
            </p>

            <h3 style={{ marginTop: "10px", wordBreak: "break-word" }}>
              {lastUpdate}
            </h3>

            <p style={{ marginTop: "18px", color: "#94a3b8" }}>

              {dataAgeSeconds !== null &&
              dataAgeSeconds >= 0
                ? `Data age: ${Math.floor(dataAgeSeconds)} seconds`
                : "Waiting for communication"}

            </p>

          </div>

        </div>

      </div>


      {/* FOOTER */}

      <footer className="dashboard-footer">

        <span>AEROSENTINEL © 2026</span>

        <span>ENGINEERED FOR A SAFER ENVIRONMENT</span>

      </footer>

    </main>

  );

}


// MAIN APP

function App() {

  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (

    <div className="app-layout">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />


      <div className="main-area">

        <Topbar
          activePage={activePage}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />


        {activePage === "Overview" ? (

          <Overview />

        ) : activePage === "Live Monitoring" ? (

          <LiveMonitoring />

        ) : activePage === "Prediction Engine" ? (

          <PredictionEngine />

        ) : activePage === "Airflow System" ? (

          <AirflowSystem />

        ) : activePage === "Actuation" ? (

          <Actuation />

        ) : activePage === "Analytics" ? (

          <Analytics />

        ) : activePage === "Device Network" ? (

          <DeviceNetwork />

        ) : (

          <main className="dashboard placeholder-page">

            <span className="section-eyebrow">
              AEROSENTINEL MODULE
            </span>

            <h1>{activePage}</h1>

            <p>
              This module will be developed in our next stages.
            </p>

          </main>

        )}

      </div>

    </div>

  );

}


export default App;