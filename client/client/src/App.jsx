
// // import { useState, useEffect } from 'react'

// // function App() {
// //   const [sensors, setSensors] = useState([])
// //   const [loading, setLoading] = useState(true)
// //   const [error, setError] = useState('')

// //   // Fetch sensor data from Express API
// //   const fetchSensors = async () => {
// //     try {
// //       const response = await fetch('http://localhost:5000/api/sensors')

// //       if (!response.ok) {
// //         throw new Error('Failed to fetch sensor data')
// //       }

// //       const data = await response.json()
// //       setSensors(data)
// //       setError('')
// //     } catch (err) {
// //       setError(err.message)
// //     } finally {
// //       setLoading(false)
// //     }
// //   }

// //   // Fetch data when page loads and refresh every 3 seconds
// //   useEffect(() => {
// //     fetchSensors()

// //     const interval = setInterval(fetchSensors, 3000)

// //     return () => clearInterval(interval)
// //   }, [])

// //   const latest = sensors[0]

// //   return (
// //     <div style={{
// //       minHeight: '100vh',
// //       background: '#101827',
// //       color: 'white',
// //       padding: '30px',
// //       fontFamily: 'Arial'
// //     }}>

// //       <h1 style={{ color: '#38bdf8' }}>
// //         AeroSentinal
// //       </h1>

// //       <p>IoT Gas Monitoring Dashboard</p>

// //       <hr />

// //       <h2>System Status</h2>

// //       <p>
// //         API Status: {error ? 'Disconnected' : 'Connected'}
// //       </p>

// //       <h2>Latest Sensor Reading</h2>

// //       {loading ? (
// //         <p>Loading sensor data...</p>
// //       ) : error ? (
// //         <p style={{ color: '#f87171' }}>{error}</p>
// //       ) : latest ? (
// //         <div style={{
// //           background: '#1e293b',
// //           padding: '20px',
// //           borderRadius: '12px'
// //         }}>
// //           <h3>Latest Message</h3>

// //           <p>{latest.payload}</p>

// //           <p>Topic: {latest.topic}</p>

// //           <p>
// //             Received: {
// //               latest.receivedAt
// //                 ? new Date(latest.receivedAt).toLocaleString()
// //                 : 'Unknown'
// //             }
// //           </p>
// //         </div>
// //       ) : (
// //         <p>No sensor data available yet.</p>
// //       )}

// //       <h2>Sensor History</h2>

// //       {sensors.slice(0, 10).map((sensor) => (
// //         <div
// //           key={sensor._id}
// //           style={{
// //             background: '#1e293b',
// //             padding: '15px',
// //             marginBottom: '10px',
// //             borderRadius: '8px'
// //           }}
// //         >
// //           <p><strong>Message:</strong> {sensor.payload}</p>
// //           <p><strong>Topic:</strong> {sensor.topic}</p>
// //           <small>
// //             {sensor.receivedAt
// //               ? new Date(sensor.receivedAt).toLocaleString()
// //               : 'Unknown'}
// //           </small>
// //         </div>
// //       ))}

// //     </div>
// //   )
// // }

// // export default App
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   ReferenceLine
// } from 'recharts';
// import {
//   Activity,
//   Wind,
//   Thermometer,
//   Droplets,
//   AlertOctagon,
//   ShieldCheck,
//   Power,
//   Fan,
//   RefreshCw
// } from 'lucide-react';

// const INITIAL_DATA = Array.from({ length: 20 }, (_, i) => ({
//   time: `${i}s`,
//   vocPPM: 40 + Math.random() * 5,
//   combustiblePPM: 10 + Math.random() * 2,
// }));

// export default function AeroSentinelApp() {
//   const [systemState, setSystemState] = useState('SAFE'); // 'SAFE' | 'WARNING' | 'CRITICAL'
//   const [manualOverride, setManualOverride] = useState(false);
//   const [chartData, setChartData] = useState(INITIAL_DATA);
//   const [telemetry, setTelemetry] = useState({
//     vocPPM: 42.5,
//     combustiblePPM: 12.1,
//     tempC: 26.4,
//     humidity: 55.2
//   });

//   const [engine, setEngine] = useState({
//     dppm_dt: 0.05,
//     projectedBreach: false
//   });

//   const [hardware, setHardware] = useState({
//     valve: 'OPEN',
//     fan: 'OFF',
//     pump: 'ON'
//   });

//   const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);

//   // Simulation Loop
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setChartData(prevData => {
//         const lastPoint = prevData[prevData.length - 1];

//         // Random walk or forced spike
//         let vocDelta = (Math.random() - 0.5) * 2;
//         let combDelta = (Math.random() - 0.5) * 1;

//         if (isSimulatingLeak) {
//           vocDelta = Math.random() * 15 + 5; // Rapid increase
//           combDelta = Math.random() * 8 + 2;
//         }

//         const newVoc = Math.max(0, lastPoint.vocPPM + vocDelta);
//         const newComb = Math.max(0, lastPoint.combustiblePPM + combDelta);

//         // Calculate derivative (simplified dPPM/dt over 1 tick)
//         const currentDppmDt = newVoc - lastPoint.vocPPM;

//         // Predictive Logic Simulation
//         let newState = 'SAFE';
//         let projected = false;

//         if (currentDppmDt > 5 || newVoc > 150) {
//           newState = 'CRITICAL';
//           projected = true;
//         } else if (currentDppmDt > 2 || newVoc > 100) {
//           newState = 'WARNING';
//           projected = true;
//         }

//         // Update states
//         setSystemState(newState);
//         setEngine({
//           dppm_dt: currentDppmDt.toFixed(2),
//           projectedBreach: projected
//         });

//         // Update Hardware Matrix based on state
//         if (newState === 'CRITICAL' && !manualOverride) {
//           setHardware({ valve: 'CLOSED (FAIL-SAFE)', fan: 'ON (PURGE)', pump: 'ON' });
//         } else if (newState === 'SAFE' && !manualOverride) {
//           setHardware({ valve: 'OPEN (HOLDING)', fan: 'OFF', pump: 'ON' });
//         }

//         // Update current reading displays
//         setTelemetry(prev => ({
//           ...prev,
//           vocPPM: newVoc.toFixed(1),
//           combustiblePPM: newComb.toFixed(1),
//           // Slight temp/humidity fluctuations
//           tempC: (prev.tempC + (Math.random() - 0.5) * 0.1),
//           humidity: (prev.humidity + (Math.random() - 0.5) * 0.2)
//         }));

//         const newData = [...prevData.slice(1), {
//           time: new Date().toLocaleTimeString('en-US', { hour12: false, second: '2-digit', minute:'2-digit', hour:'2-digit'}),
//           vocPPM: newVoc,
//           combustiblePPM: newComb,
//         }];

//         return newData;
//       });
//     }, 2000); // 2 second MQTT telemetry interval

//     return () => clearInterval(interval);
//   }, [isSimulatingLeak, manualOverride]);

//   const toggleLeak = () => {
//     setIsSimulatingLeak(!isSimulatingLeak);
//   };

//   const getStatusColor = () => {
//     if (systemState === 'CRITICAL') return 'bg-red-500/20 text-red-400 border-red-500/50';
//     if (systemState === 'WARNING') return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
//     return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 md:p-8 selection:bg-cyan-900">

//       {/* Header & Global Status */}
//       <header className="max-w-7xl mx-auto mb-8">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
//               <Activity className="text-cyan-400" />
//               AeroSentinel
//             </h1>
//             <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest font-semibold">Active Predictive Edge Gateway</p>
//           </div>

//           <button
//             onClick={toggleLeak}
//             className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 border ${
//               isSimulatingLeak
//                 ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
//                 : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
//             }`}
//           >
//             {isSimulatingLeak ? 'STOP SIMULATION' : 'SIMULATE GAS LEAK'}
//           </button>
//         </div>

//         {/* Hero Banner */}
//         <div className={`p-4 rounded-xl border flex items-center justify-between shadow-lg transition-colors duration-500 ${getStatusColor()}`}>
//           <div className="flex items-center gap-4">
//             {systemState === 'CRITICAL' ? <AlertOctagon size={32} className="animate-pulse" /> : <ShieldCheck size={32} />}
//             <div>
//               <h2 className="text-xl font-bold tracking-wider">
//                 {systemState === 'CRITICAL' ? 'CRITICAL LOCKDOWN INITIATED' : 'SYSTEM OPTIMAL: ACTIVE ASPIRATION'}
//               </h2>
//               <p className="text-sm opacity-80 mt-1">
//                 {systemState === 'CRITICAL'
//                   ? 'Hazard projected. Solenoid valve isolated. Exhaust purge active.'
//                   : 'Monitoring continuous 60-second spatial buffer at the edge.'}
//               </p>
//             </div>
//           </div>
//           <div className="text-right hidden sm:block">
//             <div className="text-xs uppercase tracking-wider opacity-70">Override Switch</div>
//             <div className="font-mono font-bold">{manualOverride ? 'ENGAGED' : 'INACTIVE'}</div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

//         {/* Telemetry Cards - Top Row */}
//         <div className="col-span-1 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
//           <StatCard icon={<Wind className="text-cyan-400"/>} title="MQ-135 VOCs" value={telemetry.vocPPM} unit="PPM" />
//           <StatCard icon={<Activity className="text-orange-400"/>} title="MQ-2 Combustible" value={telemetry.combustiblePPM} unit="PPM" />
//           <StatCard icon={<Thermometer className="text-red-400"/>} title="BME280 Temp" value={telemetry.tempC.toFixed(1)} unit="°C" />
//           <StatCard icon={<Droplets className="text-blue-400"/>} title="BME280 Humidity" value={telemetry.humidity.toFixed(1)} unit="%" />
//         </div>

//         {/* Predictive Analytics Engine - Main Chart Area */}
//         <div className="col-span-1 md:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-lg font-bold text-white">Predictive Edge Engine</h3>
//               <p className="text-xs text-slate-500">Real-time projection from 60s SRAM Ring Buffer</p>
//             </div>
//             <div className="text-right flex gap-4">
//               <div className="bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
//                 <span className="text-xs text-slate-500 block">Rate (dPPM/dt)</span>
//                 <span className={`font-mono font-bold ${engine.projectedBreach ? 'text-red-400' : 'text-emerald-400'}`}>
//                   {engine.dppm_dt > 0 ? '+' : ''}{engine.dppm_dt}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="h-72 w-full">
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
//                 <XAxis dataKey="time" stroke="#475569" fontSize={12} tickMargin={10} />
//                 <YAxis stroke="#475569" fontSize={12} domain={[0, 200]} />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
//                   itemStyle={{ color: '#38bdf8' }}
//                 />
//                 <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Hazard Threshold', fill: '#ef4444', fontSize: 12 }} />
//                 <Line
//                   type="monotone"
//                   dataKey="vocPPM"
//                   name="VOC (PPM)"
//                   stroke="#22d3ee"
//                   strokeWidth={2}
//                   dot={false}
//                   isAnimationActive={false}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="combustiblePPM"
//                   name="Combustible (PPM)"
//                   stroke="#fb923c"
//                   strokeWidth={2}
//                   dot={false}
//                   isAnimationActive={false}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Hardware Action Matrix */}
//         <div className="col-span-1 md:col-span-4 flex flex-col gap-4">
//           <h3 className="text-lg font-bold text-white mb-1">Dual-Actuation Matrix</h3>

//           {/* Solenoid Valve */}
//           <HardwareCard
//             title="Solenoid Gas Valve"
//             status={hardware.valve}
//             icon={<Power size={20} />}
//             isCritical={systemState === 'CRITICAL'}
//             criticalText="CLOSED (FAIL-SAFE)"
//           />

//           {/* Exhaust Fan */}
//           <HardwareCard
//             title="Purge Exhaust Fan"
//             status={hardware.fan}
//             icon={<Fan size={20} className={hardware.fan.includes('ON') ? 'animate-spin text-cyan-400' : ''} />}
//             isCritical={systemState === 'CRITICAL'}
//             criticalText="ON (PURGE)"
//           />

//           {/* Aspiration Pump */}
//           <HardwareCard
//             title="Micro Air Pump"
//             status={hardware.pump}
//             icon={<RefreshCw size={20} className="animate-spin text-emerald-400" />}
//             isCritical={false}
//             criticalText=""
//             desc="Dual-Intake Active Aspiration"
//           />
//         </div>

//       </main>
//     </div>
//   );
// }

// // UI Helper Components
// function StatCard({ icon, title, value, unit }) {
//   return (
//     <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col shadow-sm">
//       <div className="flex items-center gap-2 mb-3 opacity-70">
//         {icon}
//         <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
//       </div>
//       <div className="flex items-end gap-1 mt-auto">
//         <span className="text-3xl font-bold text-white font-mono">{value}</span>
//         <span className="text-sm font-medium text-slate-500 mb-1">{unit}</span>
//       </div>
//     </div>
//   );
// }

// function HardwareCard({ title, status, icon, isCritical, criticalText, desc }) {
//   const isTriggered = isCritical && status === criticalText;

//   return (
//     <div className={`border rounded-xl p-4 transition-colors duration-300 ${
//       isTriggered ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900 border-slate-800'
//     }`}>
//       <div className="flex justify-between items-center mb-2">
//         <div className="flex items-center gap-3">
//           <div className={`p-2 rounded-lg ${isTriggered ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
//             {icon}
//           </div>
//           <div>
//             <h4 className="font-semibold text-white text-sm">{title}</h4>
//             {desc && <p className="text-xs text-slate-500">{desc}</p>}
//           </div>
//         </div>
//       </div>

//       <div className="mt-4 flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
//         <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">State</span>
//         <span className={`font-mono text-sm font-bold ${
//           isTriggered ? 'text-red-400' :
//           status.includes('ON') || status.includes('OPEN') ? 'text-emerald-400' : 'text-slate-400'
//         }`}>
//           {status}
//         </span>
//       </div>
//     </div>
//   );
// }


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
        ) : (

          <main className="dashboard placeholder-page">
            <span className="section-eyebrow">AEROSENTINEL MODULE</span>
            <h1>{activePage}</h1>
            <p>This module will be developed in our next stages.</p>
          </main>

        )}

      </div>

    </div>

  );

}


export default App;