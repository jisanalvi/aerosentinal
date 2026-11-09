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
  ArrowUpRight,
  Fan,
  Power,
  Menu,
  CircleHelp
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useState } from "react";

import "./index.css";
import LiveMonitoring from "./pages/LiveMonitoring";
import PredictionEngine from "./pages/PredictionEngine";
import AirflowSystem from "./pages/AirflowSystem";
import Actuation from "./pages/Actuation";
import Analytics from "./pages/Analytics";
import DeviceNetwork from "./pages/DeviceNetwork";


const chartData = [
  { time: "10:00", gas: 85 },
  { time: "10:05", gas: 92 },
  { time: "10:10", gas: 89 },
  { time: "10:15", gas: 105 },
  { time: "10:20", gas: 110 },
  { time: "10:25", gas: 103 },
  { time: "10:30", gas: 125 },
  { time: "10:35", gas: 118 },
  { time: "10:40", gas: 125 }
];


const menuItems = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Live Monitoring", icon: Radio },
  { name: "Prediction Engine", icon: BrainCircuit },
  { name: "Airflow System", icon: Wind },
  { name: "Actuation", icon: Zap },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "Device Network", icon: Network }
];


function Sidebar({ activePage, setActivePage, open }) {

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
              onClick={() => setActivePage(item.name)}
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
            <span className="live-dot"></span>
            SYSTEM ONLINE
          </div>

          <p>All monitoring services active.</p>

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

        <div className="connection-badge">
          <span className="live-dot"></span>
          SYSTEM ONLINE
        </div>

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


function GasChart() {

  return (

    <div className="panel chart-panel">

      <div className="panel-header">

        <div>
          <h3>Gas Concentration</h3>
          <p>Historical sensor readings</p>
        </div>

        <button className="period-button">
          Last 40 min
          <ChevronDown size={15} />
        </button>

      </div>


      <div className="chart-legend">
        <span className="legend-dot"></span>
        Gas sensor reading
      </div>


      <div className="chart-container">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={chartData}>

            <defs>
              <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">

                <stop offset="0%" stopColor="#19c6d9" stopOpacity={0.3} />

                <stop offset="95%" stopColor="#19c6d9" stopOpacity={0} />

              </linearGradient>
            </defs>


            <CartesianGrid
              stroke="#243344"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="#718096"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#718096"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#111e2d",
                border: "1px solid #26394b",
                borderRadius: "10px",
                color: "#fff"
              }}
            />

            <Area
              type="monotone"
              dataKey="gas"
              stroke="#19c6d9"
              strokeWidth={2.5}
              fill="url(#gasGradient)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

    </div>

  );

}


function AirflowPanel() {

  return (

    <div className="panel airflow-panel">

      <div className="panel-header">

        <div>
          <h3>Airflow Visualization</h3>
          <p>Dual-zone aspiration system</p>
        </div>

        <span className="active-tag">ACTIVE</span>

      </div>


      <div className="airflow-content">

        <div className="airflow-room">

          <div className="airflow-label ceiling">
            CEILING INTAKE
          </div>

          <div className="airflow-pipe ceiling-pipe"></div>

          <div className="airflow-arrows">
            <span>↓</span>
            <span>↓</span>
            <span>↓</span>
          </div>

          <div className="airflow-center">
            <Fan size={29} />
            <strong>AIR PUMP</strong>
            <small>Sampling chamber</small>
          </div>

          <div className="airflow-arrows bottom-arrows">
            <span>↑</span>
            <span>↑</span>
            <span>↑</span>
          </div>

          <div className="airflow-pipe floor-pipe"></div>

          <div className="airflow-label floor">
            FLOOR INTAKE
          </div>

        </div>


        <div className="airflow-info">

          <div className="intake-info">
            <span className="live-dot"></span>
            <div>
              <strong>Ceiling Intake</strong>
              <small>Sampling enabled</small>
            </div>
          </div>

          <div className="intake-info">
            <span className="live-dot"></span>
            <div>
              <strong>Floor Intake</strong>
              <small>Sampling enabled</small>
            </div>
          </div>

          <div className="intake-info">
            <span className="live-dot"></span>
            <div>
              <strong>Micro Pump</strong>
              <small>Command active</small>
            </div>
          </div>

        </div>

      </div>

    </div>

  );

}


function PredictionPanel() {

  return (

    <div className="panel prediction-panel">

      <div className="panel-header">

        <div>
          <h3>Prediction Engine</h3>
          <p>Edge-computed threat assessment</p>
        </div>

        <div className="prediction-icon">
          <BrainCircuit size={22} />
        </div>

      </div>


      <div className="prediction-status">

        <div className="prediction-circle">
          <ShieldCheck size={30} />
        </div>

        <div>
          <span className="safe-label">CURRENT ASSESSMENT</span>
          <h2>NORMAL</h2>
          <p>No active threat reported</p>
        </div>

      </div>


      <div className="prediction-details">

        <div>
          <span>Accumulation Rate</span>
          <strong>+0.8 PPM/s</strong>
        </div>

        <div>
          <span>Prediction Window</span>
          <strong>5 Minutes</strong>
        </div>

        <div>
          <span>Processing</span>
          <strong>Arduino UNO</strong>
        </div>

      </div>

    </div>

  );

}


function ActuationPanel() {

  return (

    <div className="panel actuation-panel">

      <div className="panel-header">

        <div>
          <h3>Actuation Matrix</h3>
          <p>Dual-relay output monitoring</p>
        </div>

        <Zap size={22} color="#f5b942" />

      </div>


      <div className="actuator-item">

        <div className="actuator-icon">
          <Fan size={23} />
        </div>

        <div className="actuator-info">
          <strong>Exhaust Fan</strong>
          <small>Ventilation output</small>
        </div>

        <span className="actuator-state">
          OFF
        </span>

      </div>


      <div className="actuator-item">

        <div className="actuator-icon">
          <Power size={23} />
        </div>

        <div className="actuator-info">
          <strong>Gas Isolation Valve</strong>
          <small>Solenoid output</small>
        </div>

        <span className="actuator-state safe">
          OPEN
        </span>

      </div>


      <div className="override-status">
        <span className="live-dot"></span>
        Manual override: INACTIVE
      </div>

    </div>

  );

}


function Overview() {

  return (

    <main className="dashboard">

      <div className="welcome-section">

        <div>
          <span className="section-eyebrow">
            ENVIRONMENTAL INTELLIGENCE PLATFORM
          </span>

          <h1>Good evening, Administrator <span>✦</span></h1>

          <p>
            Here's what's happening with your environmental safety network.
          </p>
        </div>


        <div className="overview-date">
          <Activity size={17} />
          LIVE MONITORING
        </div>

      </div>


      <div className="system-banner">

        <div className="banner-icon">
          <ShieldCheck size={26} />
        </div>

        <div className="banner-text">
          <strong>All Systems Operational</strong>
          <p>Your monitoring dashboard is ready.</p>
        </div>

        <div className="banner-right">
          <span className="live-dot"></span>
          OPERATIONAL
        </div>

      </div>


      <div className="metrics-grid">

        <MetricCard
          title="Gas Concentration"
          value="125"
          unit="PPM"
          icon={Gauge}
          status="DEMO DATA"
          color="cyan"
        />

        <MetricCard
          title="Accumulation Rate"
          value="+0.8"
          unit="PPM/s"
          icon={ArrowUpRight}
          status="DEMO DATA"
          color="orange"
        />

        <MetricCard
          title="Temperature"
          value="28.5"
          unit="°C"
          icon={Thermometer}
          status="DEMO DATA"
          color="purple"
        />

        <MetricCard
          title="Humidity"
          value="62"
          unit="%"
          icon={Droplets}
          status="DEMO DATA"
          color="blue"
        />

      </div>


      <div className="main-grid">

        <GasChart />

        <AirflowPanel />

      </div>


      <div className="bottom-grid">

        <PredictionPanel />

        <ActuationPanel />

      </div>


      <footer className="dashboard-footer">
        <span>AEROSENTINEL © 2026</span>
        <span>ENGINEERED FOR A SAFER ENVIRONMENT</span>
      </footer>

    </main>

  );

}


function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        open={sidebarOpen}
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
        ) : activePage === "Analytics" ?(
          <Analytics />
        ) : activePage === "Device Network" ?(
          <DeviceNetwork />
        ) : (
          <main className="dashboard placeholder-page">
            <span className="section-eyebrow">
              AEROSENTINEL MODULE
            </span>

            <h1>{activePage}</h1>

            <p>This module will be developed in our next stages.</p>
          </main>
        )}
      </div>
    </div>
  );
}


export default App;